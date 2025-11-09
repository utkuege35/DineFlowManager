import React, { useEffect } from 'react';
import { Alert, View, Text } from 'react-native';
import { PosProvider, usePosContext } from '@/src/features/pos/state/PosProvider';
import { useUsers } from '@/src/features/pos/hooks/useUsers';
import { useTables } from '@/src/features/pos/hooks/useTables';
import { UserSelectScreen } from '@/src/features/pos/components/UserSelectScreen';
import { TableSelectScreen } from '@/src/features/pos/components/TableSelectScreen';
import { OrderScreen } from '@/src/features/pos/components/OrderScreen/OrderScreen';

// TEST MODE - Basit ekran
export default function TestScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>✅ Uygulama Çalışıyor!</Text>
      <Text style={{ fontSize: 16, marginTop: 20 }}>POS Sistemi Test Modu</Text>
    </View>
  );
}

/*
function PosApp() {
  const { state, dispatch } = usePosContext();
  const { users } = useUsers();
  const { tables, loadTables, isTableOccupied } = useTables();

  useEffect(() => {
    if (state.screen === 'table-select') {
      loadTables();
    }
  }, [state.screen]);

  const selectUser = (user: any) => {
    if (user.pin) {
      dispatch({ type: 'SET_PIN_USER', payload: user });
      dispatch({ type: 'SHOW_MODAL', payload: { modal: 'Pin', show: true } });
    } else {
      dispatch({ type: 'SET_CURRENT_USER', payload: user });
      dispatch({ type: 'SET_SCREEN', payload: 'table-select' });
    }
  };

  const verifyPin = () => {
    if (!state.selectedUserForPin) return;
    
    if (state.pinInput === state.selectedUserForPin.pin) {
      dispatch({ type: 'SET_CURRENT_USER', payload: state.selectedUserForPin });
      dispatch({ type: 'SHOW_MODAL', payload: { modal: 'Pin', show: false } });
      dispatch({ type: 'SET_PIN_INPUT', payload: '' });
      dispatch({ type: 'SET_SCREEN', payload: 'table-select' });
    } else {
      Alert.alert('Hata', 'Yanlış PIN kodu!');
      dispatch({ type: 'SET_PIN_INPUT', payload: '' });
    }
  };

  const changeUser = () => {
    Alert.alert(
      'Kullanıcı Değiştir',
      'Kullanıcı seçim ekranına dönmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Evet',
          onPress: () => {
            dispatch({ type: 'SET_CURRENT_USER', payload: null });
            dispatch({ type: 'SET_SELECTED_TABLE', payload: null });
            dispatch({ type: 'CLEAR_ORDER_ITEMS' });
            dispatch({ type: 'SET_EXISTING_SALE', payload: { saleId: null, items: [] } });
            dispatch({ type: 'SET_SALE_DISCOUNT', payload: null });
            dispatch({ type: 'SET_SCREEN', payload: 'user-select' });
          }
        }
      ]
    );
  };

  const selectTable = (table: any) => {
    dispatch({ type: 'SET_SELECTED_TABLE', payload: table });
    dispatch({ type: 'CLEAR_ORDER_ITEMS' });
    dispatch({ type: 'SET_SCREEN', payload: 'order' });
  };

  if (state.screen === 'user-select') {
    return (
      <UserSelectScreen
        users={users}
        showPinModal={state.showPinModal}
        selectedUserForPin={state.selectedUserForPin}
        pinInput={state.pinInput}
        onSelectUser={selectUser}
        onPinChange={(pin) => dispatch({ type: 'SET_PIN_INPUT', payload: pin })}
        onVerifyPin={verifyPin}
        onCancelPin={() => {
          dispatch({ type: 'SHOW_MODAL', payload: { modal: 'Pin', show: false } });
          dispatch({ type: 'SET_PIN_INPUT', payload: '' });
        }}
      />
    );
  }

  if (state.screen === 'table-select') {
    return (
      <TableSelectScreen
        tables={tables}
        currentUser={state.currentUser}
        isTableOccupied={isTableOccupied}
        onSelectTable={selectTable}
        onChangeUser={changeUser}
        onRefresh={loadTables}
      />
    );
  }

  return <OrderScreen />;
}

function OrderScreenWrapper() {
  return (
    <PosProvider>
      <PosApp />
    </PosProvider>
  );
}
*/
