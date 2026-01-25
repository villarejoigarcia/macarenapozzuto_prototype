'use client';

import { createContext, useContext, useState } from 'react';

interface TransitionContextType {
  isFading: boolean;
  startTransition: () => void;
}

const TransitionContext = createContext<TransitionContextType>({
  isFading: false,
  startTransition: () => {},
});

export const TransitionProvider = ({ children }: { children: React.ReactNode }) => {
  const [isFading, setIsFading] = useState(false);

  const startTransition = () => setIsFading(true);

  return (
    <TransitionContext.Provider value={{ isFading, startTransition }}>
      {children}
    </TransitionContext.Provider>
  );
};

export const useTransition = () => useContext(TransitionContext);