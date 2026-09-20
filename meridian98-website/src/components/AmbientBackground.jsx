import { motion, useScroll, useTransform } from "framer-motion";
import usePrefersReducedMotion from "../hooks/usePrefersReducedMotion";

export default function AmbientBackground() {
  const reduced = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll();
  const meshY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [0, -120]);
  const meshRotate = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [0, 8]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <motion.div
        className="ambient-mesh absolute -inset-[20%] opacity-90"
        style={{ y: meshY, rotate: meshRotate }}
      />
      <div className="ambient-noise absolute inset-0 opacity-[0.035]" />
      {!reduced ? (
        <>
          <div className="ambient-blob ambient-blob-navy animate-ambient-drift-a absolute left-[8%] top-[18%] h-[min(42vw,420px)] w-[min(42vw,420px)]" />
          <div className="ambient-blob ambient-blob-copper animate-ambient-drift-b absolute right-[6%] top-[32%] h-[min(36vw,360px)] w-[min(36vw,360px)]" />
          <div className="ambient-blob ambient-blob-slate animate-ambient-drift-c absolute bottom-[12%] left-[38%] h-[min(48vw,480px)] w-[min(48vw,480px)]" />
        </>
      ) : null}
    </div>
  );
}
