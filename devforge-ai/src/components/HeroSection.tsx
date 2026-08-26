/**
 * HeroSection — DevForge AI
 * ---------------------------------------------------------------------------
 * Self-contained cinematic scroll hero. Vertically pinned viewport morphs
 * through three stages driven by Framer Motion scroll progress (0 → 1):
 *
 *   0.0–0.3  Kinetic Ignition   — tracking-widest headline + grid fade
 *   0.3–0.6  Core Blueprint     — headline exits; SVG compilation matrix draws
 *   0.6–1.0  Product Convergence — matrix retreats; glassmorphic SaaS elevates
 *
 * Styling: Tailwind utilities only. Visuals: gradients / SVG / CSS glow.
 * No external image or 3D assets.
 */

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const BRAND = 'DevForge AI';
const TAGLINE = 'Next-gen automated & specialized software engineering systems';
const HEADLINE = 'ENGINEERING THE VOID';

/** Compilation-graph nodes for the Stage-2 SVG matrix (viewBox 0–100). */
const MATRIX_NODES: ReadonlyArray<{ id: string; x: number; y: number; r?: number }> = [
  { id: 'core', x: 50, y: 48, r: 4.2 },
  { id: 'parse', x: 22, y: 28, r: 2.4 },
  { id: 'type', x: 78, y: 26, r: 2.4 },
  { id: 'opt', x: 18, y: 58, r: 2.2 },
  { id: 'emit', x: 82, y: 56, r: 2.2 },
  { id: 'link', x: 38, y: 78, r: 2.0 },
  { id: 'ship', x: 62, y: 78, r: 2.0 },
  { id: 'spec', x: 50, y: 18, r: 2.0 },
  { id: 'test', x: 50, y: 88, r: 1.8 },
];

/** Directed edges between nodes — stroke-dashoffset animates with scroll. */
const MATRIX_EDGES: ReadonlyArray<{ from: string; to: string; len: number }> = [
  { from: 'spec', to: 'core', len: 32 },
  { from: 'parse', to: 'core', len: 36 },
  { from: 'type', to: 'core', len: 36 },
  { from: 'core', to: 'opt', len: 34 },
  { from: 'core', to: 'emit', len: 34 },
  { from: 'opt', to: 'link', len: 28 },
  { from: 'emit', to: 'ship', len: 28 },
  { from: 'link', to: 'test', len: 22 },
  { from: 'ship', to: 'test', len: 22 },
];

function nodeById(id: string) {
  const n = MATRIX_NODES.find((node) => node.id === id);
  if (!n) throw new Error(`Unknown matrix node: ${id}`);
  return n;
}

/* -------------------------------------------------------------------------- */
/* Sub-elements (kept in-file — single deliverable)                           */
/* -------------------------------------------------------------------------- */

/** Monochrome perspective grid that fades toward the edges. */
function KineticGrid({ opacity }: { opacity: ReturnType<typeof useTransform<number, number>> }) {
  return (
    <motion.div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ opacity }}
      aria-hidden
    >
      {/* Vertical lines */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.07) 1px, transparent 1px)',
          backgroundSize: '64px 100%',
          maskImage:
            'radial-gradient(ellipse 70% 60% at 50% 45%, black 10%, transparent 75%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 70% 60% at 50% 45%, black 10%, transparent 75%)',
        }}
      />
      {/* Horizontal lines + slight perspective tilt via CSS */}
      <div
        className="absolute inset-[-10%] origin-center"
        style={{
          transform: 'perspective(900px) rotateX(58deg) translateY(-8%)',
          backgroundImage:
            'linear-gradient(to bottom, rgba(255,255,255,0.09) 1px, transparent 1px)',
          backgroundSize: '100% 48px',
          maskImage:
            'linear-gradient(to bottom, transparent 0%, black 25%, black 70%, transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(to bottom, transparent 0%, black 25%, black 70%, transparent 100%)',
        }}
      />
      {/* Soft cyan/violet aurora wash */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(112,0,255,0.18),transparent_55%),radial-gradient(ellipse_at_70%_80%,rgba(0,240,255,0.12),transparent_50%)]" />
    </motion.div>
  );
}

