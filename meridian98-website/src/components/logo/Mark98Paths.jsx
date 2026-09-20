import { useId } from "react";

/** View box aligned to brand mark proportions (tight crop of source artwork). */
export const MARK_98_VIEWBOX = "0 0 140 165";

/**
 * Intertwined "98" ribbon mark — tuned to match brand JPG (ribbon knot, not rings).
 * Thick strokes + overlapping bridge read as a single woven ribbon at nav size.
 */
export function Mark98GradientDefs({ idPrefix }) {
  const gradId = `${idPrefix}-mark-grad`;
  return (
    <defs>
      <linearGradient
        id={gradId}
        x1="18"
        y1="6"
        x2="122"
        y2="160"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="var(--logo-mark-light, var(--color-accent, #2563eb))" />
        <stop
          offset="0.55"
          stopColor="var(--logo-mark-mid, var(--color-accent, #3b82f6))"
        />
        <stop
          offset="1"
          stopColor="var(--logo-mark-dark, var(--color-primary, #1e40af))"
        />
      </linearGradient>
    </defs>
  );
}

export function Mark98Paths({ idPrefix, strokeWidth = 13.5 }) {
  const gradId = `${idPrefix}-mark-grad`;
  const stroke = `url(#${gradId})`;

  return (
    <g
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* 9 stem — diagonal ribbon tail */}
      <path d="M32 150 L44 82" />
      {/* 9 upper loop */}
      <path d="M44 82 C28 78 14 62 14 44 C14 20 34 6 54 8 C72 10 84 26 82 44 C80 58 66 68 50 66 C42 64 44 82 44 82" />
      {/* Bridge: 9 loop weaves into 8 upper loop */}
      <path d="M82 44 C96 30 118 22 124 40 C132 62 116 76 98 80 C86 82 78 72 82 58 C84 50 82 44 82 44" />
      {/* 8 lower loop */}
      <path d="M98 80 C114 86 128 102 120 120 C112 138 92 142 80 130 C68 118 72 98 88 90 C96 86 98 80 98 80" />
      {/* Inner highlight — suggests ribbon fold */}
      <path
        d="M52 22 C64 14 76 18 78 32"
        strokeWidth={strokeWidth * 0.35}
        stroke="rgba(255,255,255,0.35)"
      />
    </g>
  );
}

export function Mark98({ className, strokeWidth = 13.5, ...props }) {
  const uid = useId().replace(/:/g, "");
  const idPrefix = `m98-${uid}`;

  return (
    <svg
      viewBox={MARK_98_VIEWBOX}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      {...props}
    >
      <Mark98GradientDefs idPrefix={idPrefix} />
      <Mark98Paths idPrefix={idPrefix} strokeWidth={strokeWidth} />
    </svg>
  );
}
