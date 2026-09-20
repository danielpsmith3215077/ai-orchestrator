import { useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

/** Combines Framer's reduced-motion signal with the OS media query. */
export default function usePrefersReducedMotion() {
  const framerReduced = useReducedMotion();
  const [mediaReduced, setMediaReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setMediaReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return Boolean(framerReduced || mediaReduced);
}
