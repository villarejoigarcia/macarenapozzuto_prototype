'use client';

import { shuffle } from './functions/shuffle';
import { useEffect, useRef, useState } from 'react';
import { scrollArchive } from './functions/scroll-archive';
import { useBlur } from '../../context/blur-context';

type ImageItem = {
  asset: { url: string };
  title?: string;
  _type?: string;
};

type ArchiveListProps = {
  data: ImageItem[];
};

export default function ArchiveList({ data }: ArchiveListProps) {
  const [items, setItems] = useState<ImageItem[]>([]);
  const [zoomImg, setZoomImg] = useState<string | null>(null);
  const [visibleSet, setVisibleSet] = useState<Set<string>>(new Set());
  const [scales, setScales] = useState<Record<string, number>>({});
  const [origins, setOrigins] = useState<Record<string, string>>({});

  const [showText, setShowText] = useState<boolean>(false);
  const [textValue, setTextValue] = useState<string | null>(null);
  const [lastTitle, setLastTitle] = useState<string | null>(null);

  const hasShuffled = useRef(false);
  const imgRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  function urlFor(media: ImageItem) {
    // Assuming urlFor is a function that returns an object with a url() method for images
    // This function should be defined or imported accordingly.
    // For demonstration, returning the media.asset.url directly.
    return {
      url: () => media.asset.url,
    };
  }

  const { setType } = useBlur();

  useEffect(() => {
    setType('');
  }, [setType]);

  useEffect(() => {
    if (hasShuffled.current) return;

    // Normalizar los items: asegurar _type, asset.url y title
    const normalized: ImageItem[] = data.flatMap((item: any) => {
      // Si es array de imágenes dentro de post
      if (item.images?.length) {
        return item.images
          .map((img: any) => {
            const assetUrl = img._type === 'image' ? img.asset?.url : img.asset?.url;
            if (!assetUrl) return null;
            return {
              _type: img._type,
              asset: { url: assetUrl },
              title: img.title || item.title || '',
            } as ImageItem;
          })
          .filter(Boolean);
      }

      // Si es cover de post
      if (item.cover?.asset?.url) {
        return [
          {
            _type: item.cover._type || 'image',
            asset: { url: item.cover.asset.url },
            title: item.cover.asset.title || '',
          } as ImageItem,
        ];
      }

      // Si es directamente del archive
      if (item.asset?.url) {
        return [
          {
            _type: item._type || 'image',
            asset: { url: item.asset.url },
            title: item.title || '',
          } as ImageItem,
        ];
      }

      return [];
    });

    const shuffled = shuffle(normalized);
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

  // useEffect(() => {
  //   if (zoomImg) {
  //     document.body.style.overflow = 'hidden';
  //   } else {
  //     document.body.style.overflow = '';
  //   }

  //   return () => {
  //     document.body.style.overflow = '';
  //   };
    
  // }, [zoomImg]);

  

  function getOriginClassForElement(el: HTMLElement) {
    const rect = el.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const isMobile = viewportWidth < 1024;
    const topThreshold = 120;
    const totalColumns = isMobile ? 2 : 6;

    const container = document.getElementById('archive');
    const containerRect = container?.getBoundingClientRect();
    const baseLeft = containerRect?.left ?? 0;
    const baseWidth = containerRect?.width ?? viewportWidth;

    // Section-based detection using container coordinates for both layouts.
    const centerX = rect.left - baseLeft + rect.width / 2;
    const sectionWidth = Math.max(1, baseWidth / totalColumns);
    const colIndex = Math.min(totalColumns - 1, Math.max(0, Math.floor(centerX / sectionWidth)));

    const isTop = rect.top <= topThreshold;
    const isFirstColumn = colIndex === 0;
    const isLastColumn = colIndex === totalColumns - 1;

    if (isTop) {
      if (isFirstColumn) return '0% 0%';
      if (isLastColumn) return '100% 0%';
      return '50% 0%';
    }

    if (isFirstColumn) return '0% 50%';
    if (isLastColumn) return '100% 50%';
    return '50% 50%';
  }

  function updateOriginForUrl(url: string) {
    const el = imgRefs.current.get(url);
    if (!el) return;

    const nextOrigin = getOriginClassForElement(el);
    setOrigins((prev) => {
      if (prev[url] === nextOrigin) return prev;
      return { ...prev, [url]: nextOrigin };
    });
  }

  useEffect(() => {
    if (!items.length) return;

    const onResize = () => {
      imgRefs.current.forEach((_, url) => updateOriginForUrl(url));
    };

    onResize();
    window.addEventListener('resize', onResize);

    return () => window.removeEventListener('resize', onResize);
  }, [items]);

  useEffect(() => {
    if (zoomImg) {
      const activeImage = items.find(img => {
        if (!img) return false;

        if (img._type === 'image') {
          return img.asset ? urlFor(img).url() === zoomImg : false;
        } else {
          return img.asset ? img.asset.url === zoomImg : false;
        }
      }); const title = activeImage?.title?.trim() || '';
      setTextValue(zoomImg);
      setLastTitle(title);
      setShowText(true);
    } else {
      setTimeout(() => {
        setShowText(false);
        setTextValue(null);
      });
    }
  }, [zoomImg, items]);

  useEffect(() => {
    if (!zoomImg) return;

    const closeZoom = () => setZoomImg(null);

    const handleKeyDown = (event: KeyboardEvent) => {
      const scrollKeys = [
        'ArrowUp',
        'ArrowDown',
        'PageUp',
        'PageDown',
        'Home',
        'End',
        ' ',
      ];

      if (scrollKeys.includes(event.key)) {
        closeZoom();
      }
    };

    window.addEventListener('wheel', closeZoom, { passive: true });
    window.addEventListener('touchmove', closeZoom, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('wheel', closeZoom);
      window.removeEventListener('touchmove', closeZoom);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [zoomImg]);

  function handleMediaLoad(e: React.SyntheticEvent<HTMLImageElement | HTMLVideoElement, Event>, url: string) {
    let naturalWidth = 0;
    let naturalHeight = 0;

    const target = e.currentTarget;

    if (target instanceof HTMLImageElement) {
      naturalWidth = target.naturalWidth;
      naturalHeight = target.naturalHeight;
    } else if (target instanceof HTMLVideoElement) {
      naturalWidth = target.videoWidth;
      naturalHeight = target.videoHeight;
    }

    const windowWidth = window.innerWidth;
    let scale = 1;

    if (!naturalWidth || !naturalHeight) {
      setScales((prev) => ({ ...prev, [url]: 1 }));
      return;
    }

    const ratio = naturalWidth / naturalHeight;
    const isVerticalExtreme = ratio <= 0.4;
    const isVerticalLarge = ratio > 0.4 && ratio < 0.67;
    const isVertical = ratio > 0.67 && ratio < 0.9;
    const isSquare = ratio >= 0.9 && ratio < 1.2;
    const isHorizontal = ratio >= 1.2;

    if (windowWidth >= 1024) {
      // Desktop
      if (isVerticalExtreme) scale = 1.05;
      else if (isVerticalLarge) scale = 1.34;
      else if (isVertical) scale = 1.75;
      else if (isSquare) scale = 1.75;
      else if (isHorizontal) scale = 2.25;
    } else {
      // Mobile
      if (isVerticalExtreme) scale = 1.25;
      else if (isVerticalLarge) scale = 1.5;
      else if (isVertical) scale = 2;
      else if (isSquare) scale = 2;
      else if (isHorizontal) scale = 2;
    }

    setScales((prev) => ({ ...prev, [url]: scale }));
    updateOriginForUrl(url);
  }

  return (
    <>
      <div className="lg:grid lg:grid-cols-6 columns-2 gap-0" id='archive'>
        {items.map((media, index) => {
          const mediaUrl =
            media._type === 'image'
              ? media.asset ? urlFor(media).url() : null
              : media.asset ? media.asset.url : null;

          if (!mediaUrl) return null; // evita renderizar si no hay URL

          const isZoomed = zoomImg === mediaUrl;
          const isVisible =
            media._type === 'image'
              ? visibleSet.has(urlFor(media).url())
              : visibleSet.has(media.asset?.url || '');

          let opacityClass = 'opacity-0';
          let zIndex = 'z-0 delay-0';

          if (isZoomed) {
            opacityClass = 'opacity-100';
            zIndex = 'z-20';
          } else if (zoomImg && isVisible) {
            opacityClass = 'opacity-10';
          } else if (!zoomImg && isVisible) {
            opacityClass = 'opacity-100';
            zIndex = 'z-0 delay-500';
          }

          const transformOrigin = origins[mediaUrl] ?? 'center center';

          const dynamicScale = scales[mediaUrl] ?? 1;
          const mediaSrc = mediaUrl;

          return (
            <div
              key={mediaSrc}
              ref={(el) => {
                if (el) imgRefs.current.set(mediaSrc, el);
              }}
              className={`${zIndex} relative cursor-pointer w-full`}
              onClick={() => {
                if (zoomImg) {
                  setZoomImg(null);
                  return;
                }

                setZoomImg(mediaSrc);

                const el = imgRefs.current.get(mediaSrc);
                if (el) scrollArchive(el);
              }}
            >
              {media._type === 'image' ? (
                <img
                  data-observe
                  src={mediaSrc}
                  onLoad={(e) => handleMediaLoad(e, mediaSrc)}
                  className={`w-full h-auto transition-all duration-500 will-change-transform ${opacityClass}`}
                  style={{
                    transform: isZoomed ? `scale(${dynamicScale})` : 'scale(1)',
                    transformOrigin,
                  }}
                />
              ) : (
                <video
                  data-observe
                  src={mediaSrc}
                  loop
                  autoPlay
                  muted
                  playsInline
                  onLoadedMetadata={(e) => handleMediaLoad(e, mediaSrc)}
                  className={`w-full h-auto transition-all duration-500 ${opacityClass}`}
                  style={{
                    transform: isZoomed ? `scale(${dynamicScale})` : 'scale(1)',
                    transformOrigin,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      <p className={`lg:w-full w-[66.67%] text-center px-(--kv) fixed left-[50vw] translate-x-[-50%] bottom-(--kv) z-100 pointer-events-none transition-opacity duration-500 ${showText ? 'opacity-100' : 'opacity-0'}`}>
        {lastTitle}
      </p>
    </>
  );
} 