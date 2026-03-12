'use client';

import { useBlur } from '../context/blur-context';

export default function Blur() {
  const { type, setType } = useBlur();

  return (
    <div
      id="blur"
      className={type || 'pointer-events-none'}
      onClick={() => {
        if (type === 'single') {
          setType('');
        } else if (type === 'about') {
          setType('');
        }
      }}
    />
  );
}