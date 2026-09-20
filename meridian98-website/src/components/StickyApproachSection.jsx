import { motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import usePrefersReducedMotion from "../hooks/usePrefersReducedMotion";
import SectionBackdrop from "./SectionBackdrop";
import { ScrollRevealItem, ScrollRevealStagger } from "./ScrollReveal";

const steps = [
  {
    mark: "01",
    title: "Named outcomes",
    body: "We define success in writing before build — scope, interfaces, and acceptance criteria your exec team can sign.",
  },
  {
    mark: "02",
    title: "Senior delivery",
    body: "Principals stay on the thread from architecture through production. No bait-and-switch bench.",
  },
  {
    mark: "03",
    title: "Platform discipline",
    body: "Observability, cost, and tenancy are designed in — not bolted on after the first outage.",
  },
  {
    mark: "04",
    title: "Operator handoff",
    body: "Runbooks, ownership maps, and documented boundaries so your team inherits clarity, not mystery.",
  },
];

function StepVisual({ activeIndex, reduced }) {
  return (
    <div
      className="relative flex h-full min-h-[280px] items-center justify-center rounded-[1.75rem] border border-slate-200/80 bg-white/75 p-8 shadow-[0_24px_60px_rgba(15,23,42,0.06)] backdrop-blur-md lg:min-h-[420px]"
      aria-live="polite"
    >
      <div className="absolute inset-0 bg-grid-pattern-light opacity-30" aria-hidden />
      {steps.map((step, index) => {
        const active = index === activeIndex;
        return (
          <motion.div
            key={step.mark}
            className="absolute inset-8 flex flex-col justify-end rounded-2xl border border-slate-200/70 bg-gradient-to-br from-white to-slate-50 p-6"
            initial={false}
            animate={{
              opacity: active ? 1 : 0,
              scale: active ? 1 : 0.94,
              y: active ? 0 : reduced ? 0 : 12,
              filter: active ? "blur(0px)" : "blur(4px)",
            }}
            transition={{ duration: reduced ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
            aria-hidden={!active}
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-accent-copper">
              Step {step.mark}
            </p>
            <p className="mt-2 font-display text-2xl font-bold tracking-tight text-navy-950">
              {step.title}
            </p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-600">{step.body}</p>
          </motion.div>
        );
      })}
      <div className="relative z-10 flex gap-2">
        {steps.map((step, index) => (
          <span
            key={step.mark}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === activeIndex ? "w-8 bg-accent-copper" : "w-3 bg-slate-200"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default function StickyApproachSection() {
  const sectionRef = useRef(null);
  const reduced = usePrefersReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start center", "end center"],
  });

  const indexMotion = useTransform(scrollYProgress, [0, 0.33, 0.66, 1], [0, 1, 2, 3]);

  useMotionValueEvent(indexMotion, "change", (value) => {
    if (reduced) return;
    const next = Math.min(steps.length - 1, Math.max(0, Math.round(value)));
    setActiveIndex(next);
  });

  return (
    <section
      id="why"
      ref={sectionRef}
      className="relative border-y border-slate-200/80 py-20 sm:py-24"
    >
      <SectionBackdrop variant="neutral" />
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="mb-12 max-w-2xl">
          <p className="section-kicker">Why Meridian98</p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl">
            The bar for B2B platform work should be written down — and met.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            We combine the rigor of a top-tier dev shop with editorial clarity: what we will build,
            how we will prove it, and what your team owns on day one after launch.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-14">
          <div className="hidden lg:sticky lg:top-28 lg:block lg:self-start">
            <StepVisual activeIndex={reduced ? 0 : activeIndex} reduced={reduced} />
          </div>

          <ScrollRevealStagger className="flex flex-col gap-6 lg:gap-0 lg:pb-[min(36vh,280px)]">
            {steps.map((step) => (
              <ScrollRevealItem
                key={step.title}
                className="lg:min-h-[52vh] lg:py-6 lg:flex lg:items-center"
              >
                <article className="light-surface-card flex h-full w-full gap-4 rounded-3xl p-6 sm:p-7">
                  <div className="pillar-icon shrink-0">{step.mark}</div>
                  <div>
                    <h3 className="font-display text-lg font-bold tracking-tight text-navy-950">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.body}</p>
                  </div>
                </article>
              </ScrollRevealItem>
            ))}
          </ScrollRevealStagger>
        </div>

        <div className="mt-8 lg:hidden">
          <StepVisual activeIndex={reduced ? 0 : activeIndex} reduced={reduced} />
        </div>

        <blockquote className="mt-12 max-w-3xl border-l-2 border-accent-copper pl-6">
          <p className="text-lg leading-relaxed text-slate-700">
            “Meridian98 treats platform work like product work — measurable milestones, honest
            tradeoffs, and systems our team could operate without them in the room.”
          </p>
          <footer className="mt-3 text-sm font-medium text-slate-500">
            VP Engineering · Multi-tenant SaaS
          </footer>
        </blockquote>
      </div>
    </section>
  );
}
