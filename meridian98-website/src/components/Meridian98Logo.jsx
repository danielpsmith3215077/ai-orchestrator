/** Brand lockup source (1024×190); mark occupies ~17% of width on the left. */
const LOGO_SRC = "/meridian98-logo.jpg";

/**
 * @param {{ variant?: 'light' | 'dark', showTagline?: boolean, markClassName?: string, className?: string }} props
 */
export default function Meridian98Logo({
  variant = "light",
  showTagline = false,
  markClassName = "h-9 w-[2.55rem] shrink-0",
  className = "",
}) {
  if (variant === "dark") {
    const heightClass = showTagline ? "h-[3.25rem]" : "h-9";
    return (
      <img
        src={LOGO_SRC}
        alt="Meridian98 — B2B & SaaS Solutions"
        className={`w-auto max-w-[min(100%,22rem)] object-left object-contain ${heightClass} ${className}`.trim()}
        style={showTagline ? undefined : { clipPath: "inset(0 0 24% 0)" }}
      />
    );
  }

  return (
    <span className={`inline-flex items-center gap-3 ${className}`.trim()}>
      <span className={`relative overflow-hidden ${markClassName}`}>
        <img
          src={LOGO_SRC}
          alt=""
          aria-hidden
          className="block h-full w-auto max-w-none"
          draggable={false}
        />
      </span>
      <span
        className="hidden h-8 w-px shrink-0 bg-m98-taupe/85 sm:block"
        aria-hidden
      />
      <span className="flex min-w-0 flex-col justify-center leading-tight">
        <span className="font-display text-lg font-bold tracking-tight">
          <span className="text-m98-heading">Meridian</span>
          <span className="text-m98-peach">98</span>
        </span>
        {showTagline ? (
          <span className="mt-0.5 text-[11px] font-medium tracking-wide text-m98-muted">
            B2B &amp; SaaS Solutions
          </span>
        ) : null}
      </span>
    </span>
  );
}
