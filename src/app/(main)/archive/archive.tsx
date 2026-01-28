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
          let zIndex = 'z-0 delay-0'

          if (isZoomed) {
            scaleClass = 'scale-200';
            opacityClass = 'opacity-100 cursor-zoom-out';
            blurClass = 'blur-none';
            zIndex = 'z-[8]';
          } else if (zoomImg && isVisible) {
            opacityClass = 'opacity-10 cursor-zoom-in';
            blurClass = 'blur-xs';
          } else if (!zoomImg && isVisible) {
            opacityClass = 'opacity-100 cursor-zoom-in';
            blurClass = 'blur-none';
            zIndex = 'z-0 delay-500';
          }

          const column = index % 6;

          let originClass = 'origin-center';

          if (index < 6) {
            originClass = 'origin-top';
          } else {
            if (column === 0) originClass = 'origin-[0%_50%]';
            if (column === 5) originClass = 'origin-[100%_50%]';
          }

          const fileName = img.asset.url.split('/').pop();

          return (
            // <img
            //   data-observe
            //   key={img.asset.url}
            //   src={img.asset.url}
            //   className={`w-full h-auto transition-all duration-500 ${scaleClass} ${opacityClass} ${blurClass} ${originClass}`}
            //   onClick={() => setZoomImg(prev => (prev === img.asset.url ? null : img.asset.url))}
            // />

            <div
              key={img.asset.url}
              className={`${zIndex}`}
            >
              <img
                data-observe
                src={img.asset.url}
                className={`w-full h-auto transition-all duration-500 ease-in-out ${scaleClass} ${opacityClass} ${blurClass} ${originClass}`}
                onClick={() =>
                  setZoomImg(prev => (prev === img.asset.url ? null : img.asset.url))
                }
              />
                <div className={`${isZoomed && fileName ? 'opacity-100' : 'opacity-0'} transition duration-500 pointer-events-none fixed left-[50vw] translate-x-[-50%] bottom-(--kv) text-white mix-blend-difference`}>
                  {fileName}
                </div>
            </div>

          );
        })}
      </div>
    </>
  );
}