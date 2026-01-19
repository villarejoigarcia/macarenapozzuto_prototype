'use client';

// import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAbout } from '../context/about-context';

export default function Header() {
  const { open, close, isOpen } = useAbout();

    return (
        <header className="fixed top-0 left-0 lg:w-1/3 w-screen z-100 flex p-(--kv)">
            <h1 className='flex-1'>Macarena Pozzuto</h1>

            <nav className='lg:flex-1 flex-0 flex gap-[.2em]'>
                <Link className="after:content-[',']" href="/">Projects</Link>
                <button
                  onClick={isOpen ? close : open}
                  className="after:content-[',']"
                >
                  About
                </button>
                <Link href="">Archive</Link>
            </nav>
        </header>
  );
}