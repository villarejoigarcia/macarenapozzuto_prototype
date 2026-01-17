'use client';

import { useBlur } from '../context/blur-context';

export default function Blur() {
  const { type } = useBlur(); // viene del contexto global

  return <div id="blur" className={type || ''}></div>;
}