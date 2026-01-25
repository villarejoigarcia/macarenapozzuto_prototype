"use client";

import { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

type PageTransitionProps = {
  children: ReactNode;
};

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();

  // Solo aplicar transiciones entre / y /archive
  const isTransitionPage = pathname === "/" || pathname === "/archive";

  return (
    <AnimatePresence mode="wait">
      {isTransitionPage && (
        <motion.div
          key={pathname}
          initial={{ opacity: 0}} // Animación de entrada
          animate={{ opacity: 1 }} // Estado visible
          exit={{ opacity: 0 }} // Animación de salida
          transition={{ duration: 1, ease: "easeInOut" }} // Duración y easing
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}