import React from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
import { Table, User } from '../types';

type Props = {
  tables: Table[];
  currentUser: User | null;
  isTableOccupied: (table: Table) => boolean;
  onSelectTable: (table: Table) => void;
  onChangeUser: () => void;
  onRefresh: () => void;
};

export function TableSelectScreen({
  tables,
  currentUser,
  isTableOccupied,
  onSelectTable,
  onChangeUser,
  onRefresh,
}: Props) {
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
          <Pressable onPress={onChangeUser} style={{ marginRight: 12 }}>
            <Text style={{ color: '#FF9800', fontWeight: '600' }}>Kullanıcı Değiştir</Text>
          </Pressable>
          <Pressable onPress={onRefresh}>
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
              onPress={() => onSelectTable(item)}
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
