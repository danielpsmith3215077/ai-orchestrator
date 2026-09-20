import FadeInSection from "./FadeInSection";
import SectionBackdrop from "./SectionBackdrop";
import ClientMonogram from "./ClientMonogram";
import { ScrollRevealItem, ScrollRevealStagger } from "./ScrollReveal";

export default function ClientsGridSection({ clients = [], projectsById = {} }) {
  if (!clients.length) return null;

  return (
    <FadeInSection
      id="clients"
      className="relative mx-auto w-full max-w-6xl px-6 py-16 sm:py-20"
    >
      <SectionBackdrop variant="neutral" />
      <div className="mb-10 max-w-2xl">
        <p className="section-kicker">Partners</p>
        <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl">
          Companies behind the work.
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-m98-body sm:text-base">
          Each engagement pairs Meridian98 with an operator team scaling regulated or
          multi-tenant platforms — with outcomes you can reference on the floor, not only
          in a deck.
        </p>
      </div>

      <ScrollRevealStagger className="grid gap-5 md:grid-cols-3">
        {clients.map((client) => {
          const project = projectsById[client.projectRef];
          return (
            <ScrollRevealItem key={client.id} className="h-full">
              <article className="client-grid-card light-surface-card h-full rounded-3xl p-6 sm:p-7">
                <div className="flex items-start justify-between gap-3">
                  {client.logoUrl ? (
                    <img
                      src={client.logoUrl}
                      alt=""
                      className="h-10 max-w-[140px] object-contain"
                    />
                  ) : (
                    <ClientMonogram name={client.name} className="h-11 w-11 text-sm" />
                  )}
                  <span className="rounded-full border border-m98-taupe/35 bg-m98-bg/60 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-m98-muted">
                    {client.industry}
                  </span>
                </div>
                <h3 className="mt-5 font-display text-xl font-bold tracking-tight text-navy-950">
                  {client.website ? (
                    <a
                      href={client.website}
                      target="_blank"
                      rel="noreferrer"
                      className="transition hover:text-accent-copper"
                    >
                      {client.name}
                    </a>
                  ) : (
                    client.name
                  )}
                </h3>
                {project ? (
                  <p className="mt-1 text-xs font-medium text-m98-muted">
                    Project:{" "}
                    <span className="text-navy-800">{project.name}</span>
                  </p>
                ) : null}
                {client.testimonial ? (
                  <blockquote className="mt-4 border-l-2 border-m98-coral/40 pl-3 text-sm leading-relaxed text-m98-body">
                    “{client.testimonial}”
                  </blockquote>
                ) : null}
              </article>
            </ScrollRevealItem>
          );
        })}
      </ScrollRevealStagger>
    </FadeInSection>
  );
}
