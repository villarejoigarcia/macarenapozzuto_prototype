'use client';

import { useEffect } from 'react';
import { PortableTextBlock } from '@sanity/types'
import { PortableText } from '@portabletext/react'
import { useBlur } from '../context/blur-context';
import { useAbout } from '../context/about-context';

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
  // onClose: () => void;
};

export default function About({ data }: AboutProps) {
  // añadir clase sobre blur
  const { setType } = useBlur();
  const { isOpen, close } = useAbout();

  useEffect(() => {
    if (isOpen) {
      setType('about');
    } else {
      setType('');
    }
  }, [isOpen, setType]);

   if (!isOpen) return null;

  // // cerrar con ESC
  // useEffect(() => {
  //   const onKeyDown = (e: KeyboardEvent) => {
  //     if (e.key === 'Escape') onClose();
  //   };
  //   window.addEventListener('keydown', onKeyDown);
  //   return () => window.removeEventListener('keydown', onKeyDown);
  // }, [onClose]);

  // if (!data) return null;

  return (


    <section className="z-99 flex flex-col fixed inset-0 w-screen px-[calc(100%/3)] py-(--kv) h-screen gap-(--divider) overflow-scroll">
      
      {data?.bio && (
          <PortableText value={data?.bio} />
      )}

      {data?.services && data?.services?.length > 0 && (
        <div>
          <h2 className='mb-(--kv)'>Services</h2>
          <ul>
            {data?.services.map((s: any) => (
              <li key={s._id}>{s.title}</li> // puedes reemplazar con el título real de la referencia
            ))}
          </ul>
        </div>
      )}

      {data?.experience && (
        <div>
          <h2 className='mb-(--kv)'>Experience</h2>
          <PortableText value={data?.experience} />
        </div>
      )}

      {data?.mail && data?.instagram && (
        <div>
          <h2 className='mb-(--kv)'>Contact</h2>
          <a href={`mailto:${data?.mail}`} className="block">{data?.mail}</a>
          <a href={`https://www.instagram.com/${data?.instagram}`} target="_blank" className="block">@{data?.instagram}</a>
        </div>
      )}

      {data?.imprint && (
        <div className="mt-auto">
          <PortableText value={data?.imprint} />
        </div>
      )}

    </section>

  );
}