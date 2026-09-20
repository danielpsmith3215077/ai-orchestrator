import { motion, useScroll } from "framer-motion";
import { useEffect, useState } from "react";
import usePrefersReducedMotion from "../hooks/usePrefersReducedMotion";

const SECTIONS = [
  { id: "top", label: "Home" },
  { id: "about", label: "About" },
  { id: "why", label: "Approach" },
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
                active ? "opacity-100 text-navy-800" : "opacity-0 group-hover:opacity-70 text-slate-500"
              }`}
            >
              {label}
            </span>
            <span
              className={`block rounded-full border transition-all duration-300 ${
                active
                  ? "h-2.5 w-2.5 border-accent-copper bg-accent-copper shadow-[0_0_10px_rgba(180,83,9,0.45)]"
                  : "h-2 w-2 border-slate-300 bg-white/90 group-hover:border-slate-400"
              }`}
            />
          </a>
        );
      })}
      <motion.div
        className="pointer-events-none absolute -right-1 top-0 h-full w-px bg-slate-200/80"
        style={{ scaleY: scrollYProgress }}
        aria-hidden
      />
    </nav>
  );
}
