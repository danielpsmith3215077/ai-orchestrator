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

const anchors = [
  { label: "Written scope", detail: "Interfaces & acceptance criteria" },
  { label: "Senior thread", detail: "Architecture through production" },
  { label: "Platform ops", detail: "Observability & cost by design" },
  { label: "Clean handoff", detail: "Runbooks your team can run" },
];

function StepVisual({ activeIndex, reduced }) {
  return (
    <div
      className="relative flex min-h-[220px] items-center justify-center rounded-2xl border border-m98-taupe/35 bg-m98-bg-elevated/70 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:min-h-[240px]"
      aria-live="polite"
    >
      <div className="absolute inset-0 rounded-2xl bg-grid-pattern-light opacity-25" aria-hidden />
      {steps.map((step, index) => {
        const active = index === activeIndex;
        return (
          <motion.div
            key={step.mark}
            className="absolute inset-5 flex flex-col justify-end rounded-xl border border-m98-taupe/28 bg-gradient-to-br from-m98-bg-elevated/95 to-m98-bg/98 p-5 sm:inset-6 sm:p-6"
            initial={false}
            animate={{
              opacity: active ? 1 : 0,
              scale: active ? 1 : 0.96,
              y: active ? 0 : reduced ? 0 : 8,
              filter: active ? "blur(0px)" : "blur(3px)",
            }}
            transition={{ duration: reduced ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}
            aria-hidden={!active}
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-accent-copper">
              Step {step.mark}
            </p>
            <p className="mt-2 font-display text-xl font-bold tracking-tight text-navy-950 sm:text-2xl">
              {step.title}
            </p>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-m98-body">{step.body}</p>
          </motion.div>
        );
      })}
      <div className="relative z-10 flex gap-2">
        {steps.map((step, index) => (
          <span
            key={step.mark}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === activeIndex ? "w-8 bg-m98-coral" : "w-3 bg-m98-taupe/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function ApproachAnchorGrid() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-m98-taupe/30 bg-gradient-to-br from-m98-bg-elevated/90 to-m98-bg/95 p-4 sm:p-5">
      <div className="absolute inset-0 bg-grid-pattern-light opacity-20" aria-hidden />
      <ul className="relative grid grid-cols-2 gap-3">
        {anchors.map((item) => (
          <li
            key={item.label}
            className="rounded-xl border border-m98-taupe/25 bg-m98-bg-elevated/80 px-3 py-2.5"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-m98-cyan">
              {item.label}
            </p>
            <p className="mt-1 text-xs leading-snug text-m98-body">{item.detail}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function StickyApproachSection() {
  const sectionRef = useRef(null);
  const reduced = usePrefersReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 0.75", "end 0.35"],
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
      className="relative border-y border-m98-taupe/25 py-16 sm:py-20"
    >
      <SectionBackdrop variant="neutral" />
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-start lg:gap-8 xl:gap-10">
          <div className="lg:sticky lg:top-24 lg:space-y-6">
            <div className="max-w-xl">
              <p className="section-kicker">Why Meridian98</p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl">
                The bar for B2B platform work should be written down — and met.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-m98-body">
                We combine the rigor of a top-tier dev shop with editorial clarity: what we will
                build, how we will prove it, and what your team owns on day one after launch.
              </p>
            </div>

            <div className="hidden lg:block">
              <StepVisual activeIndex={reduced ? 0 : activeIndex} reduced={reduced} />
            </div>

            <ApproachAnchorGrid />
          </div>

          <ScrollRevealStagger className="flex flex-col gap-4 sm:gap-5 lg:gap-5 lg:pb-16">
            {steps.map((step, index) => (
              <ScrollRevealItem
                key={step.title}
                className={`lg:py-1 ${!reduced && index < steps.length - 1 ? "lg:min-h-[20vh]" : ""}`}
              >
                <article className="light-surface-card flex w-full gap-4 rounded-2xl p-5 sm:p-6">
                  <div className="pillar-icon shrink-0">{step.mark}</div>
                  <div>
                    <h3 className="font-display text-lg font-bold tracking-tight text-navy-950">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-m98-body">{step.body}</p>
                  </div>
                </article>
              </ScrollRevealItem>
            ))}
          </ScrollRevealStagger>
        </div>

        <div className="mt-8 lg:hidden">
          <StepVisual activeIndex={reduced ? 0 : activeIndex} reduced={reduced} />
        </div>

        <blockquote className="mt-10 max-w-3xl border-l-2 border-accent-copper pl-6 lg:mt-12">
          <p className="text-lg leading-relaxed text-m98-body">
            “Meridian98 treats platform work like product work — measurable milestones, honest
            tradeoffs, and systems our team could operate without them in the room.”
          </p>
          <footer className="mt-3 text-sm font-medium text-m98-muted">
            VP Engineering · Multi-tenant SaaS
          </footer>
        </blockquote>
      </div>
    </section>
  );
}
