import React from 'react';
import { Modal, View, Text, Pressable } from 'react-native';

type Props = {
  visible: boolean;
  total: number;
  processing: boolean;
  onPayCash: () => void;
  onPayCard: () => void;
  onCancel: () => void;
};

export function PaymentModal({ visible, total, processing, onPayCash, onPayCard, onCancel }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ backgroundColor: '#fff', padding: 24, borderRadius: 16, width: '80%', maxWidth: 400 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>
            Ödeme Yöntemi Seç
          </Text>

          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 16, marginBottom: 8 }}>Toplam Tutar:</Text>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#4CAF50' }}>
              {total.toFixed(2)} TL
            </Text>
          </View>

          <Pressable
            onPress={onPayCash}
            disabled={processing}
            style={{
              backgroundColor: processing ? '#999' : '#4CAF50',
              padding: 16,
              borderRadius: 8,
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
              {processing ? 'İşleniyor...' : '💵 Nakit'}
            </Text>
          </Pressable>

          <Pressable
            onPress={onPayCard}
            disabled={processing}
            style={{
              backgroundColor: processing ? '#999' : '#2196F3',
              padding: 16,
              borderRadius: 8,
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
              {processing ? 'İşleniyor...' : '💳 Kredi Kartı'}
            </Text>
          </Pressable>

          <Pressable
            onPress={onCancel}
            disabled={processing}
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
