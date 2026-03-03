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
              title: img.title || item.title || 'Untitled',
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
            title: item.cover.asset.title || 'Untitled',
          } as ImageItem,
        ];
      }

      // Si es directamente del archive
      if (item.asset?.url) {
        return [
          {
            _type: item._type || 'image',
            asset: { url: item.asset.url },
            title: item.title || 'Untitled',
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
      const activeImage = items.find(img => {
        if (!img) return false;

        if (img._type === 'image') {
          return img.asset ? urlFor(img).url() === zoomImg : false;
        } else {
          return img.asset ? img.asset.url === zoomImg : false;
        }
      }); const title = activeImage?.title?.trim() || 'Untitled';
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

    // Clasificar en tres rangos: Extremas, Horizontal, Vertical
    const isExtreme = naturalHeight >= 1.5 * naturalWidth;
    const isHorizontal = naturalWidth > naturalHeight;
    const isVertical = naturalHeight >= naturalWidth;

    if (windowWidth >= 1024) {
      // Desktop
      if (isExtreme) scale = 1.34;
      else if (isHorizontal) scale = 3;
      else if (isVertical) scale = 2;
    } else {
      // Mobile
      if (isExtreme) scale = 1.25;
      else if (isHorizontal) scale = 2;
      else if (isVertical) scale = 2;
    }

    setScales((prev) => ({ ...prev, [url]: scale }));
  }

  return (
    <>
      <div className="lg:grid lg:grid-cols-6 lg:grid-cols-2 columns-2 gap-0" id='archive'>
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
          let blurClass = 'blur-none';
          let zIndex = 'z-0 delay-0';

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
          if (index < 2) originClass = columnMobile === 0 ? 'origin-top-left' : 'origin-top-right';
          else originClass = columnMobile === 0 ? 'origin-[0%_50%]' : 'origin-[100%_50%]';

          if (window.innerWidth >= 1024) {
            if (index < 6)
              originClass =
                columnDesktop === 0
                  ? 'origin-top-left'
                  : columnDesktop === 5
                    ? 'origin-top-right'
                    : 'origin-top';
            else
              originClass =
                columnDesktop === 0
                  ? 'origin-[0%_50%]'
                  : columnDesktop === 5
                    ? 'origin-[100%_50%]'
                    : 'origin-center';
          }

          const dynamicScale = scales[mediaUrl] ?? 1;
          const mediaSrc = mediaUrl;

          return (
            <div
              key={mediaSrc}
              ref={(el) => {
                if (el) imgRefs.current.set(mediaSrc, el);
              }}
              className={`${zIndex} cursor-pointer w-full`}
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
                  className={`w-full h-auto transition-all duration-500 ease-in-out position-absolute ${opacityClass} ${blurClass} ${originClass}`}
                  style={{ transform: isZoomed ? `scale(${dynamicScale})` : 'scale(1)' }}
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
                  className={`w-full h-auto transition-all duration-500 ease-in-out position-absolute ${opacityClass} ${blurClass} ${originClass}`}
                  style={{ transform: isZoomed ? `scale(${dynamicScale})` : 'scale(1)' }}
                />
              )}
            </div>
          );
        })}
      </div>

      <p className={`w-full text-center px-(--kv) fixed left-[50vw] translate-x-[-50%] bottom-(--kv) z-100 pointer-events-none transition-opacity duration-500 ${showText ? 'opacity-100' : 'opacity-0'}`}>
        {lastTitle}
      </p>
    </>
  );
} 