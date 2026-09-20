import { useEffect } from "react";
import usePrefersReducedMotion from "./usePrefersReducedMotion";

/**
 * Native smooth-scroll polish: eased anchor navigation + CSS scroll-behavior toggle.
 * Skips animation when prefers-reduced-motion is set.
 */
export default function useSmoothScroll() {
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    document.documentElement.style.scrollBehavior = reduced ? "auto" : "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = "";
    };
  }, [reduced]);

  useEffect(() => {
    if (reduced) return undefined;

    const easeOutCubic = (t) => 1 - (1 - t) ** 3;

    const scrollToY = (targetY, duration = 720) => {
      const startY = window.scrollY;
      const delta = targetY - startY;
      if (Math.abs(delta) < 2) return;

      const start = performance.now();
      let frameId = 0;

      const step = (now) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        window.scrollTo(0, startY + delta * easeOutCubic(progress));
        if (progress < 1) frameId = requestAnimationFrame(step);
      };

      frameId = requestAnimationFrame(step);
      return () => cancelAnimationFrame(frameId);
    };

    const onClick = (event) => {
      const anchor = event.target.closest('a[href^="#"]');
      const href = anchor?.getAttribute("href");
      if (!href || href === "#" || href.startsWith("#/")) return;

      const id = href.slice(1);
      const target = document.getElementById(id);
      if (!target) return;

      event.preventDefault();
      const headerOffset = 72;
      const y = target.getBoundingClientRect().top + window.scrollY - headerOffset;
      scrollToY(y);
      window.history.pushState(null, "", `#${id}`);
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [reduced]);
}
