'use client';

import { shuffle } from './functions/shuffle';
import { useEffect, useRef, useState } from 'react';


type ArchiveItem = {
  _id: string;
  title: string;
  images: { asset: { url: string } }[];
};

type ArchiveListProps = {
  data: ArchiveItem[];
};

export default function ArchiveList({ data }: ArchiveListProps) {
  const [items, setItems] = useState<ArchiveItem[]>([]);
  const [ready, setReady] = useState(false);

  const hasShuffled = useRef(false);

  useEffect(() => {
    if (hasShuffled.current) return;

    const shuffled = data.map(item => ({
      ...item,
      images: shuffle(item.images),
    }));

    setItems(shuffled);
    requestAnimationFrame(() => setReady(true));

    hasShuffled.current = true;
  }, [data]);

  return (
    <>
      {items.map((item) => (
        <div key={item._id} className="grid grid-cols-6">
          {item.images.map((img, i) => (
            <img
              key={img.asset.url}
              src={img.asset.url}
              style={{ transitionDelay: `${i * 50}ms` }}
              className={`
                w-full h-auto opacity-0 transition-all duration-500
                ${ready ? 'opacity-100 blur-none' : 'blur-xs'}
              `}
            />
          ))}
        </div>
      ))}
    </>
  );
}