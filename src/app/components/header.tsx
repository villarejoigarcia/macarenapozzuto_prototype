'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAbout } from '../context/about-context';
import { useState } from 'react';
import { FadeLink } from '../fade-link';

export default function Header() {
  const pathname = usePathname();
  const { open, close, isOpen } = useAbout();

  const isProjects = pathname === '/';
  const isArchive = pathname === '/archive';


  return (
    <header className="fixed top-0 left-0 lg:w-1/3 w-screen z-100 flex pt-(--kv) pl-(--kv) lg:pr-0 pr-(--kv)">
      <h1 className="flex-1">Macarena Pozzuto</h1>

      <nav className="lg:flex-1 flex-0 flex gap-[.2em]">

        {/* projects */}
        <FadeLink
          href="/"
          id="home"
          onClick={close}
          className={`cursor-pointer after:content-[','] transition-opactiy duration-500
            ${isProjects && !isOpen ? 'opacity-100' : 'opacity-33'}`}
        >
          Projects
        </FadeLink>

        {/* about */}
        <button
          onClick={isOpen ? close : open}
          className={`cursor-pointer after:content-[','] transition-opactiy duration-500
            ${isOpen ? 'opacity-100' : 'opacity-33'}`}
        >
          About
        </button>

        {/* archive */}
        <FadeLink
          href="/archive"
          onClick={close}
          className={`cursor-pointer transition-opactiy duration-500
            ${isArchive && !isOpen ? 'opacity-100' : 'opacity-33'}`}
        >
          Archive
        </FadeLink>

      </nav>
    </header>
  );
}