/** Ambient glow orb used when the matrix retreats in Stage 3. */
function AmbientGlow({
  opacity,
  scale,
}: {
  opacity: ReturnType<typeof useTransform<number, number>>;
  scale: ReturnType<typeof useTransform<number, number>>;
}) {
  return (
    <motion.div
      className="pointer-events-none absolute left-1/2 top-1/2 h-[min(70vw,520px)] w-[min(70vw,520px)] -translate-x-1/2 -translate-y-1/2 rounded-full"
      style={{
        opacity,
        scale,
        background:
          'radial-gradient(circle, rgba(0,240,255,0.22) 0%, rgba(112,0,255,0.14) 40%, transparent 70%)',
        filter: 'blur(8px)',
      }}
      aria-hidden
    />
  );
}

type MotionNumber = ReturnType<typeof useTransform<number, number>>;

/** Single edge — isolated so useTransform respects the Rules of Hooks. */
function MatrixEdge({
  edge,
  index,
  drawProgress,
}: {
  edge: (typeof MATRIX_EDGES)[number];
  index: number;
  drawProgress: MotionNumber;
}) {
  const a = nodeById(edge.from);
  const b = nodeById(edge.to);
  const start = index / MATRIX_EDGES.length;
  const end = Math.min(1, (index + 1.35) / MATRIX_EDGES.length);
  const dashOffset = useTransform(drawProgress, [start, end], [edge.len, 0]);
  const edgeOpacity = useTransform(drawProgress, [start, end], [0.15, 0.9]);

  return (
    <motion.line
      x1={a.x}
      y1={a.y}
      x2={b.x}
      y2={b.y}
      stroke="url(#edgeGrad)"
      strokeWidth={0.45}
      strokeLinecap="round"
      strokeDasharray={edge.len}
      style={{ strokeDashoffset: dashOffset, opacity: edgeOpacity }}
    />
  );
}

/** Single node — isolated for hook-safe staggered opacity. */
function MatrixNode({
  node,
  index,
  drawProgress,
}: {
  node: (typeof MATRIX_NODES)[number];
  index: number;
  drawProgress: MotionNumber;
}) {
  const pulse = useTransform(
    drawProgress,
    [index / MATRIX_NODES.length, Math.min(1, (index + 1) / MATRIX_NODES.length)],
    [0.2, 1],
  );
  const isCore = node.id === 'core';

  return (
    <motion.g style={{ opacity: pulse }}>
      {isCore && (
        <circle
          cx={node.x}
          cy={node.y}
          r={(node.r ?? 2) + 3.5}
          className="fill-none stroke-[#00f0ff]/30"
          strokeWidth={0.3}
        />
      )}
      <circle
        cx={node.x}
        cy={node.y}
        r={node.r ?? 2}
        fill={isCore ? '#00f0ff' : '#7000ff'}
        className={isCore ? 'drop-shadow-[0_0_6px_#00f0ff]' : ''}
      />
      {!isCore && (
        <circle
          cx={node.x}
          cy={node.y}
          r={(node.r ?? 2) * 0.35}
          fill="#ffffff"
          opacity={0.85}
        />
      )}
    </motion.g>
  );
}

/**
 * Abstract SVG compilation matrix — nodes + linear strokes that draw
 * in sync with scroll progress during Core Blueprint.
 */
