import { motion, useScroll, useSpring } from "framer-motion";
import usePrefersReducedMotion from "../hooks/usePrefersReducedMotion";

export default function ScrollProgress() {
  const reduced = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: reduced ? 1000 : 120,
    damping: reduced ? 100 : 28,
    restDelta: 0.001,
  });

  if (reduced) return null;

  return (
    <motion.div
      className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-[2px] origin-left bg-gradient-to-r from-navy-800 via-accent-copper to-navy-800 shadow-[0_0_12px_rgba(180,83,9,0.35)]"
      style={{ scaleX }}
      aria-hidden
    />
  );
}
