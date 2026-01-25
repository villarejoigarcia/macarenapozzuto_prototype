'use client';

import { useRouter } from 'next/navigation';

interface FadeLinkProps {
  href: string;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export function FadeLink({ href, className, children, onClick }: FadeLinkProps) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();

    if (onClick) onClick(); // tu función close

    setTimeout(() => {
      router.push(href);
    }, 500); // duración del fadeout
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      className={className}
    >
      {children}
    </a>
  );
}