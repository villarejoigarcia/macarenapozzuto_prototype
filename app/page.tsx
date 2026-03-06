"use client";

import { useRef, useState, useEffect, useLayoutEffect } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { scrollPost } from './scroll-x';
import { getPostTop } from './post-top';
import { Beizer } from './beizer';
import Footer from './footer';
import { Drag } from './drag';
import Blur from './blur';
import { useBlur } from './blur-context';
import { BlurProvider } from './blur-context';

const cssEase = Beizer(0.42, 0, 0.58, 1);

function ScrollItem({
  index,
  isActive,
  isExpanded,
  onExpand,
  onActivate,
  isAnimatingRef,
  isLast
}: {
  index: number;
  isActive: boolean;
  isExpanded: boolean;
  onExpand: (expanded: boolean) => void;
  onActivate: (index: number | null) => void;
  isAnimatingRef: React.RefObject<boolean>;
  isLast: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const pageScrollRafRef = useRef<number | null>(null);
  const hadInnerScrollRef = useRef(false);
  const recenterTimeoutRef = useRef<number | null>(null);
  const skipNextAutoCenterRef = useRef(false);
  const prevPageYRef = useRef(0);
  const [isMobile, setIsMobile] = useState(false);
  const { scrollY } = useScroll();
  const [isHover, setIsHover] = useState(false);
  const [isInfo, setIsInfo] = useState(false);
  const { setType, type } = useBlur();

  const images = [
    `/images/item${index}/image1.webp`,
    `/images/item${index}/image2.webp`,
    `/images/item${index}/image3.webp`,
    `/images/item${index}/image4.webp`,
    `/images/item${index}/image5.webp`,
  ];

  // motion.div

  const scaleRaw = useTransform(scrollY, (latest) => {
    if (!ref.current || !isExpanded && !isMobile) return 1;

    const rect = ref.current.getBoundingClientRect();

    let viewportCenter;
    let elementCenter;

    if (latest < 5) {
      viewportCenter = 0;
      elementCenter = rect.top;
    } else {
      viewportCenter = window.innerHeight / 2;
      elementCenter = rect.top + rect.height / 2;
    }

    if (isMobile && isLast && elementCenter <= window.innerHeight / 2) {
      return 1;
    }

    const distance = Math.abs(viewportCenter - elementCenter);
    const maxDistance = window.innerHeight / 2;
    const normalized = Math.min(distance / maxDistance, 1);

    return 1 - normalized * 0.25;
  });

  const widthSpring = useSpring(scaleRaw, {
    stiffness: 1200,
    damping: 400,
    mass: 10,
  });

  const mobileWidth = useTransform(widthSpring, [0.75, 1], ["50%", "100%"]);

  // drag

  Drag(ref as React.RefObject<HTMLElement>, isActive);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // prevPageYRef.current = window.scrollY;

    const unsubscribe = scrollY.on("change", () => {
      if (!ref.current) return;

      const currentPageY = window.scrollY;
      const verticalDelta = Math.abs(currentPageY - prevPageYRef.current);
      const hasVerticalPageScroll = verticalDelta > 10;

      if (isActive && hadInnerScrollRef.current && hasVerticalPageScroll) {
        scrollPost(ref.current, 750);
        hadInnerScrollRef.current = false;
      }

      // prevPageYRef.current = currentPageY;

      const rect = ref.current.getBoundingClientRect();
      const viewportTrigger = !isMobile ? window.innerHeight / 2 : window.innerHeight / 3;
      const activeByPosition = rect.top <= viewportTrigger && rect.bottom >= viewportTrigger;

      if (isAnimatingRef.current) return;

      if (activeByPosition) {
        onActivate(index);
        setType('');
        setIsInfo(false);
      } else if (isActive) {
        onActivate(null);
      }
    });

    return () => unsubscribe();
  }, [scrollY, isMobile, onActivate, index, isActive]);

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

  // tailwind

  const opacityClass = (isActive && isExpanded) || (isActive && isMobile) || (isHover && !isMobile && !isExpanded) ? 'opacity-100 delay-500' : 'opacity-0';

  // animation

  const animatePageScrollTo = (targetY: number, duration = 0) => {
    return new Promise<void>((resolve) => {
      if (pageScrollRafRef.current !== null) {
        cancelAnimationFrame(pageScrollRafRef.current);
        pageScrollRafRef.current = null;
      }
      const startY = window.scrollY;
      const delta = targetY - startY;
      const startTime = performance.now();

      const step = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = cssEase(progress);
        const nextY = startY + delta * ease;

        window.scrollTo({ top: nextY, behavior: "auto" });

        if (progress < 1) {
          pageScrollRafRef.current = requestAnimationFrame(step);
        } else {
          pageScrollRafRef.current = null;
          resolve();
        }
      };

      pageScrollRafRef.current = requestAnimationFrame(step);
    });
  };

  const duration = 1000;
  const classDuration = 'duration-1000';

  // center post

  const scrollToCenter = () => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const elementCenterY = rect.top + rect.height / 2 + window.scrollY;
    const target = Math.max(0, elementCenterY - window.innerHeight / 2);
    animatePageScrollTo(target, duration).catch(() => { });
  };

  // autoscroll

  useEffect(() => {
    if (!isActive || !isExpanded) return;

    if (skipNextAutoCenterRef.current) {
      skipNextAutoCenterRef.current = false;
      return;
    }

    recenterTimeoutRef.current = window.setTimeout(() => {
      scrollToCenter();
      recenterTimeoutRef.current = null;
      document.body.style.pointerEvents = "none";
      window.setTimeout(() => {
        document.body.style.pointerEvents = "auto";
      }, duration);
    }, 750);

    return () => {
      if (recenterTimeoutRef.current !== null) {
        window.clearTimeout(recenterTimeoutRef.current);
        recenterTimeoutRef.current = null;
      }
    };
  }, [isActive, isExpanded]);

  // click

  const handleClick = async () => {
    if (isAnimatingRef.current || isMobile) return;
    isAnimatingRef.current = true;
    skipNextAutoCenterRef.current = true;

    const shouldCollapse = isExpanded && isActive;

    if (shouldCollapse) {
      onExpand(false);
      const collapsedTarget = getPostTop(index - 1, null);
      await animatePageScrollTo(collapsedTarget, duration);

    } else {
      onExpand(true);
      onActivate(index);
      const target = getPostTop(index - 1, index - 1);
      await animatePageScrollTo(target, duration);
    }

    isAnimatingRef.current = false;
  };

  // reset post scroll

  useEffect(() => {
    if (!ref.current) return;

    if (!isActive) {
      scrollPost(ref.current, 750);
    }

  }, [isActive]);

  const resetCurrentScroll = () => {
    if (!ref.current) return;
    scrollPost(ref.current, 750);
    hadInnerScrollRef.current = false;
  };

  return (
    <div className={`w-full relative transition-height ${classDuration} ease-[cubic-bezier(0.42,0,0.58,1)] ${isExpanded ? 'lg:h-[70vh]' : 'lg:h-[27.5vh]'} ${isHover ? 'lg:h-[33.333vh]' : 'lg:h-[27.5vh]'}`}>
      <div
        ref={ref}
        className={`item w-full h-full relative flex justify-center ${(isActive && isExpanded) || (isHover && !isMobile && !isExpanded) ? 'overflow-x-auto cursor-ew-resize' : 'overflow-hidden cursor-pointer'}`}

      >
        <motion.div
          style={isMobile ? { width: mobileWidth } : { scale: widthSpring }}
          className="origin-center lg:w-fit h-full will-change-transform flex justify-center"
          onClick={() => {
            handleClick();
            resetCurrentScroll();
          }}
          onMouseEnter={() => {
            setIsHover(true);
          }}
          onMouseLeave={() => {
            setIsHover(false);
            if (isExpanded) return;
            resetCurrentScroll();
          }}
        >
          {/* Show the first image directly */}
          <img
            key={0}
            src={images[0]}
            style={{ width: "auto", height: "100%", objectFit: "contain" }}


          />
          {/* Overlay the rest of the images absolutely */}
          {!isMobile && (
            < div className={`absolute top-0 left-full h-full w-max flex px-[3px] gap-[3px] ${(isActive && isExpanded) || (isActive && isMobile) || (isHover && !isMobile) ? 'pointer-events-auto' : 'pointer-events-none'}`}
            >
              {images.length > 1 && images.slice(1).map((src, i) => (

                <img
                  key={i + 1}
                  src={src}
                  className={`transition-opacity duration-500 ${(isActive && isExpanded) || (isActive && isMobile) || (isHover && !isMobile) ? 'opacity-100' : 'opacity-0'}`}
                  style={{
                    width: "auto",
                    height: "100%",
                    objectFit: "contain",
                    transitionDelay: `${((isActive && isExpanded) || (isActive && isMobile) || (isHover && !isMobile) ? i : images.length - 2 - i) * 100}ms`,
                  }}
                />

              ))}
            </div>
          )}
        </motion.div>
      </div>

      <div
        ref={textRef}
        className={`z-50 relative flex w-full px-[10px] transition-all duration-1000 ${isActive && isMobile ? `py-[10px_5px] h-[30px]` : !isMobile ? 'py-[10px_5px]' : 'h-0 py-0'}`}

      >
        <p className={`flex-1 lg:grow-1 grow-0 mr-[.2em] opacity-0 transition-opacity duration-500 ${opacityClass}`}>{index}.</p>
        <p className={`flex-1 lg:grow-1 grow-2 opacity-0 transition-opacity duration-500 ${opacityClass}`}>Fotosprint</p>

        {!isMobile && (

          <>

            <p
              className={`relative z-50 flex-1 grow-[0.5] opacity-0 transition-opacity duration-500 ${isExpanded && isActive ? 'opacity-100 delay-500' : 'opacity-0'}`}
              onClick={() => {
                setType((prev) => (prev === 'single' ? '' : 'single'));
              }}
            >{type === 'single' ? 'Info –' : 'Info +'}
            </p>

            <div className={`z-50 flex-1 grow-[2.5] opacity-0 transition-opacity duration-500 -translate-y-full pointer-events-none ${isActive && type === 'single' ? 'opacity-100' : 'opacity-0'}`}>
              <p className="relative mr-[20%] top-[1em]">Lupai is an AI assistant designed to answer questions about migration and local work dynamics in Germany. The project was born out of the concrete needs of migrants facing the difficulties of German bureaucracy. As there is no single, reliable source of information in Spanish or English, Lupai’s team decided to create an app that could meet these needs and help the whole community.</p>
            </div>

          </>

        )}


        <p className={`flex-1 lg:grow-[0.5] opacity-0 transition-opacity duration-500 ${opacityClass}`}>Brand identity</p>
        <p className={`flex-1 lg:grow-[0.5] grow-0 text-right opacity-0 transition-opacity duration-500 ${opacityClass}`}>2025</p>
      </div>

    </div>
  );
}

