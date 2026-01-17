// src/context/BlurContext.tsx
'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type BlurType = 'about' | 'single' | '';

interface BlurContextValue {
  type: BlurType;
  setType: (type: BlurType) => void;
}

const BlurContext = createContext<BlurContextValue | undefined>(undefined);

export function BlurProvider({ children }: { children: ReactNode }) {
  const [type, setType] = useState<BlurType>('');
  return (
    <BlurContext.Provider value={{ type, setType }}>
      {children}
    </BlurContext.Provider>
  );
}

export function useBlur() {
  const context = useContext(BlurContext);
  if (!context) throw new Error('useBlur must be used within BlurProvider');
  return context;
}