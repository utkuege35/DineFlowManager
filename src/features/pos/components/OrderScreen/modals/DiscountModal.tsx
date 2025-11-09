import React from 'react';
import { Modal, View, Text, TextInput, Pressable } from 'react-native';

type Props = {
  visible: boolean;
  discountType: 'percentage' | 'amount';
  discountValue: string;
  onTypeChange: (type: 'percentage' | 'amount') => void;
  onValueChange: (value: string) => void;
  onApply: () => void;
  onCancel: () => void;
};

export function DiscountModal({
  visible,
  discountType,
  discountValue,
  onTypeChange,
  onValueChange,
  onApply,
  onCancel,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ backgroundColor: '#fff', padding: 24, borderRadius: 16, width: '80%', maxWidth: 400 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>
            İndirim Uygula
          </Text>

          <View style={{ flexDirection: 'row', marginBottom: 16 }}>
            <Pressable
              onPress={() => onTypeChange('percentage')}
              style={{
                flex: 1,
                padding: 12,
                backgroundColor: discountType === 'percentage' ? '#007AFF' : '#f7f7f7',
                borderRadius: 8,
                alignItems: 'center',
                marginRight: 8,
              }}
            >
              <Text style={{ color: discountType === 'percentage' ? '#fff' : '#333', fontWeight: '600' }}>
                Yüzde (%)
              </Text>
            </Pressable>

            <Pressable
              onPress={() => onTypeChange('amount')}
              style={{
                flex: 1,
                padding: 12,
                backgroundColor: discountType === 'amount' ? '#007AFF' : '#f7f7f7',
                borderRadius: 8,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: discountType === 'amount' ? '#fff' : '#333', fontWeight: '600' }}>
                Tutar (TL)
              </Text>
            </Pressable>
          </View>

          <TextInput
            value={discountValue}
            onChangeText={onValueChange}
            keyboardType="numeric"
            placeholder={discountType === 'percentage' ? 'Yüzde girin (ör: 10)' : 'Tutar girin (ör: 50)'}
            placeholderTextColor="#999"
            style={{
              borderWidth: 1,
              borderColor: '#ddd',
              borderRadius: 8,
              padding: 12,
              fontSize: 16,
              marginBottom: 20,
            }}
          />

          <Pressable
            onPress={onApply}
            style={{
              backgroundColor: '#4CAF50',
              padding: 14,
              borderRadius: 8,
              alignItems: 'center',
              marginBottom: 10,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Uygula</Text>
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
