"use client";

import { useRef, useState, useEffect, useLayoutEffect } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { scrollPost } from './scroll-x';
import { getPostTop } from './post-top';
import Footer from './footer';
import { Drag } from './drag';

const createBezierEasing = (x1: number, y1: number, x2: number, y2: number) => {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;

  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;

  const sampleCurveX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleCurveY = (t: number) => ((ay * t + by) * t + cy) * t;
  const sampleCurveDerivativeX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;

  return (x: number) => {
    const progress = Math.min(Math.max(x, 0), 1);
    let t = progress;

    for (let i = 0; i < 6; i += 1) {
      const currentX = sampleCurveX(t) - progress;
      const currentSlope = sampleCurveDerivativeX(t);
      if (Math.abs(currentX) < 1e-5 || currentSlope === 0) break;
      t -= currentX / currentSlope;
    }

    return sampleCurveY(Math.min(Math.max(t, 0), 1));
  };
};

// const cssEase = createBezierEasing(0.25, 0.1, 0.25, 1);
const cssEase = createBezierEasing(0.42, 0, 0.58, 1);

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
  const [textHeight, setTextHeight] = useState(0);
  const pageScrollRafRef = useRef<number | null>(null);
  const hadInnerScrollRef = useRef(false);
  const recenterTimeoutRef = useRef<number | null>(null);
  const skipNextAutoCenterRef = useRef(false);
  const prevPageYRef = useRef(0);
  const [isMobile, setIsMobile] = useState(false);
  const { scrollY } = useScroll();
  const [isHover, setIsHover] = useState(false);
  const [isInfo, setIsInfo] = useState(false);
  // const isAnimatingRef = useRef(false);

  const images = [
    `/images/item${index}/image1.webp`,
    `/images/item${index}/image2.webp`,
    `/images/item${index}/image3.webp`,
    `/images/item${index}/image4.webp`,
    `/images/item${index}/image5.webp`,
    // Añade aquí más imágenes si es necesario
  ];

  const scaleRaw = useTransform(scrollY, (latest) => {
    if (!ref.current || !isExpanded && !isMobile) return 1;

    const rect = ref.current.getBoundingClientRect();

    let viewportCenter;
    let elementCenter;

    // if (latest === 0) {
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

Drag(ref as React.RefObject<HTMLElement>, isActive);

  // const wasActiveRef = useRef(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    prevPageYRef.current = window.scrollY;

    const unsubscribe = scrollY.on("change", () => {
      if (!ref.current) return;

      const currentPageY = window.scrollY;
      const verticalDelta = Math.abs(currentPageY - prevPageYRef.current);
      const hasVerticalPageScroll = verticalDelta > 10;

      if (isActive && hadInnerScrollRef.current && hasVerticalPageScroll) {
        scrollPost(ref.current, 1000);
        hadInnerScrollRef.current = false;
      }

      // prevPageYRef.current = currentPageY;

      const rect = ref.current.getBoundingClientRect();
      const viewportTrigger = !isMobile ? window.innerHeight / 2 : window.innerHeight / 3;
      const activeByPosition = rect.top <= viewportTrigger && rect.bottom >= viewportTrigger;
      
      if (isAnimatingRef.current) return;

      if (activeByPosition) {
        onActivate(index);
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
      // const offset = isMobile ? node.scrollTop : node.scrollLeft;
      const offset = node.scrollLeft;
      hadInnerScrollRef.current = offset > 0;
    };

    node.addEventListener("scroll", handleInnerScroll, { passive: true });
    return () => node.removeEventListener("scroll", handleInnerScroll);
  // }, [isMobile]);
  }, []);

  // useLayoutEffect(() => {
  //   const updateTextHeight = () => {
  //     if (!textRef.current) return;
  //     setTextHeight(textRef.current.scrollHeight);
  //   };

  //   updateTextHeight();
  //   window.addEventListener("resize", updateTextHeight);
  //   return () => window.removeEventListener("resize", updateTextHeight);
  // }, []);

  useLayoutEffect(() => {
    if (textRef.current) {
      setTextHeight(textRef.current.scrollHeight);
    }
  }, []);

  const widthSpring = useSpring(scaleRaw, {
    stiffness: 1200,
    damping: 200,
    mass: 1,
  });

  // Mobile uses width animation instead of transform scale.
  const mobileWidth = useTransform(widthSpring, [0.75, 1], ["50%", "100%"]);

  const opacityClass = (isActive && isExpanded) || (isActive && isMobile) || (isHover && !isMobile && !isExpanded) ? 'opacity-100 delay-500' : 'opacity-0';

  useEffect(() => {
    if (!ref.current) return;

    if (!isActive) {
      scrollPost(ref.current, 1000);
    }

    // wasActiveRef.current = isActive;
  }, [isActive]);

  // useEffect(() => {
  //   return () => {
  //     if (pageScrollRafRef.current !== null) {
  //       cancelAnimationFrame(pageScrollRafRef.current);
  //     }
  //   };
  // }, []);

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

  const scrollToCenter = () => {
    // if (index === 1) return;
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const elementCenterY = rect.top + rect.height / 2 + window.scrollY;
    const target = Math.max(0, elementCenterY - window.innerHeight / 2);
    animatePageScrollTo(target, duration).catch(() => {});
  };

  useEffect(() => {
    if (!isActive || !isExpanded) return;

    if (skipNextAutoCenterRef.current) {
      skipNextAutoCenterRef.current = false;
      return;
    }

    recenterTimeoutRef.current = window.setTimeout(() => {
      scrollToCenter();
      recenterTimeoutRef.current = null;
      document.body.style.overflow = "hidden";
      window.setTimeout(() => {
        document.body.style.overflow = "scroll";
      }, duration);
    }, 1000);

    return () => {
      if (recenterTimeoutRef.current !== null) {
        window.clearTimeout(recenterTimeoutRef.current);
        recenterTimeoutRef.current = null;
      }
    };
  }, [isActive, isExpanded]);

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

  const resetCurrentScroll = () => {
    if (!ref.current) return;
    scrollPost(ref.current, duration);
    hadInnerScrollRef.current = false;
  };

  return (
    // <div className={`flex flex-col items-center lg:px-[33.333vw] relative`}>
    <div className={`w-full relative transition-height ${classDuration} ease-[cubic-bezier(0.42,0,0.58,1)] ${isExpanded ? 'lg:h-[75vh]' : 'lg:h-[27.5vh]'} ${isHover ? 'lg:h-[33.333vh]' : 'lg:h-[27.5vh]'}`}>
      <div
        ref={ref}
        className={`item w-full h-full relative flex justify-center ${(isActive && isExpanded) || (isActive && isMobile) || (isHover && !isMobile && !isExpanded) ? 'overflow-x-auto cursor-ew-resize' : 'overflow-hidden cursor-pointer'}`}
        
      >
        <motion.div
          style={isMobile ? { width: mobileWidth } : { scale: widthSpring }}
          className="origin-center lg:w-fit h-full will-change-transform flex justify-center"
            onClick={handleClick}
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
        className={`flex w-full px-[10px] transition-all duration-1000 ${isActive && isMobile ? `py-[10px_5px] h-[30px]` : !isMobile ? 'py-[10px_5px]' : 'h-0 py-0'}`}
  
      >
        <p className={`flex-1 lg:grow-1 grow-0 mr-[.2em] opacity-0 transition-opacity duration-500 ${opacityClass}`}>{index}.</p>
        <p className={`flex-1 grow-1 opacity-0 transition-opacity duration-500 ${opacityClass}`}>Fotosprint</p>

        {!isMobile && (

          <>

            <p
              className={`relative z-50 flex-1 grow-[0.5] opacity-0 transition-opacity duration-500 ${isExpanded && isActive ? 'opacity-100 delay-500' : 'opacity-0'}`}
              onClick={() => setIsInfo(prev => !prev)}
            >+ Info</p>

            <div className={`flex-1 grow-[2.5] opacity-0 transition-opacity duration-500 -translate-y-full pointer-events-none ${isInfo && isActive ? 'opacity-100' : 'opacity-0'}`}>
              <p className="relative mr-[20%] top-[1em]">Lupai is an AI assistant designed to answer questions about migration and local work dynamics in Germany. The project was born out of the concrete needs of migrants facing the difficulties of German bureaucracy. As there is no single, reliable source of information in Spanish or English, Lupai’s team decided to create an app that could meet these needs and help the whole community.</p>
            </div>

          </>

        )}
        

        <p className={`flex-1 grow-[0.5] opacity-0 transition-opacity duration-500 ${opacityClass}`}>Brand identity</p>
        <p className={`flex-1 grow-[0.5] text-right opacity-0 transition-opacity duration-500 ${opacityClass}`}>2025</p>
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
  <div
    ref={wrapperRef}
    className={`wrapper flex flex-col gap-[5px] items-center overflow-hidden transition-all duration-1000 ease-[cubic-bezier(0.42,0,0.58,1)] ${isExpanded ? 'lg:pb-[6.5%]' : 'lg:pb-[25px]'}`}
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
        className={`transition-[padding-top] duration-1000 ease-[cubic-bezier(0.42,0,0.58,1)] ${isLastItemOutOfView ? 'lg:pb-[0]' : 'lg:pb-[400dvh]'}`}
        onClick={() => animatePageScrollToTop(3000)}>
        <Footer />
      </div>
    </>
  );
}