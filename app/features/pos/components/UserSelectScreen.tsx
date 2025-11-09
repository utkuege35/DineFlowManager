import React from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
import { User } from '../types';
import { PinModal } from './OrderScreen/modals/PinModal';

type Props = {
  users: User[];
  showPinModal: boolean;
  selectedUserForPin: User | null;
  pinInput: string;
  onSelectUser: (user: User) => void;
  onPinChange: (pin: string) => void;
  onVerifyPin: () => void;
  onCancelPin: () => void;
};

export function UserSelectScreen({
  users,
  showPinModal,
  selectedUserForPin,
  pinInput,
  onSelectUser,
  onPinChange,
  onVerifyPin,
  onCancelPin,
}: Props) {
  return (
    <View style={{ flex: 1, padding: 16, marginTop: 40 }}>
      <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' }}>
        Kullanıcı Seçin
      </Text>

      <FlatList
        data={users}
        keyExtractor={(it) => it.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => onSelectUser(item)}
            style={{
              backgroundColor: '#007AFF',
              padding: 24,
              borderRadius: 12,
              marginBottom: 16,
              width: '48%',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>
              {item.name}
            </Text>
            <Text style={{ color: '#fff', fontSize: 12, marginTop: 4, opacity: 0.9 }}>
              {item.role}
            </Text>
          </Pressable>
        )}
        ListEmptyComponent={
          <Text style={{ marginTop: 20, opacity: 0.6, textAlign: 'center' }}>
            Kullanıcı bulunamadı.
          </Text>
        }
      />

      <PinModal
        visible={showPinModal}
        userName={selectedUserForPin?.name || ''}
        pinInput={pinInput}
        onPinChange={onPinChange}
        onVerify={onVerifyPin}
        onCancel={onCancelPin}
      />
    </View>
  );
}
