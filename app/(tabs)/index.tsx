import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { supabase } from '../../lib/supabase';

type Category = { id: string; name: string };
type Product = { id: string; name: string; sell_price: number | null; category_id: string | null };
type Table = { 
  id: string; 
  number: number; 
  name: string | null; 
  area_id: string | null;
  status: string | null;
  current_sale_id: string | null;
  merged_with_table_id?: string | null;
  is_merged?: boolean;
};
type SaleItem = {
  id: string;
  product_id: string;
  qty: number;
  unit_price: number;
  line_total: number;
  discount_amount?: number;
  discount_type?: string;
  products: { name: string } | null;
};
type User = {
  id: string;
  name: string;
  role: string;
  pin?: string;
};

export default function OrderScreen() {
  const [screen, setScreen] = useState<'user-select' | 'table-select' | 'order'>('user-select');
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportStartDate, setReportStartDate] = useState('');
  const [reportEndDate, setReportEndDate] = useState('');
  const [reportData, setReportData] = useState<any>(null);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [users, setUsers] = useState<User[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orderItems, setOrderItems] = useState<Product[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [existingSaleId, setExistingSaleId] = useState<string | null>(null);
  const [existingItems, setExistingItems] = useState<SaleItem[]>([]);
  const [loadingExisting, setLoadingExisting] = useState(false);
  const [saleDiscount, setSaleDiscount] = useState<{ amount: number; type: string } | null>(null);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [discountTarget, setDiscountTarget] = useState<'sale' | 'item' | null>(null);
  const [selectedItemForDiscount, setSelectedItemForDiscount] = useState<SaleItem | null>(null);
  const [discountType, setDiscountType] = useState<'percentage' | 'amount'>('percentage');
  const [discountValue, setDiscountValue] = useState('');

  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferring, setTransferring] = useState(false);

  const [showPinModal, setShowPinModal] = useState(false);
  const [selectedUserForPin, setSelectedUserForPin] = useState<User | null>(null);
  const [pinInput, setPinInput] = useState('');

  const [showMergeModal, setShowMergeModal] = useState(false);
  const [mergingTables, setMergingTables] = useState(false);
  const [selectedTablesForMerge, setSelectedTablesForMerge] = useState<string[]>([]);

  const loadUsers = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, role, pin')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (!error && data) {
      setUsers(data as User[]);
    }
  };

  const loadTables = async () => {
    const { data, error } = await supabase
      .from('restaurant_tables')
      .select('id, number, name, area_id, status, current_sale_id, merged_with_table_id, is_merged')
      .order('number', { ascending: true });

    if (!error && data) {
      setTables(data as Table[]);
    }
  };

  const loadCategories = async () => {
    const { data, error } = await supabase
      .from('product_categories')
      .select('id, name')
      .order('sort_order', { ascending: true });

    if (!error && data) {
      setCategories(data as Category[]);
      if (data.length > 0) setActiveCat(data[0].id);
    }
  };

  const loadProducts = async (categoryId: string | null) => {
    if (!categoryId) {
      setProducts([]);
      return;
    }
    const { data, error } = await supabase
      .from('products')
      .select('id, name, sell_price, category_id')
      .eq('category_id', categoryId)
      .order('name', { ascending: true});

    if (!error && data) setProducts(data as Product[]);
  };

  const loadExistingSale = async (saleId: string) => {
    setLoadingExisting(true);
    try {
      const { data: itemsData, error: itemsError } = await supabase
        .from('sale_items')
        .select('id, product_id, qty, unit_price, line_total, discount_amount, discount_type, products(name)')
        .eq('sale_id', saleId);

      if (!itemsError && itemsData) {
        setExistingItems(itemsData as SaleItem[]);
      }

      const { data: saleData, error: saleError } = await supabase
        .from('sales')
        .select('discount_amount, discount_type')
        .eq('id', saleId)
        .single();

      if (!saleError && saleData && saleData.discount_amount) {
        setSaleDiscount({
          amount: saleData.discount_amount,
          type: saleData.discount_type || 'amount'
        });
      } else {
        setSaleDiscount(null);
      }
    } catch (err) {
      console.error('Mevcut sipariş yüklenemedi:', err);
    } finally {
      setLoadingExisting(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (screen === 'table-select') {
      loadTables();
      loadCategories();
    }
  }, [screen]);

  useEffect(() => {
    if (screen === 'order') {
      loadProducts(activeCat);
    }
  }, [activeCat, screen]);

  const selectUser = (user: User) => {
    if (user.pin) {
      setSelectedUserForPin(user);
      setShowPinModal(true);
    } else {
      setCurrentUser(user);
      setScreen('table-select');
    }
  };

  const verifyPin = () => {
    if (!selectedUserForPin) return;
    
    if (pinInput === selectedUserForPin.pin) {
      setCurrentUser(selectedUserForPin);
      setShowPinModal(false);
      setPinInput('');
      setScreen('table-select');
    } else {
      Alert.alert('Hata', 'Yanlış PIN kodu!');
      setPinInput('');
    }
  };

  const changeUser = () => {
    Alert.alert(
      'Kullanıcı Değiştir',
      'Kullanıcı seçim ekranına dönmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Evet',
          onPress: () => {
            setCurrentUser(null);
            setSelectedTable(null);
            setOrderItems([]);
            setExistingItems([]);
            setExistingSaleId(null);
            setSaleDiscount(null);
            setScreen('user-select');
          }
        }
      ]
    );
  };

  const selectTable = async (table: Table) => {
    setSelectedTable(table);
    setOrderItems([]);
    
    if (table.current_sale_id) {
      setExistingSaleId(table.current_sale_id);
      await loadExistingSale(table.current_sale_id);
    } else {
      setExistingSaleId(null);
      setExistingItems([]);
      setSaleDiscount(null);
    }
    
    setScreen('order');
  };

  const addToOrder = (item: Product) => {
    setOrderItems(prev => [...prev, item]);
  };

  const removeOne = (productId: string) => {
    setOrderItems(prev => {
      const idx = prev.findIndex(p => p.id === productId);
      if (idx === -1) return prev;
      const copy = [...prev];
      copy.splice(idx, 1);
      return copy;
    });
  };

  const deleteExistingItem = (item: SaleItem) => {
    Alert.alert(
      'Ürün Sil',
      `${item.products?.name || 'Bu ürün'} silinecek. Onaylıyor musunuz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await supabase
                .from('sale_items')
                .delete()
                .eq('id', item.id);

              if (existingSaleId) {
                await loadExistingSale(existingSaleId);
                await recalculateSaleTotal(existingSaleId);
              }

              Alert.alert('Başarılı', 'Ürün silindi.');
            } catch (err: any) {
              Alert.alert('Hata', err.message || 'Ürün silinemedi.');
            }
          }
        }
      ]
    );
  };

  const applyDiscountToSale = () => {
    if (!existingSaleId) return;
    setDiscountTarget('sale');
    setSelectedItemForDiscount(null);
    setShowDiscountModal(true);
  };

  const applyDiscountToItem = (item: SaleItem) => {
    setDiscountTarget('item');
    setSelectedItemForDiscount(item);
    setShowDiscountModal(true);
  };

  const saveDiscount = async () => {
    const value = parseFloat(discountValue);
    if (isNaN(value) || value <= 0) {
      Alert.alert('Hata', 'Geçerli bir indirim değeri girin.');
      return;
    }

    try {
      if (discountTarget === 'sale' && existingSaleId) {
        await supabase
          .from('sales')
          .update({
            discount_amount: value,
            discount_type: discountType,
          })
          .eq('id', existingSaleId);

        setSaleDiscount({ amount: value, type: discountType });
        await recalculateSaleTotal(existingSaleId);
        Alert.alert('Başarılı', 'İndirim uygulandı.');
      } else if (discountTarget === 'item' && selectedItemForDiscount) {
        await supabase
          .from('sale_items')
          .update({
            discount_amount: value,
            discount_type: discountType,
          })
          .eq('id', selectedItemForDiscount.id);

        if (existingSaleId) {
          await loadExistingSale(existingSaleId);
          await recalculateSaleTotal(existingSaleId);
        }
        Alert.alert('Başarılı', 'İndirim uygulandı.');
      }

      setShowDiscountModal(false);
      setDiscountValue('');
    } catch (err: any) {
      Alert.alert('Hata', err.message || 'İndirim uygulanamadı.');
    }
  };

  const transferTable = async (targetTable: Table) => {
    if (!existingSaleId || !selectedTable) return;
    
    if (targetTable.id === selectedTable.id) {
      Alert.alert('Uyarı', 'Aynı masaya transfer yapamazsınız.');
      return;
    }

    if (targetTable.current_sale_id) {
      Alert.alert('Uyarı', 'Hedef masa dolu. Boş bir masa seçin.');
      return;
    }

    Alert.alert(
      'Masa Transfer',
      `Masa ${selectedTable.number} → Masa ${targetTable.number}\n\nSiparişi transfer etmek istediğinize emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Transfer Et',
          onPress: async () => {
            setTransferring(true);
            try {
              await supabase
                .from('restaurant_tables')
                .update({
                  status: 'available',
                  current_sale_id: null,
                  opened_at: null,
                })
                .eq('id', selectedTable.id);

              await supabase
                .from('restaurant_tables')
                .update({
                  status: 'occupied',
                  current_sale_id: existingSaleId,
                  opened_at: new Date().toISOString(),
                })
                .eq('id', targetTable.id);

              setShowTransferModal(false);
              Alert.alert(
                'Transfer Başarılı',
                `Sipariş Masa ${targetTable.number}'e taşındı.`,
                [
                  {
                    text: 'Tamam',
                    onPress: () => {
                      setOrderItems([]);
                      setExistingItems([]);
                      setExistingSaleId(null);
                      setSaleDiscount(null);
                      setSelectedTable(null);
                      setScreen('table-select');
                      loadTables();
                    }
                  }
                ]
              );

            } catch (err: any) {
              Alert.alert('Hata', err.message || 'Transfer başarısız.');
            } finally {
              setTransferring(false);
            }
          }
        }
      ]
    );
  };

  const startMerge = () => {
    if (!existingSaleId) {
      Alert.alert('Uyarı', 'Sadece açık siparişi olan masalar birleştirilebilir.');
      return;
    }
    setSelectedTablesForMerge([]);
    setShowMergeModal(true);
  };

  const toggleTableForMerge = (tableId: string) => {
    setSelectedTablesForMerge(prev => {
      if (prev.includes(tableId)) {
        return prev.filter(id => id !== tableId);
      } else {
        return [...prev, tableId];
      }
    });
  };

  const mergeTables = async () => {
    if (!selectedTable || !existingSaleId) return;
    
    if (selectedTablesForMerge.length === 0) {
      Alert.alert('Uyarı', 'En az bir masa seçmelisiniz.');
      return;
    }

    const mergeTableNumbers = tables
      .filter(t => selectedTablesForMerge.includes(t.id))
      .map(t => t.number)
      .join(', ');

    Alert.alert(
      'Masa Birleştir',
      `Masa ${mergeTableNumbers} → Masa ${selectedTable.number}\n\nSeçili masaları birleştirmek istediğinize emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Birleştir',
          onPress: async () => {
            setMergingTables(true);
            try {
              for (const tableId of selectedTablesForMerge) {
                const mergeTable = tables.find(t => t.id === tableId);
                if (!mergeTable || !mergeTable.current_sale_id) continue;

                const { data: items } = await supabase
                  .from('sale_items')
                  .select('*')
                  .eq('sale_id', mergeTable.current_sale_id);

                if (items && items.length > 0) {
                  const newItems = items.map(item => ({
                    sale_id: existingSaleId,
                    product_id: item.product_id,
                    qty: item.qty,
                    unit_price: item.unit_price,
                    line_total: item.line_total,
                    discount_amount: item.discount_amount,
                    discount_type: item.discount_type,
                  }));

                  await supabase
                    .from('sale_items')
                    .insert(newItems);
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
                    merged_with_table_id: selectedTable.id,
                  })
                  .eq('id', tableId);
              }

              await recalculateSaleTotal(existingSaleId);
              await loadExistingSale(existingSaleId);

              setShowMergeModal(false);
              setSelectedTablesForMerge([]);
              
              Alert.alert('Başarılı', `${selectedTablesForMerge.length} masa birleştirildi.`);

            } catch (err: any) {
              Alert.alert('Hata', err.message || 'Birleştirme başarısız.');
            } finally {
              setMergingTables(false);
            }
          }
        }
      ]
    );
  };

  const recalculateSaleTotal = async (saleId: string) => {
    try {
      const { data: items } = await supabase
        .from('sale_items')
        .select('line_total, discount_amount, discount_type')
        .eq('sale_id', saleId);

      if (!items) return;

      let itemsTotal = 0;
      for (const item of items) {
        let itemTotal = item.line_total;
        
        if (item.discount_amount && item.discount_type) {
          if (item.discount_type === 'percentage') {
            itemTotal = itemTotal - (itemTotal * item.discount_amount / 100);
          } else {
            itemTotal = itemTotal - item.discount_amount;
          }
        }
        
        itemsTotal += itemTotal;
      }

      const { data: sale } = await supabase
        .from('sales')
        .select('discount_amount, discount_type')
        .eq('id', saleId)
        .single();

      let finalAmount = itemsTotal;
      if (sale?.discount_amount && sale?.discount_type) {
        if (sale.discount_type === 'percentage') {
          finalAmount = finalAmount - (finalAmount * sale.discount_amount / 100);
        } else {
          finalAmount = finalAmount - sale.discount_amount;
        }
      }

      await supabase
        .from('sales')
        .update({
          total_amount: itemsTotal,
          final_amount: finalAmount,
        })
        .eq('id', saleId);

    } catch (err) {
      console.error('Toplam hesaplanamadı:', err);
    }
  };

  const cart = useMemo(() => {
    const map = new Map<string, { id: string; name: string; unit: number; qty: number; line: number }>();
    for (const p of orderItems) {
      const unit = Number(p.sell_price ?? 0);
      if (!map.has(p.id)) map.set(p.id, { id: p.id, name: p.name, unit, qty: 0, line: 0 });
      const row = map.get(p.id)!;
      row.qty += 1;
      row.line = row.qty * unit;
    }
    return Array.from(map.values());
  }, [orderItems]);

  const newItemsTotal = useMemo(
    () => cart.reduce((s, x) => s + x.line, 0),
    [cart]
  );

  const existingTotal = useMemo(() => {
    let total = 0;
    for (const item of existingItems) {
      let itemTotal = item.line_total;
      
      if (item.discount_amount && item.discount_type) {
        if (item.discount_type === 'percentage') {
          itemTotal = itemTotal - (itemTotal * item.discount_amount / 100);
        } else {
          itemTotal = itemTotal - item.discount_amount;
        }
      }
      
      total += itemTotal;
    }
    return total;
  }, [existingItems]);

  const grandTotal = useMemo(() => {
    let total = existingTotal + newItemsTotal;
    
    if (saleDiscount) {
      if (saleDiscount.type === 'percentage') {
        total = total - (total * saleDiscount.amount / 100);
      } else {
        total = total - saleDiscount.amount;
      }
    }
    
    return Math.max(0, total);
  }, [existingTotal, newItemsTotal, saleDiscount]);

  const submitOrder = async () => {
    if (!selectedTable || !currentUser) {
      Alert.alert('Uyarı', 'Masa veya kullanıcı seçilmedi.');
      return;
    }

    if (existingSaleId && orderItems.length === 0) {
      Alert.alert('Uyarı', 'Yeni ürün eklenmedi.');
      return;
    }

    if (!existingSaleId && orderItems.length === 0) {
      Alert.alert('Uyarı', 'Sepet boş.');
      return;
    }

    setSubmitting(true);

    try {
      let saleId = existingSaleId;

      if (!saleId) {
        const { data: saleData, error: saleError } = await supabase
          .from('sales')
          .insert({
            total_amount: newItemsTotal,
            final_amount: newItemsTotal,
            created_at: new Date().toISOString(),
            payment_status: 'pending',
            is_paid: false,
            user_id: currentUser.id,
          })
          .select('id')
          .single();

        if (saleError) throw saleError;
        saleId = saleData.id;

        await supabase
          .from('restaurant_tables')
          .update({
            current_sale_id: saleId,
            status: 'occupied',
            opened_at: new Date().toISOString(),
          })
          .eq('id', selectedTable.id);
      }

      if (cart.length > 0) {
        const items = cart.map(row => ({
          sale_id: saleId,
          product_id: row.id,
          qty: row.qty,
          unit_price: row.unit,
          line_total: row.line,
        }));

        const { error: itemsError } = await supabase
          .from('sale_items')
          .insert(items);

        if (itemsError) throw itemsError;
      }

      await recalculateSaleTotal(saleId);
      setExistingSaleId(saleId);
      await loadExistingSale(saleId);
      setOrderItems([]);
      Alert.alert('Başarılı', 'Sipariş gönderildi!');
    } catch (err: any) {
      Alert.alert('Hata', err.message || 'Sipariş gönderilemedi.');
    } finally {
      setSubmitting(false);
    }
  };

  const processPayment = async (paymentMethod: 'cash' | 'credit_card') => {
    if (!existingSaleId || !selectedTable) return;

    setProcessingPayment(true);
    try {
      await supabase
        .from('sales')
        .update({
          payment_status: 'paid',
          is_paid: true,
          payment_method: paymentMethod,
          paid_at: new Date().toISOString(),
        })
        .eq('id', existingSaleId);

      await supabase
        .from('restaurant_tables')
        .update({
          status: 'available',
          current_sale_id: null,
          opened_at: null,
        })
        .eq('id', selectedTable.id);

      setShowPaymentModal(false);
      Alert.alert(
        'Ödeme Başarılı',
        'Hesap kapatıldı. Masa seçim ekranına dönülüyor.',
        [
          {
            text: 'Tamam',
            onPress: () => {
              setOrderItems([]);
              setExistingItems([]);
              setExistingSaleId(null);
              setSaleDiscount(null);
              setSelectedTable(null);
              setScreen('table-select');
              loadTables();
            }
          }
        ]
      );
    } catch (err: any) {
      Alert.alert('Hata', err.message || 'Ödeme işlemi başarısız.');
    } finally {
      setProcessingPayment(false);
    }
  };

  const isTableOccupied = (table: Table) => {
    return table.status === 'occupied' || !!table.current_sale_id;
  };

  if (screen === 'user-select') {
    return (
      <View style={{ flex: 1, padding: 16, marginTop: 40 }}>
        <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' }}>
          Kullanıcı Seçin
        </Text>

        <FlatList
          data={users}
          keyExtractor={(it) => it.id}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => selectUser(item)}
              style={{
                backgroundColor: '#007AFF',
                padding: 24,
                borderRadius: 12,
                marginBottom: 16,
                width: '48%',
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>
                {item.name}
              </Text>
              <Text style={{ color: '#fff', fontSize: 12, marginTop: 4, opacity: 0.9 }}>
                {item.role}
              </Text>
            </Pressable>
          )}
          ListEmptyComponent={
            <Text style={{ marginTop: 20, opacity: 0.6, textAlign: 'center' }}>
              Kullanıcı bulunamadı.
            </Text>
          }
        />

        <Modal visible={showPinModal} transparent animationType="fade">
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ backgroundColor: '#fff', padding: 24, borderRadius: 16, width: '80%', maxWidth: 400 }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>
                PIN Kodu Girin
              </Text>
              <Text style={{ fontSize: 14, marginBottom: 20, color: '#666' }}>
                {selectedUserForPin?.name}
              </Text>

              <TextInput
                value={pinInput}
                onChangeText={setPinInput}
                keyboardType="number-pad"
                secureTextEntry
                placeholder="PIN"
                placeholderTextColor="#999"
                maxLength={4}
                autoFocus
                style={{
                  borderWidth: 1,
                  borderColor: '#ddd',
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 18,
                  textAlign: 'center',
                  marginBottom: 20,
                  letterSpacing: 8,
                }}
              />

              <Pressable
                onPress={verifyPin}
                style={{
                  backgroundColor: '#4CAF50',
                  padding: 14,
                  borderRadius: 8,
                  alignItems: 'center',
                  marginBottom: 10,
                }}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Giriş</Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  setShowPinModal(false);
                  setPinInput('');
                }}
                style={{
                  padding: 12,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#666', fontWeight: '600' }}>İptal</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  if (screen === 'table-select') {
    return (
      <View style={{ flex: 1, padding: 16, marginTop: 40 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <View>
            <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Masa Seçin</Text>
            {currentUser && (
              <Text style={{ fontSize: 14, color: '#666', marginTop: 4 }}>
                Garson: {currentUser.name}
              </Text>
            )}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Pressable onPress={changeUser} style={{ marginRight: 12 }}>
              <Text style={{ color: '#FF9800', fontWeight: '600' }}>Kullanıcı Değiştir</Text>
            </Pressable>
            <Pressable onPress={loadTables}>
              <Text style={{ color: '#007AFF', fontWeight: '600' }}>🔄 Yenile</Text>
            </Pressable>
          </View>
        </View>

        <View style={{ flexDirection: 'row', marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}>
            <View style={{ width: 16, height: 16, backgroundColor: '#4CAF50', borderRadius: 4, marginRight: 6 }} />
            <Text style={{ fontSize: 12, opacity: 0.7 }}>Boş</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 16, height: 16, backgroundColor: '#F44336', borderRadius: 4, marginRight: 6 }} />
            <Text style={{ fontSize: 12, opacity: 0.7 }}>Dolu</Text>
          </View>
        </View>

        <FlatList
          key="tables-3-columns"
          data={tables}
          keyExtractor={(it) => it.id}
          numColumns={3}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          renderItem={({ item }) => {
            const occupied = isTableOccupied(item);
            return (
              <Pressable
                onPress={() => selectTable(item)}
                style={{
                  backgroundColor: occupied ? '#FFCDD2' : '#C8E6C9',
                  padding: 20,
                  borderRadius: 10,
                  marginBottom: 12,
                  width: '31%',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Masa {item.number}</Text>
                {item.name && <Text style={{ fontSize: 12, marginTop: 4, opacity: 0.7 }}>{item.name}</Text>}
              </Pressable>
            );
          }}
          ListEmptyComponent={
            <Text style={{ marginTop: 20, opacity: 0.6 }}>Masa bulunamadı.</Text>
          }
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, marginTop: 40 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderColor: '#eee' }}>
        <View>
          <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
            Masa {selectedTable?.number}
          </Text>
          {currentUser && (
            <Text style={{ fontSize: 12, color: '#666' }}>
              Garson: {currentUser.name}
            </Text>
          )}
        </View>
        <Pressable
          onPress={() => {
            setOrderItems([]);
            setExistingItems([]);
            setExistingSaleId(null);
            setSaleDiscount(null);
            setSelectedTable(null);
            setScreen('table-select');
          }}
        >
          <Text style={{ color: '#007AFF', fontWeight: '600' }}>← Geri</Text>
        </Pressable>
      </View>

      <View style={{ flex: 1, flexDirection: 'row' }}>
        <View style={{ width: 220, borderRightWidth: 1, borderColor: '#eee', padding: 8 }}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 12 }}
          >
            {categories.map((c) => (
              <Pressable
                key={c.id}
                onPress={() => setActiveCat(c.id)}
                style={{
                  marginRight: 8,
                  marginBottom: 6,
                  backgroundColor: activeCat === c.id ? '#007AFF' : '#f7f7f7',
                  paddingHorizontal: 10,
                  paddingVertical: 8,
                  borderRadius: 6
                }}
              >
                <Text style={{ color: activeCat === c.id ? '#fff' : '#333', fontWeight: '600', fontSize: 11 }}>{c.name}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <View style={{ flex: 1 }}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
            >
              <Pressable 
                onPress={submitOrder}
                disabled={submitting}
                style={{ 
                  marginRight: 8, 
                  marginBottom: 6,
                  backgroundColor: submitting ? '#999' : '#007AFF', 
                  paddingHorizontal: 10, 
                  paddingVertical: 8, 
                  borderRadius: 6 
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '600', fontSize: 11 }}>
                  {submitting ? '⏳ Gönderiliyor...' : '📤 Gönder'}
                </Text>
              </Pressable>

              <Pressable 
                onPress={startMerge}
                style={{ 
                  marginRight: 8, 
                  marginBottom: 6,
                  backgroundColor: '#673AB7', 
                  paddingHorizontal: 10, 
                  paddingVertical: 8, 
                  borderRadius: 6 
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '600', fontSize: 11 }}>🔗 Birleştir</Text>
              </Pressable>

              <Pressable 
                onPress={() => setShowTransferModal(true)}
                style={{ 
                  marginRight: 8, 
                  marginBottom: 6,
                  backgroundColor: '#9C27B0', 
                  paddingHorizontal: 10, 
                  paddingVertical: 8, 
                  borderRadius: 6 
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '600', fontSize: 11 }}>↔️ Transfer</Text>
              </Pressable>

              <Pressable 
                onPress={applyDiscountToSale}
                style={{ 
                  marginRight: 8, 
                  marginBottom: 6,
                  backgroundColor: '#FF9800', 
                  paddingHorizontal: 10, 
                  paddingVertical: 8, 
                  borderRadius: 6 
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '600', fontSize: 11 }}>% İndirim</Text>
              </Pressable>

              <Pressable 
                onPress={() => setShowPaymentModal(true)}
                style={{ 
                  marginBottom: 6,
                  backgroundColor: '#4CAF50', 
                  paddingHorizontal: 10, 
                  paddingVertical: 8, 
                  borderRadius: 6 
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '600', fontSize: 11 }}>💳 Hesabı Kapat</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>

        <View style={{ flex: 1 }}>
          <FlatList
            key="products-2-columns"
            data={products}
            keyExtractor={(it) => it.id}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => addToOrder(item)}
                style={{
                  backgroundColor: '#f7f7f7',
                  padding: 14,
                  borderRadius: 10,
                  marginBottom: 12,
                  width: '48%',
                }}
              >
                <Text style={{ fontWeight: '600' }}>{item.name}</Text>
                <Text style={{ marginTop: 6 }}>{(item.sell_price ?? 0) + ' TL'}</Text>
                <Text style={{ marginTop: 6, fontSize: 12, opacity: 0.6 }}>Sepete eklemek için dokun</Text>
              </Pressable>
            )}
            ListEmptyComponent={
              <Text style={{ marginTop: 20, opacity: 0.6 }}>Bu kategoride ürün yok.</Text>
            }
          />
        </View>
      </View>

      <View style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#eee',
        padding: 12
      }}>
        {loadingExisting ? (
          <ActivityIndicator size="small" color="#000" />
        ) : existingItems.length > 0 ? (
          <View style={{ marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
            <Text style={{ fontWeight: 'bold', marginBottom: 6, color: '#666' }}>Mevcut Sipariş:</Text>
            <ScrollView style={{ maxHeight: 100 }}>
              {existingItems.map(item => {
                let itemTotal = item.line_total;
                let hasDiscount = false;
                
                if (item.discount_amount && item.discount_type && item.discount_amount > 0) {
                  hasDiscount = true;
                  if (item.discount_type === 'percentage') {
                    itemTotal = itemTotal - (itemTotal * item.discount_amount / 100);
                  } else {
                    itemTotal = itemTotal - item.discount_amount;
                  }
                }
                
                return (
                  <View key={item.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 3 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 13, color: '#666' }}>
                        {item.products?.name || 'Ürün'} x {item.qty}
                      </Text>
                      {hasDiscount && (
                        <Text style={{ fontSize: 11, color: '#FF9800' }}>
                          İndirim: {item.discount_type === 'percentage' ? `%${item.discount_amount}` : `${item.discount_amount} TL`}
                        </Text>
                      )}
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={{ fontSize: 13, color: '#666', marginRight: 8 }}>
                        {itemTotal.toFixed(2)} TL
                      </Text>
                      <Pressable
                        onPress={() => applyDiscountToItem(item)}
                        style={{ marginRight: 6, padding: 4 }}
                      >
                        <Text style={{ fontSize: 16 }}>%</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => deleteExistingItem(item)}
                        style={{ padding: 4 }}
                      >
                        <Text style={{ fontSize: 16, color: '#F44336' }}>×</Text>
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        ) : null}

        {cart.length > 0 && (
          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontWeight: 'bold', marginBottom: 6, color: '#666' }}>Yeni Eklemeler:</Text>
            <ScrollView style={{ maxHeight: 80 }}>
              {cart.map((row) => (
                <View key={row.id} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ flex: 1, fontSize: 13 }}>
                    {row.name} x {row.qty}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontSize: 13, marginRight: 8 }}>
                      {row.line.toFixed(2)} TL
                    </Text>
                    <Pressable
                      onPress={() => removeOne(row.id)}
                      style={{ padding: 4 }}
                    >
                      <Text style={{ fontSize: 16, color: '#F44336' }}>−</Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {saleDiscount && (
          <View style={{ marginBottom: 8 }}>
            <Text style={{ fontSize: 12, color: '#FF9800', fontWeight: '600' }}>
              Toplam İndirim: {saleDiscount.type === 'percentage' ? `%${saleDiscount.amount}` : `${saleDiscount.amount} TL`}
            </Text>
          </View>
        )}

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold' }}>Toplam:</Text>
          <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{grandTotal.toFixed(2)} TL</Text>
        </View>
      </View>

      <Modal visible={showPaymentModal} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#fff', padding: 24, borderRadius: 16, width: '80%', maxWidth: 400 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>
              Ödeme Yöntemi Seç
            </Text>

            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 16, marginBottom: 8 }}>Toplam Tutar:</Text>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#4CAF50' }}>
                {grandTotal.toFixed(2)} TL
              </Text>
            </View>

            <Pressable
              onPress={() => processPayment('cash')}
              disabled={processingPayment}
              style={{
                backgroundColor: processingPayment ? '#999' : '#4CAF50',
                padding: 16,
                borderRadius: 8,
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
                {processingPayment ? 'İşleniyor...' : '💵 Nakit'}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => processPayment('credit_card')}
              disabled={processingPayment}
              style={{
                backgroundColor: processingPayment ? '#999' : '#2196F3',
                padding: 16,
                borderRadius: 8,
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
                {processingPayment ? 'İşleniyor...' : '💳 Kredi Kartı'}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setShowPaymentModal(false)}
              disabled={processingPayment}
              style={{
                padding: 12,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#666', fontWeight: '600' }}>İptal</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={showDiscountModal} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#fff', padding: 24, borderRadius: 16, width: '80%', maxWidth: 400 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>
              İndirim Uygula
            </Text>

            <View style={{ flexDirection: 'row', marginBottom: 16 }}>
              <Pressable
                onPress={() => setDiscountType('percentage')}
                style={{
                  flex: 1,
                  padding: 12,
                  backgroundColor: discountType === 'percentage' ? '#007AFF' : '#f7f7f7',
                  borderRadius: 8,
                  alignItems: 'center',
                  marginRight: 8,
                }}
              >
                <Text style={{ color: discountType === 'percentage' ? '#fff' : '#333', fontWeight: '600' }}>
                  Yüzde (%)
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setDiscountType('amount')}
                style={{
                  flex: 1,
                  padding: 12,
                  backgroundColor: discountType === 'amount' ? '#007AFF' : '#f7f7f7',
                  borderRadius: 8,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: discountType === 'amount' ? '#fff' : '#333', fontWeight: '600' }}>
                  Tutar (TL)
                </Text>
              </Pressable>
            </View>

            <TextInput
              value={discountValue}
              onChangeText={setDiscountValue}
              keyboardType="numeric"
              placeholder={discountType === 'percentage' ? 'Yüzde girin (ör: 10)' : 'Tutar girin (ör: 50)'}
              placeholderTextColor="#999"
              style={{
                borderWidth: 1,
                borderColor: '#ddd',
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                marginBottom: 20,
              }}
            />

            <Pressable
              onPress={saveDiscount}
              style={{
                backgroundColor: '#4CAF50',
                padding: 14,
                borderRadius: 8,
                alignItems: 'center',
                marginBottom: 10,
              }}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Uygula</Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setShowDiscountModal(false);
                setDiscountValue('');
              }}
              style={{
                padding: 12,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#666', fontWeight: '600' }}>İptal</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={showTransferModal} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#fff', padding: 24, borderRadius: 16, width: '90%', maxHeight: '80%' }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>
              Transfer Edilecek Masayı Seçin
            </Text>

            <FlatList
              data={tables.filter(t => t.id !== selectedTable?.id && !isTableOccupied(t))}
              keyExtractor={(it) => it.id}
              numColumns={3}
              columnWrapperStyle={{ justifyContent: 'space-between' }}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => transferTable(item)}
                  disabled={transferring}
                  style={{
                    backgroundColor: '#C8E6C9',
                    padding: 16,
                    borderRadius: 8,
                    marginBottom: 10,
                    width: '31%',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontWeight: 'bold' }}>Masa {item.number}</Text>
                </Pressable>
              )}
              ListEmptyComponent={
                <Text style={{ marginTop: 20, opacity: 0.6, textAlign: 'center' }}>
                  Boş masa bulunamadı.
                </Text>
              }
            />

            <Pressable
              onPress={() => setShowTransferModal(false)}
              disabled={transferring}
              style={{
                marginTop: 16,
                padding: 12,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#666', fontWeight: '600' }}>İptal</Text>
            </Pressable>

            {transferring && (
              <View style={{ marginTop: 16, alignItems: 'center' }}>
                <ActivityIndicator size="small" color="#000" />
              </View>
            )}
          </View>
        </View>
      </Modal>

      <Modal visible={showMergeModal} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#fff', padding: 24, borderRadius: 16, width: '90%', maxHeight: '80%' }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>
              Birleştirilecek Masaları Seçin
            </Text>

            <FlatList
              data={tables.filter(t => 
                t.id !== selectedTable?.id && 
                isTableOccupied(t)
              )}
              keyExtractor={(it) => it.id}
              numColumns={3}
              columnWrapperStyle={{ justifyContent: 'space-between' }}
              renderItem={({ item }) => {
                const isSelected = selectedTablesForMerge.includes(item.id);
                return (
                  <Pressable
                    onPress={() => toggleTableForMerge(item.id)}
                    disabled={mergingTables}
                    style={{
                      backgroundColor: isSelected ? '#007AFF' : '#FFCDD2',
                      padding: 16,
                      borderRadius: 8,
                      marginBottom: 10,
                      width: '31%',
                      alignItems: 'center',
                      borderWidth: isSelected ? 2 : 0,
                      borderColor: '#0056b3',
                    }}
                  >
                    <Text style={{ 
                      fontWeight: 'bold',
                      color: isSelected ? '#fff' : '#000'
                    }}>
                      Masa {item.number}
                    </Text>
                  </Pressable>
                );
              }}
              ListEmptyComponent={
                <Text style={{ marginTop: 20, opacity: 0.6, textAlign: 'center' }}>
                  Birleştirilebilecek masa bulunamadı.
                </Text>
              }
            />

            <Text style={{ fontSize: 12, color: '#666', marginTop: 12, marginBottom: 16 }}>
              {selectedTablesForMerge.length} masa seçildi
            </Text>

            <Pressable
              onPress={mergeTables}
              disabled={mergingTables || selectedTablesForMerge.length === 0}
              style={{
                backgroundColor: mergingTables || selectedTablesForMerge.length === 0 ? '#999' : '#4CAF50',
                padding: 14,
                borderRadius: 8,
                alignItems: 'center',
                marginBottom: 10,
              }}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
                {mergingTables ? 'Birleştiriliyor...' : 'Masaları Birleştir'}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setShowMergeModal(false);
                setSelectedTablesForMerge([]);
              }}
              disabled={mergingTables}
              style={{
                padding: 12,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#666', fontWeight: '600' }}>İptal</Text>
            </Pressable>

            {mergingTables && (
              <View style={{ marginTop: 16, alignItems: 'center' }}>
                <ActivityIndicator size="small" color="#000" />
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
