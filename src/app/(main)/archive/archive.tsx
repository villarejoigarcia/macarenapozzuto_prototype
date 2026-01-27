'use client';

import { shuffle } from './functions/shuffle';
import { useEffect, useRef, useState } from 'react';


type ImageItem = {
  asset: { url: string };
};

type ArchiveListProps = {
  data: ImageItem[];
};

export default function ArchiveList({ data }: ArchiveListProps) {
  const [items, setItems] = useState<ImageItem[]>([]);
  const [zoomImg, setZoomImg] = useState<string | null>(null);
  const [visibleSet, setVisibleSet] = useState<Set<string>>(new Set());

  const hasShuffled = useRef(false);

  useEffect(() => {
    if (hasShuffled.current) return;

    const shuffled = shuffle(data);
    setItems(shuffled);

    hasShuffled.current = true;
  }, [data]);

  useEffect(() => {
    if (!items.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        setVisibleSet((prev) => {
          const newSet = new Set(prev);
          entries.forEach((entry) => {
            const el = entry.target as HTMLElement;
            const key = el.getAttribute('src');
            if (!key) return;

            if (entry.isIntersecting) {
              newSet.add(key);
            } else {
              newSet.delete(key);
            }
          });
          return newSet;
        });
      },
      {
        threshold: 0.2,
      }
    );

    const elements = document.querySelectorAll('[data-observe]');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [items]);

  return (
    <>
      <div className="grid lg:grid-cols-6 grid-cols-2">
        {items.map((img, index) => {
          const isZoomed = zoomImg === img.asset.url;
          const isVisible = visibleSet.has(img.asset.url);

          let opacityClass = 'opacity-0';
          let blurClass = 'blur-xs';
          let scaleClass = 'scale-100 z-0';

          if (isZoomed) {
            scaleClass = 'scale-200 z-[2]';
            opacityClass = 'opacity-100 cursor-zoom-out';
            blurClass = 'blur-none';
          } else if (zoomImg && isVisible) {
            opacityClass = 'opacity-30 cursor-zoom-in';
            blurClass = 'blur-xs';
          } else if (!zoomImg && isVisible) {
            opacityClass = 'opacity-100 cursor-zoom-in';
            blurClass = 'blur-none';
          }

          // Determine origin class based on column index for desktop (6 columns)
          const column = index % 6;
          const originClass = column < 3 ? 'origin-top-left' : 'origin-top-right';

          return (
            <img
              data-observe
              key={img.asset.url}
              src={img.asset.url}
              className={`w-full h-auto transition-all duration-500 ${scaleClass} ${opacityClass} ${blurClass} ${originClass}`}
              onClick={() => setZoomImg(prev => (prev === img.asset.url ? null : img.asset.url))}
            />
          );
        })}
      </div>
    </>
  );
}