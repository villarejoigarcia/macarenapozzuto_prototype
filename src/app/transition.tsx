'use client';

import { usePathname } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';

type PageFadeProps = {
  children: ReactNode;
};

export default function PageFade({ children }: PageFadeProps) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);
  const [currentPath, setCurrentPath] = useState(pathname);

  // Detecta cambio de ruta
  useEffect(() => {
    if (pathname !== currentPath) {
      // Fade-out de la página actual
      setVisible(false);
    }
  }, [pathname, currentPath]);

  // Cuando la opacidad es 0 y cambia la ruta, actualizamos el path
  useEffect(() => {
    if (!visible && pathname !== currentPath) {
      setCurrentPath(pathname);
      setVisible(true); // Fade-in de la nueva página
    }
  }, [visible, pathname, currentPath]);

  return (
    <div
      className={`transition-opacity duration-500 ease-in-out ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {children}
    </div>
  );
}