'use client';

import { useState, useEffect, ReactNode } from 'react';

interface FadeInWrapperProps {
  children: ReactNode;
}

export default function Wrapper({ children }: FadeInWrapperProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setIsVisible(true));
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className={`transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      {children}
    </div>
  );
}