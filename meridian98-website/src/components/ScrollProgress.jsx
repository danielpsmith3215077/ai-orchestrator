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
      className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-[2px] origin-left bg-gradient-to-r from-m98-cyan via-m98-coral to-m98-cyan shadow-[0_0_12px_rgba(30,64,175,0.25)]"
      style={{ scaleX }}
      aria-hidden
    />
  );
}
