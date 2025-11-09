import React from 'react';
import { ScrollView, Pressable, Text } from 'react-native';
import { Category } from '../../types';

type Props = {
  categories: Category[];
  activeCat: string | null;
  onSelect: (catId: string) => void;
};

export function CategoryTabs({ categories, activeCat, onSelect }: Props) {
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={{ marginBottom: 12 }}
    >
      {categories.map((c) => (
        <Pressable
          key={c.id}
          onPress={() => onSelect(c.id)}
          style={{
            marginRight: 8,
            marginBottom: 6,
            backgroundColor: activeCat === c.id ? '#007AFF' : '#f7f7f7',
            paddingHorizontal: 10,
            paddingVertical: 8,
            borderRadius: 6
          }}
        >
          <Text style={{ color: activeCat === c.id ? '#fff' : '#333', fontWeight: '600', fontSize: 11 }}>
            {c.name}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}
