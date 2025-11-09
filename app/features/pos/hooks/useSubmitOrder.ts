import { useState } from 'react';
import { Alert } from 'react-native';
import { supabase } from '@/lib/supabase';
import { Product, Table, User } from '../types';

export function useSubmitOrder() {
  const [submitting, setSubmitting] = useState(false);

  const submitOrder = async (
    cart: Array<{ id: string; qty: number; unit: number; line: number }>,
    newItemsTotal: number,
    existingSaleId: string | null,
    selectedTable: Table,
    currentUser: User,
    recalculateSaleTotal: (saleId: string) => Promise<void>
  ) => {
    if (!selectedTable || !currentUser) {
      Alert.alert('Uyarı', 'Masa veya kullanıcı seçilmedi.');
      return null;
    }

    if (existingSaleId && cart.length === 0) {
      Alert.alert('Uyarı', 'Yeni ürün eklenmedi.');
      return null;
    }

    if (!existingSaleId && cart.length === 0) {
      Alert.alert('Uyarı', 'Sepet boş.');
      return null;
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
      Alert.alert('Başarılı', 'Sipariş gönderildi!');
      return saleId;
    } catch (err: any) {
      Alert.alert('Hata', err.message || 'Sipariş gönderilemedi.');
      return null;
    } finally {
      setSubmitting(false);
    }
  };

  return { submitting, submitOrder };
}
