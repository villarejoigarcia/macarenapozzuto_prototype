'use client';

import { shuffle } from './functions/shuffle';
import { useEffect, useRef, useState } from 'react';
import { scrollArchive } from './functions/scroll-archive';


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
  const [scales, setScales] = useState<Record<string, number>>({});

  const [showText, setShowText] = useState<boolean>(false);
  const [textValue, setTextValue] = useState<string | null>(null);

  const hasShuffled = useRef(false);
  const imgRefs = useRef<Map<string, HTMLDivElement>>(new Map());

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
        threshold: .05,
      }
    );

    const elements = document.querySelectorAll('[data-observe]');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [items]);

  useEffect(() => {
    if (zoomImg) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [zoomImg]);

  useEffect(() => {
    if (zoomImg) {
      setTextValue(zoomImg);
      setShowText(true);
    } else {
      const timeout = setTimeout(() => {
        setShowText(false);
        setTextValue(null);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [zoomImg]);

  function handleImageLoad(e: React.SyntheticEvent<HTMLImageElement, Event>, url: string) {
    const img = e.currentTarget;
    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;

    const windowWidth = window.innerWidth;

    let scale = 1;

    // Clasificar en tres rangos: Extremas, Horizontal, Vertical
    const isExtreme = naturalHeight >= 1.5 * naturalWidth;
    const isHorizontal = naturalWidth >= naturalHeight;
    const isVertical = naturalHeight > naturalWidth;

    if (windowWidth >= 1024) {
      // Desktop
      if (isExtreme) {
        scale = 1.25;
      } else if (isHorizontal) {
        scale = 2;
      } else if (isVertical) {
        scale = 1.67;
      }
    } else {
      // Mobile
      if (isExtreme) {
        scale = 1.25;
      } else if (isHorizontal) {
        scale = 2;
      } else if (isVertical) {
        scale = 2;
      }
    }

    setScales((prev) => ({ ...prev, [url]: scale }));
  }

  return (
    <>
      <div className="grid lg:grid-cols-6 grid-cols-2">
        {items.map((img, index) => {
          const isZoomed = zoomImg === img.asset.url;
          const isVisible = visibleSet.has(img.asset.url);

          let opacityClass = 'opacity-0';
          let blurClass = 'blur-none';
          let zIndex = 'z-0 delay-0'

          if (isZoomed) {
            opacityClass = 'opacity-100';
            blurClass = 'blur-none';
            zIndex = 'z-[9]';
          } else if (zoomImg && isVisible) {
            opacityClass = 'opacity-10';
            blurClass = 'blur-none';
          } else if (!zoomImg && isVisible) {
            opacityClass = 'opacity-100';
            blurClass = 'blur-none';
            zIndex = 'z-0 delay-500';
          }

          const columnDesktop = index % 6;
          const columnMobile = index % 2;

          let originClass = 'origin-center';

          if (index < 2) {
            if (columnMobile === 0) originClass = 'origin-top-left';
            else originClass = 'origin-top-right';
          } else {
            if (columnMobile === 0) originClass = 'origin-[0%_50%]';
            else originClass = 'origin-[100%_50%]';
          }

          if (window.innerWidth >= 1024) {
            if (index < 6) {
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
          const dynamicScale = scales[img.asset.url] ?? 1;

          return (
            <div
              key={img.asset.url}
              ref={(el) => {
                if (el) imgRefs.current.set(img.asset.url, el);
              }}
              className={`${zIndex} cursor-pointer`}
              onClick={() => {
                // solo actuar si no hay ninguna imagen abierta
                if (zoomImg) {
                  setZoomImg(null);
                  return;
                }

                setZoomImg(img.asset.url);

                const el = imgRefs.current.get(img.asset.url);
                if (el) {
                  scrollArchive(el); // ← más alto = más lento
                }
              }}
            >
              <img
                data-observe
                src={img.asset.url}
                onLoad={(e) => handleImageLoad(e, img.asset.url)}
                className={`w-full h-auto transition-all duration-500 ease-in-out position-absolute ${opacityClass} ${blurClass} ${originClass}`}
                style={{ transform: isZoomed ? `scale(${dynamicScale})` : 'scale(1)' }}
              />
              {/* <p className={`${isZoomed && fileName ? 'opacity-100' : 'opacity-0'} z-100 transition duration-500 pointer-events-none fixed left-[50vw] translate-x-[-50%] bottom-(--kv)`}>
                {fileName}
              </p> */}
            </div>

          );
        })}
      </div>

  <p className={`fixed left-[50vw] translate-x-[-50%] bottom-(--kv) z-100 pointer-events-none transition-opacity duration-500 ${zoomImg ? 'opacity-100' : 'opacity-0'}`}>
    {showText && textValue ? textValue.split('/').pop() : ''}
  </p>
    </>
  );
}