function BlueprintMatrix({
  opacity,
  scale,
  drawProgress,
}: {
  opacity: MotionNumber;
  scale: MotionNumber;
  drawProgress: MotionNumber;
}) {
  return (
    <motion.div
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
      style={{ opacity, scale }}
      aria-hidden
    >
      <svg
        viewBox="0 0 100 100"
        className="h-[min(78vh,640px)] w-[min(92vw,640px)] drop-shadow-[0_0_28px_rgba(0,240,255,0.25)]"
        fill="none"
      >
        {/* Soft hex frame */}
        <polygon
          points="50,4 92,27 92,73 50,96 8,73 8,27"
          className="stroke-white/10"
          strokeWidth={0.35}
        />

        {MATRIX_EDGES.map((edge, i) => (
          <MatrixEdge
            key={`${edge.from}-${edge.to}`}
            edge={edge}
            index={i}
            drawProgress={drawProgress}
          />
        ))}

        {MATRIX_NODES.map((node, i) => (
          <MatrixNode key={node.id} node={node} index={i} drawProgress={drawProgress} />
        ))}

        <defs>
          <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7000ff" />
            <stop offset="100%" stopColor="#00f0ff" />
          </linearGradient>
        </defs>
      </svg>
    </motion.div>
  );
}

/** Glassmorphic SaaS dashboard frame — elevates from bottom in Stage 3. */
function DashboardFrame({
  y,
  opacity,
  scale,
}: {
  y: ReturnType<typeof useTransform<number, number>>;
  opacity: ReturnType<typeof useTransform<number, number>>;
  scale: ReturnType<typeof useTransform<number, number>>;
}) {
  return (
    <motion.div
      className="absolute inset-x-0 bottom-0 top-[12%] z-20 flex items-end justify-center px-4 pb-8 sm:items-center sm:pb-0 md:px-8"
      style={{ y, opacity, scale }}
    >
      <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-white/15 bg-white/[0.04] shadow-[0_0_80px_rgba(0,240,255,0.12),0_24px_80px_rgba(0,0,0,0.65)] backdrop-blur-xl">
        {/* Window chrome */}
        <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-white/25" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/25" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/25" />
          <div className="ml-3 flex-1 truncate rounded-md bg-white/5 px-3 py-1 font-mono text-[10px] tracking-wider text-white/45 sm:text-xs">
            forge://pipeline/devforge-ai
          </div>
        </div>

        {/* Fake product UI — pure CSS blocks, no images */}
        <div className="grid gap-4 p-4 sm:grid-cols-[140px_1fr] sm:p-5">
          <aside className="hidden flex-col gap-2 sm:flex">
            {['Overview', 'Agents', 'Pipelines', 'Telemetry'].map((label, i) => (
              <div
                key={label}
                className={`rounded-lg px-3 py-2 text-xs tracking-wide ${
                  i === 0
                    ? 'bg-[#00f0ff]/15 text-[#00f0ff]'
                    : 'bg-white/[0.03] text-white/40'
                }`}
              >
                {label}
              </div>
            ))}
          </aside>

          <div className="space-y-3">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#00f0ff]/80">
                  Live compile graph
                </p>
                <p className="mt-1 text-sm font-medium text-white/90 sm:text-base">
                  Autonomous PR synthesis — 14 agents online
                </p>
              </div>
              <span className="rounded-md border border-[#00f0ff]/30 bg-[#00f0ff]/10 px-2 py-1 font-mono text-[10px] text-[#00f0ff]">
                LATENCY 41ms
              </span>
            </div>

            {/* Chart bars */}
            <div className="flex h-28 items-end gap-1.5 rounded-xl border border-white/8 bg-black/40 p-3 sm:h-36">
              {[40, 62, 48, 78, 55, 88, 70, 92, 66, 80, 74, 96].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm"
                  style={{
                    height: `${h}%`,
                    background:
                      i % 3 === 0
                        ? 'linear-gradient(to top, #7000ff, #00f0ff)'
                        : 'linear-gradient(to top, rgba(112,0,255,0.35), rgba(0,240,255,0.55))',
                  }}
                />
              ))}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { k: 'Specs locked', v: '128' },
                { k: 'Patches merged', v: '47' },
                { k: 'Coverage', v: '99.2%' },
              ].map((stat) => (
                <div
                  key={stat.k}
                  className="rounded-lg border border-white/8 bg-white/[0.03] px-2 py-2 text-center sm:px-3"
                >
                  <p className="font-mono text-sm text-white sm:text-base">{stat.v}</p>
                  <p className="mt-0.5 text-[9px] uppercase tracking-wider text-white/35 sm:text-[10px]">
                    {stat.k}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Inner glow rim */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-[#00f0ff]/15" />
      </div>
    </motion.div>
  );
}

/** CTA pair with conic-gradient borders / glowing rings. */
function CtaCluster({
  opacity,
  y,
}: {
  opacity: ReturnType<typeof useTransform<number, number>>;
  y: ReturnType<typeof useTransform<number, number>>;
}) {
  return (
    <motion.div
      className="absolute inset-x-0 bottom-6 z-30 flex flex-col items-center gap-4 px-4 sm:bottom-10"
      style={{ opacity, y }}
    >
      <p className="max-w-md text-center text-xs tracking-[0.2em] text-white/50 sm:text-sm">
        {TAGLINE}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
        <ConicButton href="#start" primary>
          Launch Forge
        </ConicButton>
        <ConicButton href="#docs" primary={false}>
          Read the Spec
        </ConicButton>
      </div>
    </motion.div>
  );
}

function ConicButton({
  children,
  href,
  primary,
}: {
  children: React.ReactNode;
  href: string;
  primary: boolean;
}) {
  return (
    <a
      href={href}
      className="group relative inline-flex rounded-full p-[1.5px] transition-transform duration-300 hover:scale-[1.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#00f0ff]"
      style={{
        background: primary
          ? 'conic-gradient(from var(--angle, 0deg), #00f0ff, #7000ff, #00f0ff)'
          : 'conic-gradient(from var(--angle, 0deg), rgba(0,240,255,0.55), rgba(112,0,255,0.55), rgba(0,240,255,0.55))',
        animation: 'spin-conic 4s linear infinite',
      }}
    >
      <span
        className={`relative inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-medium tracking-wide sm:px-8 sm:py-3 ${
          primary
            ? 'bg-[#030303] text-white shadow-[0_0_28px_rgba(0,240,255,0.35)]'
            : 'bg-[#030303]/90 text-white/80'
        }`}
      >
        {children}
        {primary && (
          <span className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover:shadow-[0_0_40px_rgba(0,240,255,0.55)]" />
        )}
      </span>
    </a>
  );
}

/* -------------------------------------------------------------------------- */
/* Main export                                                                */
/* -------------------------------------------------------------------------- */

export default function HeroSection() {
  const containerRef = useRef<HTMLElement>(null);

  // Scroll progress across the tall sticky container (0 at top → 1 at bottom).
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Spring-smoothed progress for cinematic feel (less jitter on trackpads).
  const progress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 28,
    restDelta: 0.001,
  });

  /* ---- Stage 1: Kinetic Ignition (0.0 – 0.3) ---- */
  const headlineOpacity = useTransform(progress, [0, 0.22, 0.32], [1, 1, 0]);
  const headlineScale = useTransform(progress, [0.22, 0.38], [1, 1.55]);
  const headlineTracking = useTransform(
    progress,
    [0, 0.3],
    ['0.55em', '0.02em'],
  );
  const headlineY = useTransform(progress, [0.2, 0.35], [0, -40]);
  const gridOpacity = useTransform(progress, [0, 0.18, 0.35], [0.95, 0.7, 0]);
  const brandOpacity = useTransform(progress, [0, 0.25, 0.4], [1, 0.85, 0]);

  /* ---- Stage 2: Core Blueprint (0.3 – 0.6) ---- */
  const matrixOpacity = useTransform(progress, [0.28, 0.38, 0.58, 0.72], [0, 1, 1, 0.15]);
  const matrixScale = useTransform(progress, [0.3, 0.45, 0.62, 0.85], [0.72, 1, 1.05, 0.55]);
  const drawProgress = useTransform(progress, [0.32, 0.58], [0, 1]);

  /* ---- Stage 3: Product Convergence (0.6 – 1.0) ---- */
  const glowOpacity = useTransform(progress, [0.55, 0.7, 1], [0, 0.85, 1]);
  const glowScale = useTransform(progress, [0.55, 1], [0.6, 1.15]);
  const dashY = useTransform(progress, [0.58, 0.82], [180, 0]);
  const dashOpacity = useTransform(progress, [0.58, 0.72, 1], [0, 1, 1]);
  const dashScale = useTransform(progress, [0.58, 0.85], [0.92, 1]);
  const ctaOpacity = useTransform(progress, [0.72, 0.88], [0, 1]);
  const ctaY = useTransform(progress, [0.72, 0.9], [28, 0]);

  // Background violet/cyan wash intensifies toward Stage 3.
  const washOpacity = useTransform(progress, [0, 0.5, 1], [0.35, 0.55, 0.9]);
  const scrollHintOpacity = useTransform(progress, [0, 0.08], [0.7, 0]);

  return (
    <section
      ref={containerRef}
      className="relative h-[320vh] bg-[#030303]"
      aria-label={`${BRAND} hero`}
    >
      {/* Sticky viewport — morphs while user scrolls through the tall section */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Base void + animated color wash */}
        <div className="absolute inset-0 bg-[#030303]" />
        <motion.div
          className="absolute inset-0"
          style={{
            opacity: washOpacity,
            background:
              'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(112,0,255,0.22), transparent 55%), radial-gradient(ellipse 60% 40% at 80% 100%, rgba(0,240,255,0.12), transparent 50%)',
          }}
        />

        <KineticGrid opacity={gridOpacity} />
        <AmbientGlow opacity={glowOpacity} scale={glowScale} />

        {/* Brand mark — hero-level signal */}
        <motion.header
          className="absolute left-0 right-0 top-0 z-40 flex items-start justify-between px-5 pt-6 sm:px-8 sm:pt-8"
          style={{ opacity: brandOpacity }}
        >
          <div>
            <p className="text-lg font-semibold tracking-tight text-white sm:text-2xl md:text-3xl">
              {BRAND}
            </p>
            <p className="mt-1 max-w-xs text-[10px] leading-relaxed tracking-[0.12em] text-white/40 sm:max-w-sm sm:text-xs">
              {TAGLINE}
            </p>
          </div>
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.3em] text-[#00f0ff]/70 sm:inline">
            v0.1 · void protocol
          </span>
        </motion.header>

        {/* Stage 1 headline */}
        <motion.div
          className="absolute inset-0 z-10 flex items-center justify-center px-3 sm:px-6"
          style={{
            opacity: headlineOpacity,
            scale: headlineScale,
            y: headlineY,
          }}
        >
          <motion.h1
            className="max-w-[96vw] text-center text-[clamp(1.35rem,5.2vw,4.5rem)] font-semibold uppercase leading-[1.05] text-white"
            style={{ letterSpacing: headlineTracking }}
          >
            {HEADLINE}
          </motion.h1>
        </motion.div>

        {/* Stage 2 matrix */}
        <BlueprintMatrix
          opacity={matrixOpacity}
          scale={matrixScale}
          drawProgress={drawProgress}
        />

        {/* Stage 3 product + CTAs */}
        <DashboardFrame y={dashY} opacity={dashOpacity} scale={dashScale} />
        <CtaCluster opacity={ctaOpacity} y={ctaY} />

        {/* Scroll hint — fades once motion begins */}
        <motion.div
          className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2"
          style={{ opacity: scrollHintOpacity }}
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/40">
            Scroll to ignite
          </span>
          <span className="h-8 w-px bg-gradient-to-b from-[#00f0ff]/80 to-transparent" />
        </motion.div>

        {/* Fine noise overlay for premium filmic texture */}
        <div
          className="pointer-events-none absolute inset-0 z-50 opacity-[0.04] mix-blend-overlay"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg viewBox=%270 0 200 200%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.85%27 numOctaves=%274%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27/%3E%3C/svg%3E")',
          }}
          aria-hidden
        />
      </div>
    </section>
  );
}
