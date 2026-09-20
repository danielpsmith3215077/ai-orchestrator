import { useId } from "react";

/** View box aligned to brand mark proportions (tight crop of source artwork). */
export const MARK_98_VIEWBOX = "0 0 140 165";

/**
 * Intertwined "98" ribbon mark — hand-tuned to match brand JPG geometry.
 * Rendered with thick strokes so the knot reads at nav + favicon sizes.
 */
export function Mark98GradientDefs({ idPrefix }) {
  const gradId = `${idPrefix}-mark-grad`;
  return (
    <defs>
      <linearGradient
        id={gradId}
        x1="12"
        y1="8"
        x2="128"
        y2="158"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="var(--logo-mark-light, var(--color-accent, #2563eb))" />
        <stop
          offset="1"
          stopColor="var(--logo-mark-dark, var(--color-primary, #1e40af))"
        />
      </linearGradient>
    </defs>
  );
}

export function Mark98Paths({ idPrefix, strokeWidth = 12.5 }) {
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
      {/* 9 stem */}
      <path d="M34 148 L46 76" />
      {/* 9 loop */}
      <path d="M46 76 C30 72 18 58 18 42 C18 22 34 8 52 8 C68 8 80 22 80 38 C80 52 68 64 52 64 C44 64 38 58 46 76" />
      {/* 8 upper + bridge from 9 */}
      <path d="M80 38 C94 24 116 18 122 36 C130 58 114 72 96 76 C84 78 74 68 80 54" />
      {/* 8 lower loop */}
      <path d="M96 76 C112 82 126 98 118 116 C110 134 90 138 78 126 C66 114 70 94 86 86 C96 80 102 78 96 76" />
    </g>
  );
}

export function Mark98({ className, strokeWidth = 12.5, ...props }) {
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
