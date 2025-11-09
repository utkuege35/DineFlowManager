import { Alert } from 'react-native';
import { supabase } from '@/lib/supabase';
import { SaleItem } from '../types';

export function useDiscount() {
  const saveDiscount = async (
    discountValue: string,
    discountType: 'percentage' | 'amount',
    discountTarget: 'sale' | 'item' | null,
    existingSaleId: string | null,
    selectedItemForDiscount: SaleItem | null,
    recalculateSaleTotal: (saleId: string) => Promise<void>,
    onSuccess: () => void
  ) => {
    const value = parseFloat(discountValue);
    if (isNaN(value) || value <= 0) {
      Alert.alert('Hata', 'Geçerli bir indirim değeri girin.');
      return false;
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
          await recalculateSaleTotal(existingSaleId);
        }
        Alert.alert('Başarılı', 'İndirim uygulandı.');
      }

      onSuccess();
      return true;
    } catch (err: any) {
      Alert.alert('Hata', err.message || 'İndirim uygulanamadı.');
      return false;
    }
  };

  return { saveDiscount };
}
