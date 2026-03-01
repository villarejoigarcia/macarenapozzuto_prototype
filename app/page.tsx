"use client";

import { useRef, useState, useEffect, useLayoutEffect } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { scrollPost } from './scroll-x';

function ScrollItem({
  index,
  isActive,
  onActivate,
}: {
  index: number;
  isActive: boolean;
  onActivate: (index: number | null) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [textHeight, setTextHeight] = useState(0);
  const pageScrollRafRef = useRef<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const { scrollY } = useScroll();

  const images = [
    `/images/item${index}/image1.webp`,
    `/images/item${index}/image2.webp`,
    `/images/item${index}/image3.webp`,
    `/images/item${index}/image4.webp`,
    `/images/item${index}/image5.webp`,
    // Añade aquí más imágenes si es necesario
  ];

  const scaleRaw = useTransform(scrollY, (latest) => {
  if (!ref.current) return 1;

  const rect = ref.current.getBoundingClientRect();

  let viewportCenter;
  let elementCenter;

  // if (latest === 0) {
  if (latest < 50) {
    viewportCenter = 0;
    elementCenter = rect.top;
  } else {
    viewportCenter = window.innerHeight / 2;
    elementCenter = rect.top + rect.height / 2;
  }

  const distance = Math.abs(viewportCenter - elementCenter);
  const maxDistance = window.innerHeight / 2;
  const normalized = Math.min(distance / maxDistance, 1);

  return 1 - normalized * 0.4;
});

  const wasActiveRef = useRef(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const unsubscribe = scrollY.on("change", () => {
      if (!ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const viewportTrigger = !isMobile ? window.innerHeight / 2 : window.innerHeight / 2;
      const activeByPosition = rect.top <= viewportTrigger && rect.bottom >= viewportTrigger;

      if (activeByPosition) {
        onActivate(index);
      } else if (isActive) {
        onActivate(null);
      }
    });

    return () => unsubscribe();
  }, [scrollY, isMobile, onActivate, index, isActive]);

  // useLayoutEffect(() => {
  //   if (textRef.current) {
  //     setTextHeight(textRef.current.scrollHeight);
  //   }
  // }, []);

  const widthSpring = useSpring(scaleRaw, {
    stiffness: 1200,
    damping: 200,
    mass: 1,
  });

  const opacityClass = isActive ? 'opacity-100' : 'opacity-0';

  useEffect(() => {
    if (!ref.current) return;

    if (wasActiveRef.current && !isActive) {
      scrollPost(ref.current, 1334);
    }

    wasActiveRef.current = isActive;
  }, [isActive]);

  useEffect(() => {
    return () => {
      if (pageScrollRafRef.current !== null) {
        cancelAnimationFrame(pageScrollRafRef.current);
      }
    };
  }, []);

  const animatePageScrollTo = (targetY: number, duration = 0) => {
    if (pageScrollRafRef.current !== null) {
      cancelAnimationFrame(pageScrollRafRef.current);
    }

    const startY = window.scrollY;
    const delta = targetY - startY;
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      // const easeOutQuart = 1 - Math.pow(1 - progress, 3);
      const ease = progress < 0.5
            ? 2 * progress * progress
            : -1 + (4 - 2 * progress) * progress;
      const nextY = startY + delta * ease;

      window.scrollTo({ top: nextY, behavior: "auto" });

      if (progress < 1) {
        pageScrollRafRef.current = requestAnimationFrame(step);
      } else {
        pageScrollRafRef.current = null;
      }
    };

    pageScrollRafRef.current = requestAnimationFrame(step);
  };

  const handleClick = () => {
    onActivate(index);
    if (!ref.current) return;
    const scrollToCenter = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const elementCenterY = rect.top + rect.height / 2 + window.scrollY;
      const target = Math.max(0, elementCenterY - window.innerHeight / 2);
      animatePageScrollTo(target, 666);
    };

    scrollToCenter();
  };

  return (
    // <div className={`flex flex-col items-center lg:px-[33.333vw] relative`}>
     <div className={`lg:h-[60vh] w-full relative`}>
      <div
        ref={ref}
        className={`item w-full h-full relative cursor-pointer flex justify-center ${isActive ? 'overflow-scroll' : 'overflow-hidden'}`}
        onClick={handleClick}
      >
        <motion.div
          style={{ scale: widthSpring }}
          className="origin-center lg:w-fit w-2/3 h-full will-change-transform flex justify-center"
            >
          {/* Show the first image directly */}
          <img
            key={0}
            src={images[0]}
            style={{ width: "auto", height: "100%", objectFit: "contain" }}
            
          />
          {/* Overlay the rest of the images absolutely */}
          <div className={`absolute top-0 left-full h-full w-max flex ${isActive ? 'pointer-events-auto' : 'pointer-events-none'}`}
          >
            {images.length > 1 && images.slice(1).map((src, i) => (

              <img
                key={i + 1}
                src={src}
                className={`transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-0'}`}
                style={{
                  width: "auto",
                  height: "100%",
                  objectFit: "contain",
                  transitionDelay: `${(isActive ? i : images.length - 2 - i) * 100}ms`,
                }}
              />

            ))}
          </div>
        </motion.div>
      </div>

      <div 
      ref={textRef}
        
        className={`flex w-full p-[10px]`}
      >
        <p className={`lg:flex-1 flex-0 mr-[.2em] opacity-0 transition-opacity duration-500 ${opacityClass}`}>{index}.</p>
        <p className={`flex-1 grow-2 lg:grow-4 opacity-0 transition-opacity duration-500 ${opacityClass}`}>Fotosprint</p>
        <p className={`flex-1 opacity-0 transition-opacity duration-500 ${opacityClass}`}>Brand identity</p>
        <p className={`flex-0 text-right opacity-0 transition-opacity duration-500 ${opacityClass}`}>2025</p>
      </div>

    </div>
  );
}

export default function Page() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);


  return (
    // <div ref={containerRef} className="wrapper flex flex-col gap-[5px] items-center pb-[100dvh]">
    <div className="wrapper flex flex-col gap-[5px] items-center pb-[100dvh] overflow-hidden">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <ScrollItem
          key={i}
          index={i}
          isActive={activeIndex === i}
          onActivate={setActiveIndex}
        />
      ))}
    </div>
  );
}