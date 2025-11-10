import React from 'react';
import { FlatList, Pressable, Text } from 'react-native';
import { Product } from '../../types';

type Props = {
  products: Product[];
  onAddProduct: (product: Product) => void;
};

export function ProductGrid({ products, onAddProduct }: Props) {
  return (
    <FlatList
      key="products-2-columns"
      data={products}
      keyExtractor={(it) => it.id}
      numColumns={2}
      columnWrapperStyle={{ justifyContent: 'space-between' }}
      contentContainerStyle={{ paddingHorizontal: 8, paddingTop: 8 }}
      renderItem={({ item }) => (
        <Pressable
          onPress={() => onAddProduct(item)}
          style={{
            backgroundColor: '#f7f7f7',
            padding: 10,
            borderRadius: 8,
            marginBottom: 8,
            width: '48%',
          }}
        >
          <Text style={{ fontWeight: '600', fontSize: 14 }}>{item.name}</Text>
          <Text style={{ marginTop: 4, fontSize: 13 }}>{(item.sell_price ?? 0) + ' TL'}</Text>
        </Pressable>
      )}
      ListEmptyComponent={
        <Text style={{ marginTop: 20, opacity: 0.6 }}>Bu kategoride ürün yok.</Text>
      }
    />
  );
}
