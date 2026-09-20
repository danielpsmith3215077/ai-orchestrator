import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

function useGradientCanvas(canvasRef) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext("2d");
    let frameId = 0;
    let width = 0;
    let height = 0;

    const blobs = [
      { x: 0.22, y: 0.35, r: 0.42, hue: 228, drift: 0.00035 },
      { x: 0.78, y: 0.28, r: 0.38, hue: 172, drift: -0.00028 },
      { x: 0.55, y: 0.72, r: 0.45, hue: 248, drift: 0.00022 },
      { x: 0.12, y: 0.78, r: 0.32, hue: 195, drift: -0.00018 },
    ];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (time) => {
      const t = time * 0.001;
      ctx.clearRect(0, 0, width, height);

      const base = ctx.createLinearGradient(0, 0, width, height);
      base.addColorStop(0, "#030712");
      base.addColorStop(0.55, "#0b1224");
      base.addColorStop(1, "#020617");
      ctx.fillStyle = base;
      ctx.fillRect(0, 0, width, height);

      blobs.forEach((blob, index) => {
        const ox = Math.sin(t * (0.35 + index * 0.08) + index) * 0.06;
        const oy = Math.cos(t * (0.28 + index * 0.06) + index * 1.2) * 0.05;
        const cx = (blob.x + ox) * width;
        const cy = (blob.y + oy) * height;
        const radius = blob.r * Math.min(width, height);

        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        g.addColorStop(0, `hsla(${blob.hue}, 78%, 58%, 0.22)`);
        g.addColorStop(0.45, `hsla(${blob.hue + 12}, 70%, 48%, 0.08)`);
        g.addColorStop(1, "hsla(222, 40%, 12%, 0)");

        ctx.globalCompositeOperation = "screen";
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalCompositeOperation = "source-over";

      const vignette = ctx.createRadialGradient(
        width * 0.5,
        height * 0.45,
        width * 0.15,
        width * 0.5,
        height * 0.5,
        width * 0.85
      );
      vignette.addColorStop(0, "rgba(3, 7, 18, 0)");
      vignette.addColorStop(1, "rgba(3, 7, 18, 0.72)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);

      blobs.forEach((blob) => {
        blob.x += blob.drift;
        if (blob.x < 0.05 || blob.x > 0.95) blob.drift *= -1;
      });

      frameId = requestAnimationFrame(draw);
    };

    resize();
    frameId = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
    };
  }, [canvasRef]);
}

const glassPanels = [
  {
    label: "Architecture",
    detail: "Multi-tenant boundaries, clear contracts",
    className: "left-[8%] top-[22%] hidden lg:block",
    delay: 0.15,
  },
  {
    label: "Observability",
    detail: "Signals your operators can act on",
    className: "right-[10%] top-[30%] hidden md:block",
    delay: 0.28,
  },
  {
    label: "Delivery",
    detail: "Roadmaps tied to measurable outcomes",
    className: "right-[14%] bottom-[26%] hidden lg:block",
    delay: 0.4,
  },
];

export default function CinematicHero({ siteConfig, onDashboard }) {
  const canvasRef = useRef(null);
  const sectionRef = useRef(null);
  useGradientCanvas(canvasRef);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 72]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const canvasOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.35]);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[calc(100svh-4rem)] overflow-hidden"
      aria-label="Introduction"
    >
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{ opacity: canvasOpacity }}
      >
        <canvas ref={canvasRef} className="hero-canvas h-full w-full" />
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.22]" />
        <div className="hero-scanline pointer-events-none absolute inset-0 opacity-[0.35]" />
      </motion.div>

      {glassPanels.map((panel) => (
        <motion.div
          key={panel.label}
          className={`glass-panel pointer-events-none absolute w-52 rounded-2xl px-4 py-3 ${panel.className}`}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: panel.delay, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-indigo-300">
            {panel.label}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-slate-400">{panel.detail}</p>
        </motion.div>
      ))}

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-10 mx-auto flex min-h-[calc(100svh-4rem)] w-full max-w-6xl flex-col justify-center px-6 pb-20 pt-16"
      >
        <motion.p
          className="text-xs font-semibold uppercase tracking-[0.32em] text-indigo-300"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          B2B cloud consulting
        </motion.p>

        <motion.h1
          className="mt-5 max-w-4xl font-display text-4xl font-bold leading-[1.05] tracking-tight text-gradient sm:text-5xl md:text-6xl lg:text-[4.25rem]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
        >
          {siteConfig.heroHeadline}
        </motion.h1>

        <motion.p
          className="mt-6 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        >
          {siteConfig.tagline}
        </motion.p>

        <motion.p
          className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-400 sm:text-base"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
        >
          {siteConfig.supportingText}
        </motion.p>

        <motion.div
          className="mt-9 flex flex-wrap items-center gap-3"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
        >
          <a
            href="#contact"
            className="rounded-full bg-gradient-to-r from-indigo-500 via-indigo-400 to-teal-400 px-6 py-3 text-sm font-semibold text-slate-950 shadow-glow transition hover:brightness-110"
          >
            {siteConfig.primaryCta}
          </a>
          <a
            href="#projects"
            className="rounded-full border border-slate-600/80 bg-slate-950/40 px-6 py-3 text-sm font-semibold text-slate-100 backdrop-blur transition hover:border-teal-300/50 hover:text-white"
          >
            Selected work
          </a>
          <button
            type="button"
            onClick={onDashboard}
            className="rounded-full border border-indigo-400/30 px-5 py-3 text-sm font-medium text-indigo-200 transition hover:border-indigo-300/60 hover:bg-indigo-500/10"
          >
            Operator login
          </button>
        </motion.div>

        <motion.ul
          className="mt-12 flex flex-wrap gap-x-8 gap-y-3 border-t border-slate-800/80 pt-8 text-xs font-medium uppercase tracking-[0.18em] text-slate-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.38 }}
        >
          {siteConfig.trustSignals.map((signal) => (
            <li key={signal} className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-teal-400/80" aria-hidden />
              {signal}
            </li>
          ))}
        </motion.ul>
      </motion.div>
    </section>
  );
}
