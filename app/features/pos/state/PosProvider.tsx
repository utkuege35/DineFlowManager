import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { posReducer, initialState, PosState, PosAction } from './posReducer';

type PosContextType = {
  state: PosState;
  dispatch: React.Dispatch<PosAction>;
};

const PosContext = createContext<PosContextType | undefined>(undefined);

export function PosProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(posReducer, initialState);

  return (
    <PosContext.Provider value={{ state, dispatch }}>
      {children}
    </PosContext.Provider>
  );
}

export function usePosContext() {
  const context = useContext(PosContext);
  if (!context) {
    throw new Error('usePosContext must be used within PosProvider');
  }
  return context;
}
