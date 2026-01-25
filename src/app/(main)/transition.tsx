'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface TransitionLayoutProps {
  children: React.ReactNode;
}

export default function TransitionLayout({ children }: TransitionLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [nextPath, setNextPath] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false); // controla fadein

  // Mostrar fadein al montar
  useEffect(() => {
    setIsVisible(false);
    const timeout = setTimeout(() => {
      setIsVisible(true);
    }); // delay mínimo para activar transición
    return () => clearTimeout(timeout);
  }, [pathname]);

  // Manejar navegación
  const handleNavigation = (href: string) => {
    setNextPath(href);
    setIsTransitioning(true);
    setIsVisible(false); // iniciar fadeout
  };

  // Cuando termina la transición, navega
  useEffect(() => {
    if (!isTransitioning) return;
    const timeout = setTimeout(() => {
      if (nextPath) {
        router.push(nextPath);
        setIsTransitioning(false);
      }
    }, 500); // duración del fadeout
    return () => clearTimeout(timeout);
  }, [isTransitioning, nextPath, router]);

  // Escuchar clicks SOLO entre home <-> archive
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a');
      if (!anchor) return;
      if (!anchor.href.startsWith(window.location.origin)) return;

      const href = new URL(anchor.href).pathname.replace(/\/$/, '');
      const current = pathname.replace(/\/$/, '');

      const isHomeToArchive =
        (current === '' || current === '/') && href === '/archive';

      const isArchiveToHome =
        current === '/archive' && (href === '' || href === '/');

      const isArchiveToSlug =
        current === '/archive' && href !== '/archive';

      const isSlugToArchive =
        current !== '/archive' && href === '/archive';

      const shouldTransition =
        isHomeToArchive ||
        isArchiveToHome ||
        isArchiveToSlug ||
        isSlugToArchive;

      if (!shouldTransition) return;

      e.preventDefault();
      handleNavigation(href || '/');
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [pathname]);

  return (
    <div
      className={`transition-opacity duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {children}
    </div>
  );
}