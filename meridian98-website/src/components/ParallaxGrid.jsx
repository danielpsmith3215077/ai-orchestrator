import { motion, useScroll, useTransform } from "framer-motion";
import usePrefersReducedMotion from "../hooks/usePrefersReducedMotion";

export default function ParallaxGrid() {
  const reduced = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [0, 140]);
  const opacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0.38, 0.42, 0.36, 0.3]);

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-[1] bg-grid-pattern-dark opacity-40"
      style={{ y, opacity }}
      aria-hidden
    />
  );
}
