/** 98 knot mark — provided brand PNG (dark field, blue knot). */
const MARK_SRC = "/logo-mark-98.png";

/**
 * @param {{ variant?: 'light' | 'dark', showTagline?: boolean, markClassName?: string, className?: string }} props
 */
export default function Meridian98Logo({
  variant = "light",
  showTagline = false,
  markClassName = "h-9 w-auto shrink-0",
  className = "",
}) {
  const isDark = variant === "dark";

  return (
    <span className={`inline-flex items-center gap-3 ${className}`.trim()}>
      <img
        src={MARK_SRC}
        alt=""
        aria-hidden
        className={`block rounded-md object-contain ${markClassName}`}
        draggable={false}
      />
      <span
        className={`hidden h-8 w-px shrink-0 sm:block ${
          isDark ? "bg-white/20" : "bg-m98-taupe/85"
        }`}
        aria-hidden
      />
      <span className="flex min-w-0 flex-col justify-center leading-tight">
        <span
          className={`font-display text-lg font-bold tracking-tight ${
            isDark ? "text-white" : ""
          }`}
        >
          <span className={isDark ? "text-white" : "text-m98-heading"}>Meridian</span>
          <span className={isDark ? "text-sky-400" : "text-m98-peach"}>98</span>
        </span>
        {showTagline ? (
          <span
            className={`mt-0.5 text-[11px] font-medium tracking-wide ${
              isDark ? "text-slate-400" : "text-m98-muted"
            }`}
          >
            B2B &amp; SaaS Solutions
          </span>
        ) : null}
      </span>
    </span>
  );
}
