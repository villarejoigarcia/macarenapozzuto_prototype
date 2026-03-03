"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { scrollPost } from './scroll-x';

function ScrollItem({
  index,
  onOpen,
}: {
  index: number;
  onOpen: (index: number) => void;
}) {

    const images = [
    `/images/item${index}/image1.webp`,
    `/images/item${index}/image2.webp`,
    `/images/item${index}/image3.webp`,
    `/images/item${index}/image4.webp`,
    `/images/item${index}/image5.webp`,
    // Añade aquí más imágenes si es necesario
  ];

  const [isHover, setIsHover] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  const scaleRaw = useTransform(scrollY, (latest) => {
    if (!ref.current) return 1;

    const rect = ref.current.getBoundingClientRect();

    let viewportCenter;
    let elementCenter;

    if (latest === 0) {
    // if (latest < 5) {
      viewportCenter = 0;
      elementCenter = rect.top;
    } else {
      viewportCenter = window.innerHeight / 2;
      elementCenter = rect.top + rect.height / 2;
    }

    const distance = Math.abs(viewportCenter - elementCenter);
    const maxDistance = window.innerHeight / 2;
    const normalized = Math.min(distance / maxDistance, 1);

    return 1 - normalized * 0.5;
  });

  // 🔹 Usamos useSpring para suavizar la transición
  const widthSpring = useSpring(scaleRaw, {
    stiffness: 1200,
    damping: 200,
    mass: 1,
  });

  const width = useTransform(widthSpring, [0.5, 1], ["50%", "100%"]);

  const [isActive, setIsActive] = useState(false);

  useEffect(() => {

    const unsubscribe = scrollY.on("change", () => {

      if (!ref.current) return;

          
      // activator

      const rect = ref.current.getBoundingClientRect();

      const viewportTrigger = window.innerHeight / 3;
      const active = rect.top <= viewportTrigger && rect.bottom >= viewportTrigger;
      setIsActive(active);

    });

    return () => unsubscribe();
  }, [scrollY, isActive]);
  

  return (
    <div className="relative">
      <div 
      ref={ref}
      className={`overflow-scroll transition-padding duration-1000 ${isOpen ? 'lg:px-[33.333%]' : 'lg:px-[40%]'}`}
      onClick={() => setIsOpen(true)}
      >
      <motion.div
        
        style={{ width }}
        // onClick={() => onOpen(index)}
        className={`item w-full mx-auto`}
      >
          <div 
            className="relative"
            onMouseEnter={() => setIsHover(true)}
            onMouseLeave={() => {
              setIsOpen(false)
              setIsHover(false)
              if (!ref.current) return;
                scrollPost(ref.current, 1000);

            }}
          >
            <img
              className=""
              src={`/images/item${index}/image1.webp`}
              style={{ width: "100%", height: "auto" }}
              
            />
            <div className={`absolute top-0 left-full h-full w-max pl-[3px] flex`}
            >
              {images.length > 1 && images.slice(1).map((src, i) => (

                <img
                  key={i + 1}
                  src={src}
                  className={`transition-opacity duration-500 pr-[3px] ${isHover ? 'opacity-100' : 'opacity-0'}`}
                  style={{
                    width: "auto",
                    height: "100%",
                    objectFit: "contain",
                    transitionDelay: `${(isHover ? i : images.length - 2 - i) * 100}ms`,
                  }}
                />

              ))}
            </div>
          </div>
      </motion.div>
      </div>
      {/* <div className={`flex w-full justify-between transition-all duration-1000 px-[10px] overflow-hidden ${isActive ? 'h-[35px] py-[10px] opacity-100' : 'h-0 py-0 opacity-0'}`}> */}
      <div className={`absolute top-full left-0 flex w-full justify-between transition-all duration-1000 p-[10px] overflow-hidden ${isHover ? 'opacity-100' : 'opacity-0'}`}>
        <p className="flex-1">1.</p>
        <p className="flex-1 grow-4">Fotosprint</p>
        <p className="flex-1">Brand identity</p>
        <p className="flex-0 text-right">2025</p>
      </div>
    </div>
  );
}

export default function Page() {
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [projectsHidden, setProjectsHidden] = useState(false);
  const [showProject, setShowProject] = useState(false);
  const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleOpenProject = (index: number) => {
    setSelectedProject(index);
    setShowProject(false);
    setProjectsHidden(true);

    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }

    transitionTimeoutRef.current = setTimeout(() => {
      setShowProject(true);
    }, 500);
  };

  const handleCloseProject = () => {
    setShowProject(false);

    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }

    transitionTimeoutRef.current = setTimeout(() => {
      setProjectsHidden(false);
      setSelectedProject(null);
    }, 500);
  };

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <div
        id="projects"
        className={`flex flex-col gap-[5px] items-center w-full mx-auto pb-[100dvh] transition-opacity duration-500 ${
          projectsHidden ? "opacity-30 blur-xs pointer-events-none" : "opacity-100 blur-none"
        }`}
      >
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <ScrollItem key={i} index={i} onOpen={handleOpenProject} />
        ))}
      </div>

      <div
        id="project"
        onClick={handleCloseProject}
        className={`fixed inset-0 overflow-y-auto transition-opacity duration-500 ${
          showProject ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {selectedProject && (
          <div className="mx-auto flex w-full flex-col gap-[5px]">
            {[1, 2, 3, 4, 5].map((imageIndex) => (
              <img
                key={imageIndex}
                src={`/images/item${selectedProject}/image${imageIndex}.webp`}
                style={{ width: "100%", height: "auto" }}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}