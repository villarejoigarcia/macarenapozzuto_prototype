'use client';

import { useEffect, useRef } from 'react';
import { PortableTextBlock } from '@sanity/types'
import { PortableText } from '@portabletext/react'
import { useBlur } from '../context/blur-context';
import { useAbout } from '../context/about-context';
import Imprint from '../components/imprint';

// type AboutData = SanityDocument;

type AboutData = {
  bio?: PortableTextBlock[];
  experience?: PortableTextBlock[];
  services?: { _id: string; title: string }[];
  mail?: string;
  instagram?: string;
  imprint?: PortableTextBlock[];
};

type AboutProps = {
  data: AboutData; // el objeto que viene de Sanity
};

export default function About({ data }: AboutProps) {
  // añadir clase sobre blur
  const { setType } = useBlur();
  const { isOpen, close } = useAbout();
  const aboutRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setType('about');
    } else {
      setType('');
    }
  }, [isOpen, setType]);

  // close
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [close]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClick = (e: MouseEvent) => {
      if (!aboutRef.current) return;

      if (e.target === aboutRef.current) {
        close();
      }
    };

    document.addEventListener('click', handleClick);

    return () => document.removeEventListener('click', handleClick);;
  }, [close]);

  return (

    <section
      ref={aboutRef}
      className={`
        z-99 fixed inset-0 w-screen h-dvh lg:py-(--kv) pb-(--kv) pt-[calc(var(--kv)+var(--lh)*2)] overflow-scroll transition duration-500 ease-in-out flex flex-col
        ${isOpen
          ? 'opacity-100 pointer-events-auto'
          : 'opacity-0 pointer-events-none'}
          `}
    >
      <div
        className='lg:w-1/3 lg:ml-[33.333%] lg:px-0 px-(--kv) flex flex-col items-start gap-(--divider) mb-auto'>

        {data?.bio && (
          <PortableText value={data?.bio} />
        )}

        {data?.services && data?.services?.length > 0 && (
          <div>
            <h2 className='mb-(--kv)'>Services</h2>
            <ul>
              {data?.services.map((s: any) => (
                <li key={s._id}>{s.title}</li> 
              ))}
            </ul>
          </div>
        )}

        {/* {data?.experience && (
        <div>
          <h2 className='mb-(--kv)'>Experience</h2>
          <PortableText value={data?.experience} />
        </div>
      )} */}

        {data?.mail && data?.instagram && (
          <div id="contact">

            <h2 className='mb-(--kv)'>Contact</h2>

            <a
              href={`mailto:${data?.mail}`}
              className="block text-(--link) w-fit transition duration-500">
              {data?.mail}
            </a>

            <a
              href={`https://www.instagram.com/${data?.instagram}`} target="_blank"
              className="block text-(--link) w-fit transition duration-500">
              @{data?.instagram}
            </a>

          </div>
        )}

        {/* {data?.imprint && (
        <div className="mt-auto">
          <PortableText value={data?.imprint} />
        </div>
      )} */}

      </div>

      <div className="px-(--kv)">
        <Imprint/>
      </div>

    </section>

  );
}