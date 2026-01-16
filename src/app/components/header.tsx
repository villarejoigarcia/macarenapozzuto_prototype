'use client';

// import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Header() {
//   const [isOpen, setIsOpen] = useState(false);

    return (
        <header className="fixed top-0 left-0 lg:w-1/3 w-screen z-50 flex p-(--kv)">
            <h1 className='flex-1'>Macarena Pozzuto</h1>

            <nav className='lg:flex-1 flex-0 flex gap-[.2em]'>
                <Link className="after:content-[',']" href="/">Projects</Link>
                <Link className="after:content-[',']" href="/about">About</Link>
                <Link href="/about">Archive</Link>
            </nav>
        </header>
  );
}