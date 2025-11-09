import React from 'react';
import { ScrollView, Pressable, Text } from 'react-native';

type Props = {
  submitting: boolean;
  onSubmit: () => void;
  onMerge: () => void;
  onTransfer: () => void;
  onDiscount: () => void;
  onPayment: () => void;
};

export function ActionButtonBar({
  submitting,
  onSubmit,
  onMerge,
  onTransfer,
  onDiscount,
  onPayment,
}: Props) {
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
    >
      <Pressable 
        onPress={onSubmit}
        disabled={submitting}
        style={{ 
          marginRight: 8, 
          marginBottom: 6,
          backgroundColor: submitting ? '#999' : '#007AFF', 
          paddingHorizontal: 10, 
          paddingVertical: 8, 
          borderRadius: 6 
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '600', fontSize: 11 }}>
          {submitting ? '⏳ Gönderiliyor...' : '📤 Gönder'}
        </Text>
      </Pressable>

      <Pressable 
        onPress={onMerge}
        style={{ 
          marginRight: 8, 
          marginBottom: 6,
          backgroundColor: '#673AB7', 
          paddingHorizontal: 10, 
          paddingVertical: 8, 
          borderRadius: 6 
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '600', fontSize: 11 }}>🔗 Birleştir</Text>
      </Pressable>

      <Pressable 
        onPress={onTransfer}
        style={{ 
          marginRight: 8, 
          marginBottom: 6,
          backgroundColor: '#9C27B0', 
          paddingHorizontal: 10, 
          paddingVertical: 8, 
          borderRadius: 6 
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '600', fontSize: 11 }}>↔️ Transfer</Text>
      </Pressable>

      <Pressable 
        onPress={onDiscount}
        style={{ 
          marginRight: 8, 
          marginBottom: 6,
          backgroundColor: '#FF9800', 
          paddingHorizontal: 10, 
          paddingVertical: 8, 
          borderRadius: 6 
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '600', fontSize: 11 }}>% İndirim</Text>
      </Pressable>

      <Pressable 
        onPress={onPayment}
        style={{ 
          marginBottom: 6,
          backgroundColor: '#4CAF50', 
          paddingHorizontal: 10, 
          paddingVertical: 8, 
          borderRadius: 6 
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '600', fontSize: 11 }}>💳 Hesabı Kapat</Text>
      </Pressable>
    </ScrollView>
  );
}
