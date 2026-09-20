import { useEffect, useRef } from "react";
import CinematicHero from "./CinematicHero";

/**
 * Hero shell that renders either a scroll-scrubbed WebP frame sequence
 * (when `frameSources` is provided) or the procedural CinematicHero canvas.
 *
 * To swap in an AI-generated frame loop later, pass:
 *   frameSources={["/frames/0001.webp", ...]}
 *   frameCount={120}
 */
export default function ScrollFrameHero({
  frameSources = null,
  frameCount = 0,
  siteConfig,
  onDashboard,
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const useFrameScrub =
    Array.isArray(frameSources) &&
    frameSources.length > 0 &&
    (frameCount > 0 || frameSources.length > 1);

  useEffect(() => {
    if (!useFrameScrub) return undefined;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return undefined;

    const ctx = canvas.getContext("2d");
    const images = frameSources.map((src) => {
      const img = new Image();
      img.src = src;
      return img;
    });

    let raf = 0;

    const renderFrame = (index) => {
      const img = images[index];
      if (!img?.complete || !img.naturalWidth) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
      const dw = img.naturalWidth * scale;
      const dh = img.naturalHeight * scale;
      const dx = (w - dw) / 2;
      const dy = (h - dh) / 2;
      ctx.drawImage(img, dx, dy, dw, dh);
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = container.getBoundingClientRect();
        const scrollable = container.offsetHeight - window.innerHeight;
        if (scrollable <= 0) {
          renderFrame(0);
          return;
        }
        const progress = Math.min(
          1,
          Math.max(0, -rect.top / scrollable)
        );
        const total = frameCount || frameSources.length;
        const index = Math.min(total - 1, Math.floor(progress * (total - 1)));
        renderFrame(index);
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [frameSources, frameCount, useFrameScrub]);

  if (!useFrameScrub) {
    return <CinematicHero siteConfig={siteConfig} onDashboard={onDashboard} />;
  }

  return (
    <section
      ref={containerRef}
      className="relative"
      style={{ height: "220vh" }}
      aria-label="Introduction"
    >
      <div className="sticky top-16 h-[calc(100svh-4rem)] overflow-hidden">
        <canvas ref={canvasRef} className="hero-canvas h-full w-full" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-[#030712]/40" />
      </div>
    </section>
  );
}
