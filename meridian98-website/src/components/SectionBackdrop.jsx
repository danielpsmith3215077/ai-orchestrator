import ParallaxLayer from "./ParallaxLayer";

const VARIANTS = {
  default: "from-transparent via-transparent to-transparent",
  cool: "from-slate-200/25 via-slate-100/10 to-transparent",
  warm: "from-amber-100/35 via-orange-50/20 to-transparent",
  neutral: "from-white/40 via-slate-50/20 to-transparent",
};

export default function SectionBackdrop({ variant = "default", className = "" }) {
  const gradient = VARIANTS[variant] ?? VARIANTS.default;

  return (
    <ParallaxLayer
      speed={0.15}
      className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className}`}
      aria-hidden
    >
      <div className={`absolute inset-0 bg-gradient-to-b ${gradient}`} />
      {variant === "warm" ? (
        <div className="absolute -right-[10%] top-[10%] h-64 w-64 rounded-full bg-accent-copper/10 blur-3xl" />
      ) : null}
      {variant === "cool" ? (
        <div className="absolute -left-[8%] bottom-[5%] h-72 w-72 rounded-full bg-slate-300/25 blur-3xl" />
      ) : null}
    </ParallaxLayer>
  );
}
