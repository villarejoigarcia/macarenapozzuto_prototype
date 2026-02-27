"use client";

import { useRef, useState, useEffect, useLayoutEffect } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { div } from "framer-motion/client";

function ScrollItem({ index }: { index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [textHeight, setTextHeight] = useState(0);
  const { scrollY } = useScroll();

  const scaleRaw = useTransform(scrollY, () => {
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
    stiffness: 500,
    damping: 200,
    mass: 1,
    bounce: 0,
  });

  const width = useTransform(widthSpring, [0.333, 1], ["33.333%", "100%"]);

  return (
    <div className={`flex flex-col items-center lg:px-[33.333vw] relative`}>
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
        style={{ height: isActive ? textHeight : 0 }}
        className={`overflow-hidden transition-all duration-500 flex w-full box-border px-[10px] ${isActive ? 'my-[10px_5px]' : 'p-0'} relative lg:absolute top-full left-0`}
      >
        <p className="flex-1 grow-2 lg:grow-3">Fotosprint</p>
        <p className="flex-1">Brand identity</p>
        <p className="flex-0 text-right">2025</p>
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