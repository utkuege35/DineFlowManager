import React, { useEffect, useMemo } from 'react';
import { View, Text, Pressable, Alert, Platform } from 'react-native';
import { usePosContext } from '../../state/PosProvider';
import { useCategoriesProducts } from '../../hooks/useCategoriesProducts';
import { useExistingSale } from '../../hooks/useExistingSale';
import { useSubmitOrder } from '../../hooks/useSubmitOrder';
import { usePayment } from '../../hooks/usePayment';
import { useDiscount } from '../../hooks/useDiscount';
import { useTables } from '../../hooks/useTables';
import { calculateCart, calculateNewItemsTotal, calculateExistingTotal, calculateGrandTotal } from '../../utils/totals';
import { CategoryTabs } from './CategoryTabs';
import { ActionButtonBar } from './ActionButtonBar';
import { ProductGrid } from './ProductGrid';
import { CartSummary } from './CartSummary';
import { PaymentModal } from './modals/PaymentModal';
import { DiscountModal } from './modals/DiscountModal';
import { TransferModal } from './modals/TransferModal';
import { MergeModal } from './modals/MergeModal';
import { supabase } from '@/lib/supabase';
import { Table } from '../../types';

const showAlert = (title: string, message?: string, onConfirm?: () => void) => {
  if (Platform.OS === 'web') {
    const fullMessage = message ? `${title}\n\n${message}` : title;
    if (onConfirm) {
      if (window.confirm(fullMessage)) {
        onConfirm();
      }
    } else {
      window.alert(fullMessage);
    }
  } else {
    if (onConfirm) {
      Alert.alert(title, message, [
        { text: 'İptal', style: 'cancel' },
        { text: 'Tamam', onPress: onConfirm }
      ]);
    } else {
      Alert.alert(title, message);
    }
  }
};

