import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import ParallaxLayer from "./ParallaxLayer";

function useLightCanvas(canvasRef) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext("2d");
    let frameId = 0;
    let width = 0;
    let height = 0;

    const blobs = [
      { x: 0.18, y: 0.32, r: 0.48, hue: 210, drift: 0.00022 },
      { x: 0.82, y: 0.22, r: 0.4, hue: 24, drift: -0.00018 },
      { x: 0.62, y: 0.78, r: 0.44, hue: 200, drift: 0.00015 },
      { x: 0.08, y: 0.68, r: 0.36, hue: 28, drift: -0.00012 },
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

      const base = ctx.createLinearGradient(0, 0, width, height * 0.9);
      base.addColorStop(0, "#fafafa");
      base.addColorStop(0.45, "#f4f6f9");
      base.addColorStop(1, "#eef1f6");
      ctx.fillStyle = base;
      ctx.fillRect(0, 0, width, height);

      blobs.forEach((blob, index) => {
        const ox = Math.sin(t * (0.32 + index * 0.07) + index) * 0.05;
        const oy = Math.cos(t * (0.26 + index * 0.05) + index * 1.1) * 0.04;
        const cx = (blob.x + ox) * width;
        const cy = (blob.y + oy) * height;
        const radius = blob.r * Math.min(width, height);

        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        g.addColorStop(0, `hsla(${blob.hue}, 42%, 52%, 0.14)`);
        g.addColorStop(0.5, `hsla(${blob.hue + 8}, 38%, 62%, 0.06)`);
        g.addColorStop(1, "hsla(210, 20%, 96%, 0)");

        ctx.globalCompositeOperation = "multiply";
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalCompositeOperation = "source-over";

      const wash = ctx.createLinearGradient(0, height * 0.55, 0, height);
      wash.addColorStop(0, "rgba(250, 250, 250, 0)");
      wash.addColorStop(1, "rgba(250, 250, 250, 0.85)");
      ctx.fillStyle = wash;
      ctx.fillRect(0, 0, width, height);

      blobs.forEach((blob) => {
        blob.x += blob.drift;
        if (blob.x < 0.04 || blob.x > 0.96) blob.drift *= -1;
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

const floatCards = [
  {
    label: "Architecture",
    detail: "Boundaries your teams can own",
    className: "left-[6%] top-[24%] hidden lg:block",
    delay: 0.12,
  },
  {
    label: "Reliability",
    detail: "SLOs tied to business outcomes",
    className: "right-[8%] top-[28%] hidden md:block",
    delay: 0.24,
  },
  {
    label: "Delivery",
    detail: "Milestones with working software",
    className: "right-[12%] bottom-[28%] hidden lg:block",
    delay: 0.36,
  },
];

export default function LightCinematicHero({ siteConfig, onDashboard }) {
  const canvasRef = useRef(null);
  const sectionRef = useRef(null);
  useLightCanvas(canvasRef);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 64]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const canvasOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.5]);
  const gridY = useTransform(scrollYProgress, [0, 1], [0, 48]);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[calc(100svh-4rem)] overflow-hidden border-b border-slate-200/80"
      aria-label="Introduction"
    >
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{ opacity: canvasOpacity }}
      >
        <canvas ref={canvasRef} className="hero-canvas h-full w-full" />
        <motion.div
          className="absolute inset-0 bg-grid-pattern-light opacity-[0.55]"
          style={{ y: gridY }}
        />
      </motion.div>

      <ParallaxLayer
        speed={0.35}
        className="pointer-events-none absolute -left-[5%] top-[18%] h-56 w-56 rounded-full bg-navy-800/10 blur-3xl"
        aria-hidden
      />
      <ParallaxLayer
        speed={-0.2}
        className="pointer-events-none absolute -right-[4%] bottom-[22%] h-48 w-48 rounded-full bg-accent-copper/15 blur-3xl"
        aria-hidden
      />

      {floatCards.map((panel) => (
        <motion.div
          key={panel.label}
          className={`light-float-card pointer-events-none absolute w-52 rounded-2xl px-4 py-3.5 ${panel.className}`}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: panel.delay, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-navy-700">
            {panel.label}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-slate-600">{panel.detail}</p>
        </motion.div>
      ))}

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-10 mx-auto flex min-h-[calc(100svh-4rem)] w-full max-w-6xl flex-col justify-center px-6 pb-16 pt-14"
      >
        <motion.p
          className="text-xs font-semibold uppercase tracking-[0.32em] text-accent-copper"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          B2B cloud consulting
        </motion.p>

        <motion.h1
          className="mt-5 max-w-4xl font-display text-4xl font-bold leading-[1.06] tracking-tight text-navy-950 sm:text-5xl md:text-6xl lg:text-[4.1rem]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="text-gradient-editorial">{siteConfig.heroHeadline}</span>
        </motion.h1>

        <motion.p
          className="mt-6 max-w-2xl text-base leading-relaxed text-slate-700 sm:text-lg"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        >
          {siteConfig.tagline}
        </motion.p>

        <motion.p
          className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base"
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
          <a href="#contact" className="btn-primary">
            {siteConfig.primaryCta}
          </a>
          <a href="#projects" className="btn-secondary">
            Selected work
          </a>
          <button type="button" onClick={onDashboard} className="btn-ghost">
            Operator login
          </button>
        </motion.div>

        <motion.ul
          className="mt-12 flex flex-wrap gap-x-8 gap-y-3 border-t border-slate-200 pt-8 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.38 }}
        >
          {siteConfig.trustSignals.map((signal) => (
            <li key={signal} className="flex items-center gap-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-navy-800" aria-hidden />
              {signal}
            </li>
          ))}
        </motion.ul>
      </motion.div>
    </section>
  );
}
