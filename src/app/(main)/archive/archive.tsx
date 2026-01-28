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
            opacityClass = 'opacity-100';
            blurClass = 'blur-none';
            zIndex = 'z-[8]';
          } else if (zoomImg && isVisible) {
            opacityClass = 'opacity-10';
            blurClass = 'blur-xs';
          } else if (!zoomImg && isVisible) {
            opacityClass = 'opacity-100';
            blurClass = 'blur-none';
            zIndex = 'z-0 delay-500';
          }

          // desktop: 6 columns
          const columnDesktop = index % 6;
          // mobile: 2 columns
          const columnMobile = index % 2;

          let originClass = 'origin-center';

          // --- MOBILE ---
          if (index < 2) {
            // first mobile row
            if (columnMobile === 0) originClass = 'origin-top-left';
            else originClass = 'origin-top-right';
          } else {
            if (columnMobile === 0) originClass = 'origin-[0%_50%]';
            else originClass = 'origin-[100%_50%]';
          }

          // --- DESKTOP OVERRIDE ---
          if (window.innerWidth >= 1024) {
            if (index < 6) {
              // first desktop row
              if (columnDesktop === 0) originClass = 'origin-top-left';
              else if (columnDesktop === 5) originClass = 'origin-top-right';
              else originClass = 'origin-top';
            } else {
              if (columnDesktop === 0) originClass = 'origin-[0%_50%]';
              else if (columnDesktop === 5) originClass = 'origin-[100%_50%]';
              else originClass = 'origin-center';
            }
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
                className={`cursor-pointer w-full h-auto transition-all duration-500 ease-in-out ${scaleClass} ${opacityClass} ${blurClass} ${originClass}`}
                onClick={() => {
                  setZoomImg((prev) => {
                    if (prev) return null; // if something is open, just close it
                    return img.asset.url; // otherwise open clicked image
                  });
                }}
              />
              <div className={`${isZoomed && fileName ? 'opacity-100' : 'opacity-0'} transition duration-500 pointer-events-none fixed left-[50vw] translate-x-[-50%] bottom-(--kv)`}>
                {fileName}
              </div>
            </div>

          );
        })}
      </div>
    </>
  );
}