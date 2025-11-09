import { User, Table, Product, SaleItem, SaleDiscount, Screen } from '../types';

export type PosState = {
  screen: Screen;
  currentUser: User | null;
  selectedTable: Table | null;
  orderItems: Product[];
  existingSaleId: string | null;
  existingItems: SaleItem[];
  saleDiscount: SaleDiscount | null;
  showPaymentModal: boolean;
  showDiscountModal: boolean;
  showTransferModal: boolean;
  showMergeModal: boolean;
  showPinModal: boolean;
  selectedUserForPin: User | null;
  pinInput: string;
  discountTarget: 'sale' | 'item' | null;
  selectedItemForDiscount: SaleItem | null;
  discountType: 'percentage' | 'amount';
  discountValue: string;
  selectedTablesForMerge: string[];
};

export type PosAction =
  | { type: 'SET_SCREEN'; payload: Screen }
  | { type: 'SET_CURRENT_USER'; payload: User | null }
  | { type: 'SET_SELECTED_TABLE'; payload: Table | null }
  | { type: 'ADD_ORDER_ITEM'; payload: Product }
  | { type: 'REMOVE_ORDER_ITEM'; payload: string }
  | { type: 'CLEAR_ORDER_ITEMS' }
  | { type: 'SET_EXISTING_SALE'; payload: { saleId: string | null; items: SaleItem[] } }
  | { type: 'SET_SALE_DISCOUNT'; payload: SaleDiscount | null }
  | { type: 'SHOW_MODAL'; payload: { modal: string; show: boolean } }
  | { type: 'SET_PIN_USER'; payload: User | null }
  | { type: 'SET_PIN_INPUT'; payload: string }
  | { type: 'SET_DISCOUNT_MODAL_DATA'; payload: { target: 'sale' | 'item'; item?: SaleItem } }
  | { type: 'SET_DISCOUNT_TYPE'; payload: 'percentage' | 'amount' }
  | { type: 'SET_DISCOUNT_VALUE'; payload: string }
  | { type: 'TOGGLE_TABLE_FOR_MERGE'; payload: string }
  | { type: 'CLEAR_MERGE_SELECTION' }
  | { type: 'RESET_TO_TABLE_SELECT' };

export const initialState: PosState = {
  screen: 'user-select',
  currentUser: null,
  selectedTable: null,
  orderItems: [],
  existingSaleId: null,
  existingItems: [],
  saleDiscount: null,
  showPaymentModal: false,
  showDiscountModal: false,
  showTransferModal: false,
  showMergeModal: false,
  showPinModal: false,
  selectedUserForPin: null,
  pinInput: '',
  discountTarget: null,
  selectedItemForDiscount: null,
  discountType: 'percentage',
  discountValue: '',
  selectedTablesForMerge: [],
};

export function posReducer(state: PosState, action: PosAction): PosState {
  switch (action.type) {
    case 'SET_SCREEN':
      return { ...state, screen: action.payload };
      
    case 'SET_CURRENT_USER':
      return { ...state, currentUser: action.payload };
      
    case 'SET_SELECTED_TABLE':
      return { ...state, selectedTable: action.payload };
      
    case 'ADD_ORDER_ITEM':
      return { ...state, orderItems: [...state.orderItems, action.payload] };
      
    case 'REMOVE_ORDER_ITEM': {
      const idx = state.orderItems.findIndex(p => p.id === action.payload);
      if (idx === -1) return state;
      const copy = [...state.orderItems];
      copy.splice(idx, 1);
      return { ...state, orderItems: copy };
    }
      
    case 'CLEAR_ORDER_ITEMS':
      return { ...state, orderItems: [] };
      
    case 'SET_EXISTING_SALE':
      return {
        ...state,
        existingSaleId: action.payload.saleId,
        existingItems: action.payload.items,
      };
      
    case 'SET_SALE_DISCOUNT':
      return { ...state, saleDiscount: action.payload };
      
    case 'SHOW_MODAL':
      return {
        ...state,
        [`show${action.payload.modal}Modal` as keyof PosState]: action.payload.show,
      } as PosState;
      
    case 'SET_PIN_USER':
      return { ...state, selectedUserForPin: action.payload };
      
    case 'SET_PIN_INPUT':
      return { ...state, pinInput: action.payload };
      
    case 'SET_DISCOUNT_MODAL_DATA':
      return {
        ...state,
        discountTarget: action.payload.target,
        selectedItemForDiscount: action.payload.item || null,
        showDiscountModal: true,
      };
      
    case 'SET_DISCOUNT_TYPE':
      return { ...state, discountType: action.payload };
      
    case 'SET_DISCOUNT_VALUE':
      return { ...state, discountValue: action.payload };
      
    case 'TOGGLE_TABLE_FOR_MERGE': {
      const tableId = action.payload;
      const selected = state.selectedTablesForMerge;
      return {
        ...state,
        selectedTablesForMerge: selected.includes(tableId)
          ? selected.filter(id => id !== tableId)
          : [...selected, tableId],
      };
    }
      
    case 'CLEAR_MERGE_SELECTION':
      return { ...state, selectedTablesForMerge: [] };
      
    case 'RESET_TO_TABLE_SELECT':
      return {
        ...state,
        screen: 'table-select',
        selectedTable: null,
        orderItems: [],
        existingSaleId: null,
        existingItems: [],
        saleDiscount: null,
      };
      
    default:
      return state;
  }
}
