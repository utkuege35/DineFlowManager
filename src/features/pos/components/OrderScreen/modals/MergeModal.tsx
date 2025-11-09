import React from 'react';
import { Modal, View, Text, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { Table } from '../../../types';

type Props = {
  visible: boolean;
  tables: Table[];
  selectedTables: string[];
  merging: boolean;
  onToggleTable: (tableId: string) => void;
  onMerge: () => void;
  onCancel: () => void;
};

export function MergeModal({
  visible,
  tables,
  selectedTables,
  merging,
  onToggleTable,
  onMerge,
  onCancel,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ backgroundColor: '#fff', padding: 24, borderRadius: 16, width: '90%', maxHeight: '80%' }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>
            Birleştirilecek Masaları Seçin
          </Text>

          <FlatList
            data={tables}
            keyExtractor={(it) => it.id}
            numColumns={3}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            renderItem={({ item }) => {
              const isSelected = selectedTables.includes(item.id);
              return (
                <Pressable
                  onPress={() => onToggleTable(item.id)}
                  disabled={merging}
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
            {selectedTables.length} masa seçildi
          </Text>

          <Pressable
            onPress={onMerge}
            disabled={merging || selectedTables.length === 0}
            style={{
              backgroundColor: merging || selectedTables.length === 0 ? '#999' : '#4CAF50',
              padding: 14,
              borderRadius: 8,
              alignItems: 'center',
              marginBottom: 10,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
              {merging ? 'Birleştiriliyor...' : 'Masaları Birleştir'}
            </Text>
          </Pressable>

          <Pressable
            onPress={onCancel}
            disabled={merging}
            style={{
              padding: 12,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#666', fontWeight: '600' }}>İptal</Text>
          </Pressable>

          {merging && (
            <View style={{ marginTop: 16, alignItems: 'center' }}>
              <ActivityIndicator size="small" color="#000" />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
