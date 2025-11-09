import React from 'react';
import { Modal, View, Text, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { Table } from '../../../types';

type Props = {
  visible: boolean;
  tables: Table[];
  transferring: boolean;
  onTransferToTable: (table: Table) => void;
  onCancel: () => void;
};

export function TransferModal({ visible, tables, transferring, onTransferToTable, onCancel }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ backgroundColor: '#fff', padding: 24, borderRadius: 16, width: '90%', maxHeight: '80%' }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>
            Transfer Edilecek Masayı Seçin
          </Text>

          <FlatList
            data={tables}
            keyExtractor={(it) => it.id}
            numColumns={3}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => onTransferToTable(item)}
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
            onPress={onCancel}
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
  );
}
