import ParallaxLayer from "./ParallaxLayer";

const VARIANTS = {
  default: "from-transparent via-transparent to-transparent",
  cool: "from-m98-cyan/12 via-m98-bg/5 to-transparent",
  warm: "from-m98-coral/14 via-m98-peach/8 to-transparent",
  neutral: "from-m98-bg-elevated/25 via-m98-bg/10 to-transparent",
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
        <div className="absolute -right-[10%] top-[10%] h-64 w-64 rounded-full bg-m98-coral/15 blur-3xl" />
      ) : null}
      {variant === "cool" ? (
        <div className="absolute -left-[8%] bottom-[5%] h-72 w-72 rounded-full bg-m98-cyan/15 blur-3xl" />
      ) : null}
    </ParallaxLayer>
  );
}
