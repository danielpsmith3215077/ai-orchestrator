import { Mark98 } from "./logo/Mark98Paths";

/**
 * @param {{ variant?: 'light' | 'dark', showTagline?: boolean, markClassName?: string, className?: string }} props
 */
export default function Meridian98Logo({
  variant = "light",
  showTagline = false,
  markClassName = "h-9 w-[2.55rem] shrink-0",
  className = "",
}) {
  const themeClass = variant === "dark" ? "logo-theme-dark" : "logo-theme-light";

  return (
    <span
      className={`inline-flex items-center gap-3 ${themeClass} ${className}`.trim()}
    >
      <Mark98 className={markClassName} />
      <span
        className="hidden h-8 w-px shrink-0 bg-[var(--logo-divider,rgba(203,213,225,0.85))] sm:block"
        aria-hidden
      />
      <span className="flex min-w-0 flex-col justify-center leading-tight">
        <span className="font-display text-lg font-bold tracking-tight">
          <span className="text-[var(--logo-word-primary)]">Meridian</span>
          <span className="text-[var(--logo-word-accent)]">98</span>
        </span>
        {showTagline ? (
          <span className="mt-0.5 text-[11px] font-medium tracking-wide text-[var(--logo-tagline)]">
            B2B &amp; SaaS Solutions
          </span>
        ) : null}
      </span>
    </span>
  );
}
