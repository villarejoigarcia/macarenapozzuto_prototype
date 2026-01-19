'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type AboutContextValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

const AboutContext = createContext<AboutContextValue | undefined>(undefined);

export function AboutProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <AboutContext.Provider
      value={{
        isOpen,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
      }}
    >
      {children}
    </AboutContext.Provider>
  );
}

export function useAbout() {
  const ctx = useContext(AboutContext);
  if (!ctx) throw new Error('useAbout must be used within AboutProvider');
  return ctx;
}