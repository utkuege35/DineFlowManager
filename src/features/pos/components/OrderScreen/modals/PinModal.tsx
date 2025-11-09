import React from 'react';
import { Modal, View, Text, TextInput, Pressable } from 'react-native';

type Props = {
  visible: boolean;
  userName: string;
  pinInput: string;
  onPinChange: (pin: string) => void;
  onVerify: () => void;
  onCancel: () => void;
};

export function PinModal({ visible, userName, pinInput, onPinChange, onVerify, onCancel }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ backgroundColor: '#fff', padding: 24, borderRadius: 16, width: '80%', maxWidth: 400 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>
            PIN Kodu Girin
          </Text>
          <Text style={{ fontSize: 14, marginBottom: 20, color: '#666' }}>
            {userName}
          </Text>

          <TextInput
            value={pinInput}
            onChangeText={onPinChange}
            keyboardType="number-pad"
            secureTextEntry
            placeholder="PIN"
            placeholderTextColor="#999"
            maxLength={4}
            autoFocus
            style={{
              borderWidth: 1,
              borderColor: '#ddd',
              borderRadius: 8,
              padding: 12,
              fontSize: 18,
              textAlign: 'center',
              marginBottom: 20,
              letterSpacing: 8,
            }}
          />

          <Pressable
            onPress={onVerify}
            style={{
              backgroundColor: '#4CAF50',
              padding: 14,
              borderRadius: 8,
              alignItems: 'center',
              marginBottom: 10,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Giriş</Text>
          </Pressable>

          <Pressable
            onPress={onCancel}
            style={{
              padding: 12,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#666', fontWeight: '600' }}>İptal</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