export default function Page() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  // const pageScrollRafRef = useRef<number | null>(null);
  const pageTopRafRef = useRef<number | null>(null);
  const autoStartTimeoutRef = useRef<number | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isLastItemOutOfView, setIsLastItemOutOfView] = useState(false);
  const isAnimatingRef = useRef(false);

  // const animatePageScrollTo = (targetY: number, duration = 0) => {
  //   return new Promise<void>((resolve) => {
  //     if (pageScrollRafRef.current !== null) {
  //       cancelAnimationFrame(pageScrollRafRef.current);
  //       pageScrollRafRef.current = null;
  //     }
  //     const startY = window.scrollY;
  //     const delta = targetY - startY;
  //     const startTime = performance.now();

  //     const step = (now: number) => {
  //       const elapsed = now - startTime;
  //       const progress = Math.min(elapsed / duration, 1);
  //       const ease = cssEase(progress);
  //       const nextY = startY + delta * ease;

  //       window.scrollTo({ top: nextY, behavior: "auto" });

  //       if (progress < 1) {
  //         pageScrollRafRef.current = requestAnimationFrame(step);
  //       } else {
  //         pageScrollRafRef.current = null;
  //         resolve();
  //       }
  //     };

  //     pageScrollRafRef.current = requestAnimationFrame(step);
  //   });
  // };

  useEffect(() => {
    const updateLastItemVisibility = () => {
      const items = wrapperRef.current?.querySelectorAll('.item');
      if (!items || items.length === 0) return;

      const lastItem = items[items.length - 1] as HTMLElement;
      const rect = lastItem.getBoundingClientRect();
      // const outOfView = rect.bottom <= window.innerHeight / 1.5;
      const outOfView = rect.bottom <= 50;

      setIsLastItemOutOfView((prev) => (prev === outOfView ? prev : outOfView));
    };

    updateLastItemVisibility();
    window.addEventListener('scroll', updateLastItemVisibility, { passive: true });
    window.addEventListener('resize', updateLastItemVisibility);

    return () => {
      window.removeEventListener('scroll', updateLastItemVisibility);
      window.removeEventListener('resize', updateLastItemVisibility);
    };
  }, []);

  // useEffect(() => {
  //   const handleOutsideClick = (event: MouseEvent) => {
  //     const target = event.target as HTMLElement | null;
  //     if (!target) return;

  //     const clickedInsideMotionDiv = !!target.closest('.origin-center');
  //     if (!clickedInsideMotionDiv) {
  //       if (isExpanded && activeIndex !== null) {
  //         const targetTop = getPostTop(activeIndex - 1, null);
  //         animatePageScrollTo(targetTop, 1000);
  //       }
  //       setIsExpanded(false);
  //     }
  //   };

  //   document.addEventListener('mousedown', handleOutsideClick);
  //   return () => document.removeEventListener('mousedown', handleOutsideClick);
  // }, [isExpanded, activeIndex]);

  // useEffect(() => {
  //   return () => {
  //     if (pageTopRafRef.current !== null) {
  //       cancelAnimationFrame(pageTopRafRef.current);
  //     }
  //   };
  // }, []);

  const animatePageScrollToTop = (duration = 0) => {
    // if (pageTopRafRef.current !== null) {
    //   cancelAnimationFrame(pageTopRafRef.current);
    // }

    const startY = window.scrollY;
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = cssEase(progress);
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

  // useEffect(() => {
  //   const maxScrollY = Math.max(
  //     0,
  //     document.documentElement.scrollHeight - window.innerHeight
  //   );

  //   window.scrollTo({ top: maxScrollY, behavior: "auto" });

  //   autoStartTimeoutRef.current = window.setTimeout(() => {
  //     animatePageScrollToTop(3000);
  //     autoStartTimeoutRef.current = null;
  //   }, 1000);

  //   return () => {
  //     if (autoStartTimeoutRef.current !== null) {
  //       window.clearTimeout(autoStartTimeoutRef.current);
  //     }
  //     if (pageTopRafRef.current !== null) {
  //       cancelAnimationFrame(pageTopRafRef.current);
  //     }
  //   };
  // }, []);


  return (
    // <div ref={containerRef} className="wrapper flex flex-col gap-[5px] items-center pb-[100dvh]">
    <>
    <BlurProvider>
      <div
        ref={wrapperRef}
        className={`wrapper flex flex-col gap-[5px] items-center overflow-hidden transition-padding duration-1000 ease-[cubic-bezier(0.42,0,0.58,1)] ${isExpanded ? 'lg:pb-[15vh]' : 'lg:pb-[25px]'}`}
      >
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i, arrIndex, arr) => (
          <ScrollItem
            key={i}
            index={i}
            isActive={activeIndex === i}
            isExpanded={isExpanded}
            onExpand={setIsExpanded}
            onActivate={setActiveIndex}
            isAnimatingRef={isAnimatingRef}
            isLast={arrIndex === arr.length - 1}
          />
        ))}
      </div>

      <div
        className={`${isLastItemOutOfView ? 'lg:pb-[0]' : 'lg:pb-[500dvh]'}`}
        onClick={() => animatePageScrollToTop(3000)}>
        <Footer />
      </div>
      <Blur />
      </BlurProvider>
    </>
  );
}