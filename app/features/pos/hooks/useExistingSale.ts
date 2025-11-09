import { useState } from 'react';
import { Alert } from 'react-native';
import { supabase } from '@/lib/supabase';
import { SaleItem, SaleDiscount } from '../types';

export function useExistingSale() {
  const [loading, setLoading] = useState(false);

  const loadExistingSale = async (saleId: string) => {
    setLoading(true);
    try {
      const { data: itemsData, error: itemsError } = await supabase
        .from('sale_items')
        .select('id, product_id, qty, unit_price, line_total, discount_amount, discount_type, products(name)')
        .eq('sale_id', saleId);

      const { data: saleData, error: saleError } = await supabase
        .from('sales')
        .select('discount_amount, discount_type')
        .eq('id', saleId)
        .single();

      const items = (itemsData as SaleItem[]) || [];
      let discount: SaleDiscount | null = null;

      if (!saleError && saleData && saleData.discount_amount) {
        discount = {
          amount: saleData.discount_amount,
          type: saleData.discount_type || 'amount'
        };
      }

      return { items, discount };
    } catch (err) {
      console.error('Mevcut sipariş yüklenemedi:', err);
      return { items: [], discount: null };
    } finally {
      setLoading(false);
    }
  };

  const deleteExistingItem = async (itemId: string) => {
    try {
      await supabase
        .from('sale_items')
        .delete()
        .eq('id', itemId);
      return true;
    } catch (err: any) {
      Alert.alert('Hata', err.message || 'Ürün silinemedi.');
      return false;
    }
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

  return {
    loading,
    loadExistingSale,
    deleteExistingItem,
    recalculateSaleTotal,
  };
}
