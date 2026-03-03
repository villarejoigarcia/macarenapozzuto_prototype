"use client";

import { useRef, useState, useEffect, useLayoutEffect } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { scrollPost } from './scroll-x';
import Footer from './footer';
import { Drag } from './drag';

function ScrollItem({ index }: { index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [textHeight, setTextHeight] = useState(0);
  const pageScrollRafRef = useRef<number | null>(null);
  const prevPageYRef = useRef(0);
  const hadInnerScrollRef = useRef(false);
  const isProgrammaticYScrollRef = useRef(false);
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

    return 1 - normalized * .333;
  });

  const [isActive, setIsActive] = useState(false);
  const [isHover, setIsHover] = useState(false);
  const wasActiveRef = useRef(false);

  useEffect(() => {

    prevPageYRef.current = window.scrollY;

    const unsubscribe = scrollY.on("change", () => {

      if (!ref.current) return;

      // restore

      const currentPageY = window.scrollY;
      const verticalDelta = Math.abs(currentPageY - prevPageYRef.current);
      const hasVerticalPageScroll = verticalDelta > 0.5;

      if (isActive && hadInnerScrollRef.current && hasVerticalPageScroll && !isProgrammaticYScrollRef.current) {
        scrollPost(ref.current, 1000);
        hadInnerScrollRef.current = false;
      }

      prevPageYRef.current = currentPageY;

      // activator

      const rect = ref.current.getBoundingClientRect();

      if (!isMobile) {
        const viewportTrigger = window.innerHeight / 2;
        const active = rect.top <= viewportTrigger && rect.bottom >= viewportTrigger;
        setIsActive(active);
      } else {
        const viewportTrigger = window.innerHeight / 2;
        const active = rect.top <= viewportTrigger && rect.bottom >= viewportTrigger;
        setIsActive(active);
      }

    });

    return () => unsubscribe();
  }, [scrollY, isActive]);

  useEffect(() => {
    if (!ref.current) return;

    const node = ref.current;
    const handleInnerScroll = () => {
      const offset = node.scrollLeft;
      hadInnerScrollRef.current = offset > 0;
    };

    node.addEventListener("scroll", handleInnerScroll, { passive: true });
    return () => node.removeEventListener("scroll", handleInnerScroll);
  }, []);

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

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // useEffect(() => {
  //   if (!ref.current) return;

  //   if (wasActiveRef.current && !isActive) {
  //     scrollPost(ref.current, 100);
  //   }

  //   wasActiveRef.current = isActive;
  // }, [isActive]);

  // useEffect(() => {
  //   if (isActive && isHover) {
  //     setIsHover(false);
  //   }
  // }, [isActive, isHover]);

  // useEffect(() => {
  //   return () => {
  //     if (pageScrollRafRef.current !== null) {
  //       cancelAnimationFrame(pageScrollRafRef.current);
  //     }
  //   };
  // }, []);

  Drag(ref as React.RefObject<HTMLElement>, !isMobile);

  const animatePageScrollTo = (targetY: number, duration = 1000) => {
    // if (pageScrollRafRef.current !== null) {
    //   cancelAnimationFrame(pageScrollRafRef.current);
    // }

    isProgrammaticYScrollRef.current = true;

    const startY = window.scrollY;
    const delta = targetY - startY;
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // const ease = 1 - Math.pow(1 - progress, 4);
      const ease = progress < 0.5
        ? 2 * progress * progress
        : -1 + (4 - 2 * progress) * progress;
      const nextY = startY + delta * ease;

      window.scrollTo({ top: nextY, behavior: "auto" });

      if (progress < 1) {
        pageScrollRafRef.current = requestAnimationFrame(step);
      } else {
        pageScrollRafRef.current = null;
        isProgrammaticYScrollRef.current = false;
      }
    };

    pageScrollRafRef.current = requestAnimationFrame(step);
  };

  const handleClick = () => {
    if (!ref.current) return;
    const scrollToCenter = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const elementCenterY = rect.top + rect.height / 2 + window.scrollY;
      const target = Math.max(0, elementCenterY - window.innerHeight / 2);
      animatePageScrollTo(target);
    };

    scrollToCenter();
  };

  return (
    // <div className={`flex flex-col items-center lg:px-[33.333vw] relative`}>
    // <div className={`lg:h-[66.667vh] w-full relative`}>
    <div className={`lg:h-[75vh] w-full relative`}>
      <div
        ref={ref}
        className={`item w-full h-full relative flex justify-center ${isHover || isActive ? 'overflow-scroll' : 'overflow-hidden'}`}


      >
        <motion.div
          style={{ scale: widthSpring }}
          // className="origin-center lg:w-fit w-2/3 h-full will-change-transform flex justify-center"
          className="origin-center cursor-pointer lg:w-fit w-[75%] h-full will-change-transform flex justify-center"
          onMouseEnter={() => !isMobile && setIsHover(true)}
          onMouseLeave={() => !isMobile && setIsHover(false)}
          onClick={handleClick}

        >
          {/* Show the first image directly */}
          <img
            key={0}
            src={images[0]}
            style={{ width: "auto", height: "100%", objectFit: "contain" }}

          />
          {/* Overlay the rest of the images absolutely */}
          <div className={`absolute top-0 left-full h-full w-max pl-[3px] flex ${isHover || isActive ? 'pointer-events-auto' : 'pointer-events-none'}`}
          >
            {images.length > 1 && images.slice(1).map((src, i) => (

              <img
                key={i + 1}
                src={src}
                className={`transition-opacity duration-500 pr-[3px] ${isHover || isActive ? 'opacity-100' : 'opacity-0'}`}
                style={{
                  width: "auto",
                  height: "100%",
                  objectFit: "contain",
                  transitionDelay: `${(isHover || isActive ? i : images.length - 2 - i) * 100}ms`,
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

  const pageTopRafRef = useRef<number | null>(null);
  const autoStartTimeoutRef = useRef<number | null>(null);

  // scroll top

  const animatePageScrollToTop = (duration = 3000) => {

    const startY = window.scrollY;
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = progress < 0.5
        ? 2 * progress * progress
        : -1 + (4 - 2 * progress) * progress;
      const nextY = startY * (1 - ease);

      window.scrollTo({ top: nextY, behavior: "auto" });

      if (progress < 1) {
        pageTopRafRef.current = requestAnimationFrame(step);
      } else {
        pageTopRafRef.current = null;
      }
    };

    pageTopRafRef.current = requestAnimationFrame(step);
  };

  useEffect(() => {
    // Prevent browser scroll restoration on reload
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const scrollToBottom = () => {
      const maxScrollY = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight
      );

      window.scrollTo({ top: maxScrollY, behavior: "auto" });
    };

    // Wait for layout + images to stabilize
    const handleLoad = () => {
      // requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollToBottom();

        autoStartTimeoutRef.current = window.setTimeout(() => {
          animatePageScrollToTop();
          autoStartTimeoutRef.current = null;
        }, 1000);
      });
      // });
    };

    if (document.readyState === "complete") {
      handleLoad();
    } else {
      window.addEventListener("load", handleLoad);
    }

    return () => {
      window.removeEventListener("load", handleLoad);
      if (autoStartTimeoutRef.current !== null) {
        window.clearTimeout(autoStartTimeoutRef.current);
      }
    };
  }, []);


  return (
    // <div ref={containerRef} className="wrapper flex flex-col gap-[5px] items-center pb-[100dvh]">
    <>
      <div className="wrapper flex flex-col items-center pb-[100dvh] overflow-hidden">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <ScrollItem key={i} index={i} />
        ))}
      </div>

      <div onClick={() => animatePageScrollToTop()}>
        <Footer />
      </div>
    </>
  );
}