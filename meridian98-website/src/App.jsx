import { useEffect, useMemo, useState } from "react";
import siteContent, { clientById, publicClients } from "./siteContent";
import Dashboard from "./components/Dashboard";
import ScrollFrameHero from "./components/ScrollFrameHero";
import FadeInSection from "./components/FadeInSection";
import MarketingScrollShell from "./components/MarketingScrollShell";
import SectionBackdrop from "./components/SectionBackdrop";
import StickyApproachSection from "./components/StickyApproachSection";
import TrustedByStrip from "./components/TrustedByStrip";
import ClientsGridSection from "./components/ClientsGridSection";
import TechStackSection from "./components/TechStackSection";
import { ScrollRevealItem, ScrollRevealStagger } from "./components/ScrollReveal";
import Meridian98Logo from "./components/Meridian98Logo";

const siteConfig = siteContent;

function isDashboardHash(hash = window.location.hash) {
  return hash === "#/dashboard" || hash.startsWith("#/dashboard?");
}

export default function App() {
  const [route, setRoute] = useState(() =>
    typeof window !== "undefined" && isDashboardHash() ? "dashboard" : "marketing"
  );
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [formStatus, setFormStatus] = useState("");

  const publicProjects = useMemo(
    () =>
      siteConfig.projects.filter(
        (project) => project.visibility === "public" && project.status === "past"
      ),
    []
  );

  const featuredClients = useMemo(() => publicClients(siteConfig), []);

  const projectsById = useMemo(
    () => Object.fromEntries(siteConfig.projects.map((p) => [p.id, p])),
    []
  );

  useEffect(() => {
    const syncRoute = () => {
      setRoute(isDashboardHash() ? "dashboard" : "marketing");
    };
    syncRoute();
    window.addEventListener("hashchange", syncRoute);
    return () => window.removeEventListener("hashchange", syncRoute);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goDashboard = () => {
    window.location.hash = "#/dashboard";
  };

  const exitDashboard = () => {
    window.location.hash = "";
  };

  const handleContact = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") || "").trim();
    setFormStatus(
      `Thanks${name ? `, ${name}` : ""}. Meridian98 will respond shortly.`
    );
    event.currentTarget.reset();
  };

  if (route === "dashboard") {
    return <Dashboard siteConfig={siteConfig} onExit={exitDashboard} />;
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-m98-bg text-m98-heading">
      <MarketingScrollShell />

      <header
        className={`sticky top-0 z-50 border-b border-transparent transition-all duration-300 ${
          scrolled ? "nav-scrolled-light" : "bg-m98-bg/70"
        }`}
      >
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
          <a href="#top" className="no-underline text-inherit">
            <Meridian98Logo variant="light" />
          </a>

          <nav className="hidden items-center gap-7 text-sm font-medium text-m98-body md:flex">
            <a href="#about" className="transition hover:text-m98-heading">
              About
            </a>
            <a href="#why" className="transition hover:text-m98-heading">
              Approach
            </a>
            <a href="#stack" className="transition hover:text-m98-heading">
              Stack
            </a>
            <a href="#projects" className="transition hover:text-m98-heading">
              Work
            </a>
            <a href="#team" className="transition hover:text-m98-heading">
              Team
            </a>
            <a href="#contact" className="transition hover:text-m98-heading">
              Contact
            </a>
            <a href="#contact" className="btn-primary !px-4 !py-2 text-sm">
              {siteConfig.primaryCta}
            </a>
          </nav>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-m98-taupe/35 bg-m98-bg-elevated/70 md:hidden"
            aria-expanded={mobileOpen}
            aria-label="Toggle navigation"
            onClick={() => setMobileOpen((v) => !v)}
          >
            <span className="sr-only">Menu</span>
            <span className="flex flex-col gap-1.5">
              <span className="block h-0.5 w-4 bg-m98-peach" />
              <span className="block h-0.5 w-4 bg-m98-peach" />
            </span>
          </button>
        </div>

        {mobileOpen ? (
          <div className="border-t border-m98-taupe/30 bg-m98-bg-elevated/95 px-6 py-4 md:hidden">
            <div className="flex flex-col gap-3 text-sm font-medium text-m98-body">
              {[
                ["#about", "About"],
                ["#why", "Approach"],
                ["#stack", "Stack"],
                ["#projects", "Work"],
                ["#team", "Team"],
                ["#contact", "Contact"],
              ].map(([href, label]) => (
                <a
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-2 py-2 hover:bg-m98-bg/80"
                >
                  {label}
                </a>
              ))}
              <a
                href="#contact"
                onClick={() => setMobileOpen(false)}
                className="btn-primary mt-1 text-center"
              >
                {siteConfig.primaryCta}
              </a>
            </div>
          </div>
        ) : null}
      </header>

      <main id="top" className="relative z-[3]">
        <ScrollFrameHero siteConfig={siteConfig} onDashboard={goDashboard} />

        <FadeInSection className="relative mx-auto w-full max-w-6xl px-6 py-10">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { value: "Production-first", label: "Every engagement ships runnable software" },
              { value: "Senior-led", label: "Architects on the critical path, not sidelines" },
              { value: "Clear handoff", label: "Documentation your operators can run with" },
            ].map((item) => (
              <article key={item.value} className="stat-pill rounded-2xl px-5 py-4">
                <p className="font-display text-sm font-bold tracking-tight text-navy-950">
                  {item.value}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-m98-body">{item.label}</p>
              </article>
            ))}
          </div>
        </FadeInSection>

        <TrustedByStrip clients={featuredClients} />

        <FadeInSection
          id="about"
          className="relative mx-auto w-full max-w-6xl px-6 py-20 sm:py-24"
        >
          <div className="mb-12 grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-end">
            <div>
              <p className="section-kicker">About</p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl lg:text-[2.65rem] lg:leading-[1.08]">
                Consulting built for operators, not slide decks.
              </h2>
            </div>
            <p className="text-base leading-relaxed text-m98-body">
              Meridian98 embeds with your leadership and engineering teams to make durable
              decisions — then stays through delivery until the system runs the way you
              promised customers it would.
            </p>
          </div>

          <ScrollRevealStagger className="grid gap-5 md:grid-cols-3">
            {[
              {
                title: "Architecture first",
                body: "We define boundaries, contracts, and migration paths before code spreads across teams.",
              },
              {
                title: "Reduce structural debt",
                body: "Retire brittle integrations with observability, ownership, and platforms your staff can extend.",
              },
              {
                title: "Measured scale",
                body: "Capacity, cost, and compliance stay visible — so growth does not trade away reliability.",
              },
            ].map((item) => (
              <ScrollRevealItem key={item.title} className="h-full">
                <article className="light-surface-card light-surface-card-accent h-full rounded-3xl p-6 sm:p-7">
                  <h3 className="font-display text-xl font-bold tracking-tight text-navy-950">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-m98-body">{item.body}</p>
                </article>
              </ScrollRevealItem>
            ))}
          </ScrollRevealStagger>
        </FadeInSection>

        <StickyApproachSection />

        <TechStackSection techStack={siteConfig.techStack} />

        <ClientsGridSection
          clients={featuredClients}
          projectsById={projectsById}
        />

        <FadeInSection
          id="projects"
          className="relative mx-auto w-full max-w-6xl px-6 py-20 sm:py-24"
        >
          <SectionBackdrop variant="cool" />
          <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-xl">
              <p className="section-kicker">Selected work</p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl">
                Platforms we have shipped in production.
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-m98-body">
              A public sample of completed engagements. Active programs remain in the
              operator dashboard.
            </p>
          </div>

          <div className="flex flex-col gap-6">
            {publicProjects.map((project, index) => {
              const client = clientById(siteConfig.clients, project.clientRef);
              return (
              <FadeInSection key={project.id} delay={index * 0.06}>
                <article className="case-study-card rounded-[1.75rem] p-6 sm:p-8">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-m98-taupe/35 bg-m98-bg-elevated/70 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-m98-muted">
                        {project.tag}
                      </span>
                      <span className="rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider status-past">
                        Shipped
                      </span>
                    </div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-accent-copper">
                      Case {String(index + 1).padStart(2, "0")}
                    </p>
                  </div>
                  <div>
                    {client ? (
                      <p className="case-study-client mb-1 uppercase tracking-[0.16em] text-accent-copper">
                        {client.name}
                        {client.industry ? (
                          <span className="ml-2 font-normal normal-case tracking-normal text-m98-muted">
                            · {client.industry}
                          </span>
                        ) : null}
                      </p>
                    ) : null}
                    <h3 className="font-display text-2xl font-bold tracking-tight text-navy-950">
                      {project.name}
                    </h3>
                    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-m98-body sm:text-base">
                      {project.summary}
                    </p>
                    {project.url ? (
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-5 inline-flex text-sm font-semibold link-accent"
                      >
                        View case study →
                      </a>
                    ) : null}
                  </div>
                </article>
              </FadeInSection>
            );
            })}
          </div>
        </FadeInSection>

        <FadeInSection
          id="team"
          className="relative mx-auto w-full max-w-6xl px-6 py-20 sm:py-24"
        >
          <div className="mb-10 max-w-2xl">
            <p className="section-kicker">Leadership</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl">
              Founders who still write and review the work.
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {siteConfig.founders.map((founder) => (
              <article
                key={founder.id}
                className="light-surface-card rounded-3xl p-7 sm:p-8"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-m98-cyan/25 to-m98-coral/20 text-lg font-bold text-m98-peach">
                  {founder.name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")}
                </div>
                <h3 className="mt-5 font-display text-2xl font-bold tracking-tight text-navy-950">
                  {founder.name}
                </h3>
                <p className="mt-1 text-sm font-semibold uppercase tracking-[0.18em] text-accent-copper">
                  {founder.role}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-m98-body">{founder.bio}</p>
              </article>
            ))}
          </div>
        </FadeInSection>

        <FadeInSection
          id="contact"
          className="relative mx-auto w-full max-w-6xl px-6 py-20 sm:py-24"
        >
          <SectionBackdrop variant="warm" />
          <div className="contact-panel rounded-[2rem] p-7 sm:p-10 lg:p-12">
            <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
              <div>
                <p className="section-kicker">Contact</p>
                <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl">
                  Tell us what you are building next.
                </h2>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-m98-body sm:text-base">
                  Share context on your platform, timeline, and constraints. We respond with
                  a direct next step — typically a working session, not a generic
                  capabilities deck.
                </p>
                <a
                  href={`mailto:${siteConfig.contactEmail}`}
                  className="mt-6 inline-flex text-sm font-semibold link-accent"
                >
                  {siteConfig.contactEmail}
                </a>
              </div>

              <form className="space-y-4" onSubmit={handleContact}>
                <label className="block text-sm font-medium text-m98-body">
                  Name
                  <input name="name" required className="input-light" />
                </label>
                <label className="block text-sm font-medium text-m98-body">
                  Work email
                  <input name="email" type="email" required className="input-light" />
                </label>
                <label className="block text-sm font-medium text-m98-body">
                  What are you scaling?
                  <textarea name="message" rows={4} required className="input-light resize-y" />
                </label>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button type="submit" className="btn-primary">
                    {siteConfig.primaryCta}
                  </button>
                  <p className="text-sm font-medium text-accent-copper" role="status">
                    {formStatus}
                  </p>
                </div>
              </form>
            </div>
          </div>
        </FadeInSection>
      </main>

      <footer className="footer-navy border-t border-m98-taupe/25">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Meridian98Logo
              variant="dark"
              showTagline
              markClassName="h-8 w-[2.15rem] shrink-0"
              className="gap-2.5"
            />
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs text-m98-muted">
            <button
              type="button"
              onClick={goDashboard}
              className="font-medium text-slate-300 transition hover:text-white"
            >
              Dashboard
            </button>
            <a
              href={`mailto:${siteConfig.contactEmail}`}
              className="font-medium text-slate-300 transition hover:text-white"
            >
              {siteConfig.contactEmail}
            </a>
            <p>© {new Date().getFullYear()} Meridian98</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
