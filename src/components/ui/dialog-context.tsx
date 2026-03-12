/**
 * Dialog Stack Context - Nested dialog z-index yönetimi
 *
 * Nested dialog'ların doğru z-index'e sahip olmasını sağlar.
 * Her yeni dialog açıldığında level artırılır, kapandığında azaltılır.
 */

import React, { createContext, useContext, useState, useCallback } from 'react';

interface DialogStackContextValue {
  level: number;
  incrementLevel: () => void;
  decrementLevel: () => void;
}

const DialogStackContext = createContext<DialogStackContextValue>({
  level: 0,
  incrementLevel: () => {},
  decrementLevel: () => {},
});

export function useDialogStack() {
  return useContext(DialogStackContext);
}

interface DialogStackProviderProps {
  children: React.ReactNode;
}

export function DialogStackProvider({ children }: DialogStackProviderProps) {
  const [level, setLevel] = useState(0);

  const incrementLevel = useCallback(() => {
    setLevel((prev) => prev + 1);
  }, []);

  const decrementLevel = useCallback(() => {
    setLevel((prev) => Math.max(0, prev - 1));
  }, []);

  return (
    <DialogStackContext.Provider value={{ level, incrementLevel, decrementLevel }}>
      {children}
    </DialogStackContext.Provider>
  );
}