export function OrderScreen() {
  const { state, dispatch } = usePosContext();
  const { categories, activeCat, products, loadCategories, setActiveCat } = useCategoriesProducts();
  const { loadExistingSale, deleteExistingItem, recalculateSaleTotal, loading: loadingExisting } = useExistingSale();
  const { submitting, submitOrder } = useSubmitOrder();
  const { processing: processingPayment, processPayment } = usePayment();
  const { saveDiscount } = useDiscount();
  const { tables, loadTables, isTableOccupied } = useTables();

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (state.selectedTable?.current_sale_id) {
      loadExistingSale(state.selectedTable.current_sale_id).then(({ items, discount }) => {
        dispatch({ type: 'SET_EXISTING_SALE', payload: { saleId: state.selectedTable!.current_sale_id, items } });
        dispatch({ type: 'SET_SALE_DISCOUNT', payload: discount });
      });
    }
  }, [state.selectedTable]);

  const cart = useMemo(() => calculateCart(state.orderItems), [state.orderItems]);
  const newItemsTotal = useMemo(() => calculateNewItemsTotal(cart), [cart]);
  const existingTotal = useMemo(() => calculateExistingTotal(state.existingItems), [state.existingItems]);
  const grandTotal = useMemo(
    () => calculateGrandTotal(existingTotal, newItemsTotal, state.saleDiscount),
    [existingTotal, newItemsTotal, state.saleDiscount]
  );

  const handleSubmit = async () => {
    const saleId = await submitOrder(
      cart,
      newItemsTotal,
      state.existingSaleId,
      state.selectedTable!,
      state.currentUser!,
      recalculateSaleTotal
    );

    if (saleId) {
      dispatch({ type: 'CLEAR_ORDER_ITEMS' });
      const { items, discount } = await loadExistingSale(saleId);
      dispatch({ type: 'SET_EXISTING_SALE', payload: { saleId, items } });
      dispatch({ type: 'SET_SALE_DISCOUNT', payload: discount });
    }
  };

  const handlePayment = (method: 'cash' | 'credit_card') => {
    processPayment(method, state.existingSaleId!, state.selectedTable!, () => {
      dispatch({ type: 'SHOW_MODAL', payload: { modal: 'Payment', show: false } });
      dispatch({ type: 'RESET_TO_TABLE_SELECT' });
      loadTables();
    });
  };

  const handleDiscount = async () => {
    const success = await saveDiscount(
      state.discountValue,
      state.discountType,
      state.discountTarget,
      state.existingSaleId,
      state.selectedItemForDiscount,
      recalculateSaleTotal,
      () => {
        dispatch({ type: 'SHOW_MODAL', payload: { modal: 'Discount', show: false } });
        dispatch({ type: 'SET_DISCOUNT_VALUE', payload: '' });
      }
    );

    if (success && state.existingSaleId) {
      const { items, discount } = await loadExistingSale(state.existingSaleId);
      dispatch({ type: 'SET_EXISTING_SALE', payload: { saleId: state.existingSaleId, items } });
      dispatch({ type: 'SET_SALE_DISCOUNT', payload: discount });
    }
  };

  const handleDeleteExistingItem = async (item: any) => {
    showAlert(
      'Ürün Sil',
      `${item.products?.name || 'Bu ürün'} silinecek. Onaylıyor musunuz?`,
      async () => {
        const success = await deleteExistingItem(item.id);
        if (success && state.existingSaleId) {
          await recalculateSaleTotal(state.existingSaleId);
          const { items, discount } = await loadExistingSale(state.existingSaleId);
          dispatch({ type: 'SET_EXISTING_SALE', payload: { saleId: state.existingSaleId, items } });
        }
      }
    );
  };

  const handleMerge = async () => {
    if (!state.selectedTable || !state.existingSaleId) return;

    if (state.selectedTablesForMerge.length === 0) {
      showAlert('Uyarı', 'En az bir masa seçmelisiniz.');
      return;
    }

    const mergeTableNumbers = tables
      .filter(t => state.selectedTablesForMerge.includes(t.id))
      .map(t => t.number)
      .join(', ');

    showAlert(
      'Masa Birleştir',
      `Masa ${mergeTableNumbers} → Masa ${state.selectedTable.number}\n\nSeçili masaları birleştirmek istediğinize emin misiniz?`,
      async () => {
            try {
              for (const tableId of state.selectedTablesForMerge) {
                const mergeTable = tables.find(t => t.id === tableId);
                if (!mergeTable || !mergeTable.current_sale_id) continue;

                const { data: items } = await supabase
                  .from('sale_items')
                  .select('*')
                  .eq('sale_id', mergeTable.current_sale_id);

                if (items && items.length > 0) {
                  const newItems = items.map(item => ({
                    sale_id: state.existingSaleId,
                    product_id: item.product_id,
                    qty: item.qty,
                    unit_price: item.unit_price,
                    line_total: item.line_total,
                    discount_amount: item.discount_amount,
                    discount_type: item.discount_type,
                  }));

                  await supabase.from('sale_items').insert(newItems);
                }

                await supabase
                  .from('sales')
                  .update({
                    payment_status: 'merged',
                    merged_from_sale_id: mergeTable.current_sale_id,
                  })
                  .eq('id', mergeTable.current_sale_id);

                await supabase
                  .from('restaurant_tables')
                  .update({
                    status: 'available',
                    current_sale_id: null,
                    opened_at: null,
                    is_merged: true,
                    merged_with_table_id: state.selectedTable!.id,
                  })
                  .eq('id', tableId);
              }

              await recalculateSaleTotal(state.existingSaleId!);
              const { items, discount } = await loadExistingSale(state.existingSaleId!);
              dispatch({ type: 'SET_EXISTING_SALE', payload: { saleId: state.existingSaleId, items } });
              dispatch({ type: 'SET_SALE_DISCOUNT', payload: discount });

            dispatch({ type: 'SHOW_MODAL', payload: { modal: 'Merge', show: false } });
            dispatch({ type: 'CLEAR_MERGE_SELECTION' });

            showAlert('Başarılı', `${state.selectedTablesForMerge.length} masa birleştirildi.`);
          } catch (err: any) {
            showAlert('Hata', err.message || 'Birleştirme başarısız.');
          }
      }
    );
  };

  const handleTransfer = async (targetTable: Table) => {
    if (!state.existingSaleId || !state.selectedTable) return;

    if (targetTable.id === state.selectedTable.id) {
      showAlert('Uyarı', 'Aynı masaya transfer yapamazsınız.');
      return;
    }

    if (targetTable.current_sale_id) {
      showAlert('Uyarı', 'Hedef masa dolu. Boş bir masa seçin.');
      return;
    }

    showAlert(
      'Masa Transfer',
      `Masa ${state.selectedTable.number} → Masa ${targetTable.number}\n\nSiparişi transfer etmek istediğinize emin misiniz?`,
      async () => {
            try {
              await supabase
                .from('restaurant_tables')
                .update({
                  status: 'available',
                  current_sale_id: null,
                  opened_at: null,
                })
                .eq('id', state.selectedTable!.id);

              await supabase
                .from('restaurant_tables')
                .update({
                  status: 'occupied',
                  current_sale_id: state.existingSaleId,
                  opened_at: new Date().toISOString(),
                })
                .eq('id', targetTable.id);

            dispatch({ type: 'SHOW_MODAL', payload: { modal: 'Transfer', show: false } });
            showAlert(
              'Transfer Başarılı',
              `Sipariş Masa ${targetTable.number}'e taşındı.`,
              () => {
                dispatch({ type: 'RESET_TO_TABLE_SELECT' });
                loadTables();
              }
            );
          } catch (err: any) {
            showAlert('Hata', err.message || 'Transfer başarısız.');
          }
      }
    );
  };

  return (
    <View style={{ flex: 1, marginTop: 20 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderBottomWidth: 1, borderColor: '#eee' }}>
        <View>
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
            Masa {state.selectedTable?.number}
          </Text>
          {state.currentUser && (
            <Text style={{ fontSize: 11, color: '#666' }}>
              Garson: {state.currentUser.name}
            </Text>
          )}
        </View>
        <Pressable onPress={() => dispatch({ type: 'RESET_TO_TABLE_SELECT' })}>
          <Text style={{ color: '#007AFF', fontWeight: '600' }}>← Geri</Text>
        </Pressable>
      </View>

      <View style={{ paddingHorizontal: 8, paddingVertical: 6, borderBottomWidth: 1, borderColor: '#eee' }}>
        <CategoryTabs
          categories={categories}
          activeCat={activeCat}
          onSelect={setActiveCat}
        />
      </View>

      <View style={{ flex: 1, flexDirection: 'column' }}>
        <View style={{ maxHeight: 160 }}>
          <ProductGrid
            products={products}
            onAddProduct={(product) => dispatch({ type: 'ADD_ORDER_ITEM', payload: product })}
          />
        </View>

        <View style={{ flex: 1 }}>
          <CartSummary
            loading={loadingExisting}
            existingItems={state.existingItems}
            cartItems={cart}
            saleDiscount={state.saleDiscount}
            grandTotal={grandTotal}
            onDeleteExistingItem={handleDeleteExistingItem}
            onDiscountExistingItem={(item) => {
              dispatch({ type: 'SET_DISCOUNT_MODAL_DATA', payload: { target: 'item', item } });
            }}
            onRemoveCartItem={(productId) => dispatch({ type: 'REMOVE_ORDER_ITEM', payload: productId })}
            actionButtons={
              <ActionButtonBar
                submitting={submitting}
                onSubmit={handleSubmit}
                onMerge={() => {
                  if (!state.existingSaleId) {
                    showAlert('Uyarı', 'Sadece açık siparişi olan masalar birleştirilebilir.');
                    return;
                  }
                  loadTables();
                  dispatch({ type: 'CLEAR_MERGE_SELECTION' });
                  dispatch({ type: 'SHOW_MODAL', payload: { modal: 'Merge', show: true } });
                }}
                onTransfer={() => {
                  loadTables();
                  dispatch({ type: 'SHOW_MODAL', payload: { modal: 'Transfer', show: true } });
                }}
                onDiscount={() => {
                  if (!state.existingSaleId) return;
                  dispatch({ type: 'SET_DISCOUNT_MODAL_DATA', payload: { target: 'sale' } });
                }}
                onPayment={() => dispatch({ type: 'SHOW_MODAL', payload: { modal: 'Payment', show: true } })}
              />
            }
          />
        </View>
      </View>

      <PaymentModal
        visible={state.showPaymentModal}
        total={grandTotal}
        processing={processingPayment}
        onPayCash={() => handlePayment('cash')}
        onPayCard={() => handlePayment('credit_card')}
        onCancel={() => dispatch({ type: 'SHOW_MODAL', payload: { modal: 'Payment', show: false } })}
      />

      <DiscountModal
        visible={state.showDiscountModal}
        discountType={state.discountType}
        discountValue={state.discountValue}
        onTypeChange={(type) => dispatch({ type: 'SET_DISCOUNT_TYPE', payload: type })}
        onValueChange={(value) => dispatch({ type: 'SET_DISCOUNT_VALUE', payload: value })}
        onApply={handleDiscount}
        onCancel={() => {
          dispatch({ type: 'SHOW_MODAL', payload: { modal: 'Discount', show: false } });
          dispatch({ type: 'SET_DISCOUNT_VALUE', payload: '' });
        }}
      />

      <TransferModal
        visible={state.showTransferModal}
        tables={tables.filter(t => t.id !== state.selectedTable?.id && !isTableOccupied(t))}
        transferring={false}
        onTransferToTable={handleTransfer}
        onCancel={() => dispatch({ type: 'SHOW_MODAL', payload: { modal: 'Transfer', show: false } })}
      />

      <MergeModal
        visible={state.showMergeModal}
        tables={tables.filter(t => t.id !== state.selectedTable?.id && isTableOccupied(t))}
        selectedTables={state.selectedTablesForMerge}
        merging={false}
        onToggleTable={(tableId) => dispatch({ type: 'TOGGLE_TABLE_FOR_MERGE', payload: tableId })}
        onMerge={handleMerge}
        onCancel={() => {
          dispatch({ type: 'SHOW_MODAL', payload: { modal: 'Merge', show: false } });
          dispatch({ type: 'CLEAR_MERGE_SELECTION' });
        }}
      />
    </View>
  );
}
