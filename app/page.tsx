"use client";

import { useRef, useState, useEffect, useLayoutEffect } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

function ScrollItem({ index }: { index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [textHeight, setTextHeight] = useState(0);
  const { scrollY } = useScroll();

  const scaleRaw = useTransform(scrollY, () => {
  // const scale = useTransform(scrollY, () => {
    if (!ref.current) return 0.333;

    const rect = ref.current.getBoundingClientRect();
    const viewportCenter = window.innerHeight / 2;
    const elementCenter = rect.top + rect.height / 2;

    const distance = Math.abs(viewportCenter - elementCenter);
    const maxDistance = window.innerHeight / 2;
    const normalized = Math.min(distance / maxDistance, 1);

    return 1 - normalized * 0.667;
  });

  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const unsubscribe = scrollY.on("change", () => {
      if (!ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const viewportTrigger = window.innerHeight / 2;

      const active =
        rect.top <= viewportTrigger && rect.bottom >= viewportTrigger;

      setIsActive(active);
    });

    return () => unsubscribe();
  }, [scrollY]);

  useLayoutEffect(() => {
    if (textRef.current) {
      setTextHeight(textRef.current.scrollHeight);
    }
  }, []);

  const widthSpring = useSpring(scaleRaw, {
    stiffness: 1000,
    damping: 200,
    mass: 1,
  });

  const width = useTransform(widthSpring, [0.333, 1], ["33.333%", "100%"]);

  // const width = useTransform(scale, [0.3, 1], ["30%", "100%"]);

  const opacityClass = isActive ? 'opacity-100' : 'opacity-0';

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className={`flex flex-col items-center lg:px-[35vw] relative`}>
      <motion.div
        ref={ref}
        style={{ width }}
        className="item w-full"
      >
        <img
          src={`/images/image${index}.webp`}
          style={{ width: "100%", height: "auto" }}
        />
      </motion.div>

      <div ref={textRef}
        style={{
          height: isMobile ? (isActive ? textHeight : 0) : 'auto'
        }}
        className={`overflow-hidden transition-all duration-1000 flex w-full box-border px-[10px] lg:my-[10px_5px] ${isActive && isMobile ? 'my-[10px_5px]' : 'p-0'} relative lg:absolute top-full left-0`}
      >
        <p className={`flex-1 grow-2 lg:grow-3 opacity-0 transition-opacity duration-500 ${opacityClass}`}>Fotosprint</p>
        <p className={`flex-1 opacity-0 transition-opacity duration-500 ${opacityClass}`}>Brand identity</p>
        <p className={`flex-0 text-right opacity-0 transition-opacity duration-500 ${opacityClass}`}>2025</p>
      </div>

    </div>
  );
}

export default function Page() {
  return (
    <div className="wrapper flex flex-col gap-[5px] items-center py-[51dvh]">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <ScrollItem key={i} index={i} />
      ))}
    </div>
  );
}