'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAbout } from '../context/about-context';

export default function Header() {
  const { open, close, isOpen } = useAbout();

  return (
    <header className="fixed top-0 left-0 lg:w-1/3 w-screen z-100 flex p-(--kv)">
      <h1 className='flex-1'>Macarena Pozzuto</h1>

      <nav className='lg:flex-1 flex-0 flex gap-[.2em]'>

        <button
          onClick={isOpen ? close : close}
          
          className={`cursor-pointer after:content-[','] transition duration-500
            ${isOpen ? 'opacity-33' : 'opacity-100'}`}
        >Projects
        </button>

        <button
          onClick={isOpen ? close : open}
          
          className={`cursor-pointer after:content-[','] transition duration-500
            ${isOpen ? 'opacity-100' : 'opacity-33'}`}
        >About
        </button>

        <button
          className={`cursor-pointer transition duration-500 opacity-33`}
        >Archive
        </button>
        
      </nav>
    </header>
  );
}