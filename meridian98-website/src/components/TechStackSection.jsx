import FadeInSection from "./FadeInSection";
import SectionBackdrop from "./SectionBackdrop";
import usePrefersReducedMotion from "../hooks/usePrefersReducedMotion";
import { ScrollRevealItem, ScrollRevealStagger } from "./ScrollReveal";

function TechBadge({ name, badge }) {
  const label = badge || name.slice(0, 2);
  return (
    <span className="tech-badge group inline-flex items-center gap-2 rounded-full border border-m98-taupe/35 bg-m98-bg-elevated/70 px-3 py-1.5 text-sm shadow-sm transition hover:border-m98-cyan/45 hover:shadow-md">
      <span
        className="tech-badge-monogram inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-md px-0.5 font-display text-[10px] font-bold tracking-tight text-navy-800"
        aria-hidden
      >
        {label}
      </span>
      <span className="font-medium text-m98-body group-hover:text-m98-heading">{name}</span>
    </span>
  );
}

function TechMarquee({ items = [], reduced }) {
  if (!items.length) return null;
  const track = [...items, ...items];

  return (
    <div
      className="tech-marquee-mask relative -mx-6 mt-10 overflow-hidden sm:-mx-0"
      aria-hidden={reduced}
    >
      <div
        className={`tech-marquee-track flex w-max gap-3 py-1 ${reduced ? "" : "tech-marquee-animate"}`}
      >
        {track.map((name, index) => (
          <span
            key={`${name}-${index}`}
            className="tech-marquee-chip shrink-0 rounded-full border border-m98-taupe/30 bg-m98-bg-elevated/60 px-4 py-2 font-display text-sm font-semibold tracking-tight text-m98-muted backdrop-blur-sm"
          >
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function TechStackSection({ techStack }) {
  const reduced = usePrefersReducedMotion();

  if (!techStack?.categories?.length) return null;

  return (
    <FadeInSection
      id="stack"
      className="relative mx-auto w-full max-w-6xl px-6 py-20 sm:py-24"
    >
      <SectionBackdrop variant="cool" />
      <div className="mb-10 max-w-2xl">
        <p className="section-kicker">{techStack.kicker}</p>
        <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl">
          {techStack.title}
        </h2>
        {techStack.subtitle ? (
          <p className="mt-4 text-sm leading-relaxed text-m98-body sm:text-base">
            {techStack.subtitle}
          </p>
        ) : null}
      </div>

      <TechMarquee items={techStack.marqueeItems} reduced={reduced} />

      <ScrollRevealStagger className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {techStack.categories.map((category) => (
          <ScrollRevealItem
            key={category.id}
            className={`h-full ${category.id === "languages" || category.id === "cloud-devops" ? "sm:col-span-2" : ""}`}
          >
            <article className="tech-category-card light-surface-card h-full rounded-3xl p-5 sm:p-6">
              <h3 className="font-display text-sm font-bold uppercase tracking-[0.16em] text-navy-800">
                {category.label}
              </h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {category.items.map((item) => (
                  <TechBadge
                    key={`${category.id}-${item.name}`}
                    name={item.name}
                    badge={item.badge}
                  />
                ))}
              </div>
            </article>
          </ScrollRevealItem>
        ))}
      </ScrollRevealStagger>
    </FadeInSection>
  );
}
