import { useState } from 'react';
import { Alert } from 'react-native';
import { supabase } from '@/lib/supabase';
import { Table } from '../types';

export function usePayment() {
  const [processing, setProcessing] = useState(false);

  const processPayment = async (
    paymentMethod: 'cash' | 'credit_card',
    existingSaleId: string,
    selectedTable: Table,
    onSuccess: () => void
  ) => {
    setProcessing(true);
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

      Alert.alert(
        'Ödeme Başarılı',
        'Hesap kapatıldı. Masa seçim ekranına dönülüyor.',
        [{ text: 'Tamam', onPress: onSuccess }]
      );
    } catch (err: any) {
      Alert.alert('Hata', err.message || 'Ödeme işlemi başarısız.');
    } finally {
      setProcessing(false);
    }
  };

  return { processing, processPayment };
}
