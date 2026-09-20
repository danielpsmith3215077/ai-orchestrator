import { motion, useScroll } from "framer-motion";
import { useEffect, useState } from "react";
import usePrefersReducedMotion from "../hooks/usePrefersReducedMotion";

const SECTIONS = [
  { id: "top", label: "Home" },
  { id: "about", label: "About" },
  { id: "why", label: "Approach" },
  { id: "stack", label: "Stack" },
  { id: "projects", label: "Work" },
  { id: "team", label: "Team" },
  { id: "contact", label: "Contact" },
];

export default function SectionScrollDots() {
  const reduced = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll();
  const [activeId, setActiveId] = useState("top");

  useEffect(() => {
    const elements = SECTIONS.map(({ id }) => document.getElementById(id)).filter(Boolean);
    if (!elements.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) setActiveId(visible.target.id);
      },
      { rootMargin: "-42% 0px -42% 0px", threshold: [0.08, 0.25, 0.5] }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  if (reduced) return null;

  return (
    <nav
      className="pointer-events-none fixed right-4 top-1/2 z-[55] hidden -translate-y-1/2 flex-col items-end gap-2 lg:flex"
      aria-label="Page sections"
    >
      {SECTIONS.map(({ id, label }) => {
        const active = activeId === id;
        return (
          <a
            key={id}
            href={id === "top" ? "#top" : `#${id}`}
            className="pointer-events-auto group flex items-center gap-2 no-underline"
            aria-current={active ? "true" : undefined}
          >
            <span
              className={`text-[10px] font-semibold uppercase tracking-[0.18em] transition-opacity ${
                active ? "opacity-100 text-m98-peach" : "opacity-0 group-hover:opacity-70 text-m98-muted"
              }`}
            >
              {label}
            </span>
            <span
              className={`block rounded-full border transition-all duration-300 ${
                active
                  ? "h-2.5 w-2.5 border-m98-coral bg-m98-coral shadow-[0_0_10px_rgba(245,158,11,0.45)]"
                  : "h-2 w-2 border-m98-taupe/50 bg-m98-bg-elevated/80 group-hover:border-m98-cyan/60"
              }`}
            />
          </a>
        );
      })}
      <motion.div
        className="pointer-events-none absolute -right-1 top-0 h-full w-px bg-m98-taupe/35"
        style={{ scaleY: scrollYProgress }}
        aria-hidden
      />
    </nav>
  );
}
