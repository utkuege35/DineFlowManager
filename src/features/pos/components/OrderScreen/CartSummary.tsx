import React from 'react';
import { View, Text, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { SaleItem, SaleDiscount } from '../../types';

type Props = {
  loading: boolean;
  existingItems: SaleItem[];
  cartItems: Array<{ id: string; name: string; qty: number; line: number }>;
  saleDiscount: SaleDiscount | null;
  grandTotal: number;
  onDeleteExistingItem: (item: SaleItem) => void;
  onDiscountExistingItem: (item: SaleItem) => void;
  onRemoveCartItem: (productId: string) => void;
};

export function CartSummary({
  loading,
  existingItems,
  cartItems,
  saleDiscount,
  grandTotal,
  onDeleteExistingItem,
  onDiscountExistingItem,
  onRemoveCartItem,
}: Props) {
  return (
    <View style={{
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#fff',
      borderTopWidth: 1,
      borderColor: '#eee',
      padding: 12
    }}>
      {loading ? (
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
                      onPress={() => onDiscountExistingItem(item)}
                      style={{ marginRight: 6, padding: 4 }}
                    >
                      <Text style={{ fontSize: 16 }}>%</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => onDeleteExistingItem(item)}
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

      {cartItems.length > 0 && (
        <View style={{ marginBottom: 12 }}>
          <Text style={{ fontWeight: 'bold', marginBottom: 6, color: '#666' }}>Yeni Eklemeler:</Text>
          <ScrollView style={{ maxHeight: 80 }}>
            {cartItems.map((row) => (
              <View key={row.id} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ flex: 1, fontSize: 13 }}>
                  {row.name} x {row.qty}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontSize: 13, marginRight: 8 }}>
                    {row.line.toFixed(2)} TL
                  </Text>
                  <Pressable
                    onPress={() => onRemoveCartItem(row.id)}
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
  );
}
