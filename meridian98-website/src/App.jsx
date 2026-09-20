import { useEffect, useMemo, useState } from "react";
import siteContent from "./siteContent";
import Dashboard from "./components/Dashboard";
import ScrollFrameHero from "./components/ScrollFrameHero";
import FadeInSection from "./components/FadeInSection";

const siteConfig = siteContent;

const pillars = [
  {
    title: "Named outcomes",
    body: "We define success in writing before build — scope, interfaces, and acceptance criteria your exec team can sign.",
    mark: "01",
  },
  {
    title: "Senior delivery",
    body: "Principals stay on the thread from architecture through production. No bait-and-switch bench.",
    mark: "02",
  },
  {
    title: "Platform discipline",
    body: "Observability, cost, and tenancy are designed in — not bolted on after the first outage.",
    mark: "03",
  },
  {
    title: "Operator handoff",
    body: "Runbooks, ownership maps, and documented boundaries so your team inherits clarity, not mystery.",
    mark: "04",
  },
];

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
    <div className="relative min-h-screen overflow-x-hidden bg-[#fafafa] text-slate-900">
      <div className="pointer-events-none fixed inset-0 bg-grid-pattern-light opacity-40" />

      <header
        className={`sticky top-0 z-50 border-b border-transparent transition-all duration-300 ${
          scrolled ? "nav-scrolled-light" : "bg-[#fafafa]/60"
        }`}
      >
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
          <a href="#top" className="flex items-center gap-3 no-underline text-inherit">
            <img
              src="/logo.png"
              alt={`${siteConfig.companyName} logo`}
              className="h-8 w-8 rounded-lg object-cover ring-1 ring-slate-200"
            />
            <span className="font-display text-lg font-bold tracking-tight text-navy-950">
              {siteConfig.companyName}
            </span>
          </a>

          <nav className="hidden items-center gap-7 text-sm font-medium text-slate-600 md:flex">
            <a href="#about" className="transition hover:text-navy-950">
              About
            </a>
            <a href="#why" className="transition hover:text-navy-950">
              Approach
            </a>
            <a href="#projects" className="transition hover:text-navy-950">
              Work
            </a>
            <a href="#team" className="transition hover:text-navy-950">
              Team
            </a>
            <a href="#contact" className="transition hover:text-navy-950">
              Contact
            </a>
            <a href="#contact" className="btn-primary !px-4 !py-2 text-sm">
              {siteConfig.primaryCta}
            </a>
          </nav>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white md:hidden"
            aria-expanded={mobileOpen}
            aria-label="Toggle navigation"
            onClick={() => setMobileOpen((v) => !v)}
          >
            <span className="sr-only">Menu</span>
            <span className="flex flex-col gap-1.5">
              <span className="block h-0.5 w-4 bg-slate-700" />
              <span className="block h-0.5 w-4 bg-slate-700" />
            </span>
          </button>
        </div>

        {mobileOpen ? (
          <div className="border-t border-slate-200 bg-white/95 px-6 py-4 md:hidden">
            <div className="flex flex-col gap-3 text-sm font-medium text-slate-700">
              {[
                ["#about", "About"],
                ["#why", "Approach"],
                ["#projects", "Work"],
                ["#team", "Team"],
                ["#contact", "Contact"],
              ].map(([href, label]) => (
                <a
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-2 py-2 hover:bg-slate-50"
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

      <main id="top" className="relative">
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
                <p className="mt-1 text-xs leading-relaxed text-slate-600">{item.label}</p>
              </article>
            ))}
          </div>
        </FadeInSection>

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
            <p className="text-base leading-relaxed text-slate-600">
              Meridian98 embeds with your leadership and engineering teams to make durable
              decisions — then stays through delivery until the system runs the way you
              promised customers it would.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
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
            ].map((item, index) => (
              <FadeInSection key={item.title} delay={index * 0.06} className="h-full">
                <article className="light-surface-card light-surface-card-accent h-full rounded-3xl p-6 sm:p-7">
                  <h3 className="font-display text-xl font-bold tracking-tight text-navy-950">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{item.body}</p>
                </article>
              </FadeInSection>
            ))}
          </div>
        </FadeInSection>

        <FadeInSection
          id="why"
          className="relative border-y border-slate-200/80 bg-white/70 py-20 sm:py-24"
        >
          <div className="mx-auto w-full max-w-6xl px-6">
            <div className="mb-12 max-w-2xl">
              <p className="section-kicker">Why Meridian98</p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl">
                The bar for B2B platform work should be written down — and met.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-600">
                We combine the rigor of a top-tier dev shop with editorial clarity: what we
                will build, how we will prove it, and what your team owns on day one after
                launch.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {pillars.map((pillar, index) => (
                <FadeInSection key={pillar.title} delay={index * 0.05}>
                  <article className="light-surface-card flex h-full gap-4 rounded-3xl p-6 sm:p-7">
                    <div className="pillar-icon shrink-0">{pillar.mark}</div>
                    <div>
                      <h3 className="font-display text-lg font-bold tracking-tight text-navy-950">
                        {pillar.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        {pillar.body}
                      </p>
                    </div>
                  </article>
                </FadeInSection>
              ))}
            </div>

            <blockquote className="mt-12 max-w-3xl border-l-2 border-accent-copper pl-6">
              <p className="text-lg leading-relaxed text-slate-700">
                “Meridian98 treats platform work like product work — measurable milestones,
                honest tradeoffs, and systems our team could operate without them in the
                room.”
              </p>
              <footer className="mt-3 text-sm font-medium text-slate-500">
                VP Engineering · Multi-tenant SaaS
              </footer>
            </blockquote>
          </div>
        </FadeInSection>

        <FadeInSection
          id="projects"
          className="relative mx-auto w-full max-w-6xl px-6 py-20 sm:py-24"
        >
          <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-xl">
              <p className="section-kicker">Selected work</p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl">
                Platforms we have shipped in production.
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-slate-600">
              A public sample of completed engagements. Active programs remain in the
              operator dashboard.
            </p>
          </div>

          <div className="flex flex-col gap-6">
            {publicProjects.map((project, index) => (
              <FadeInSection key={project.id} delay={index * 0.06}>
                <article className="case-study-card rounded-[1.75rem] p-6 sm:p-8">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
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
                    <h3 className="font-display text-2xl font-bold tracking-tight text-navy-950">
                      {project.name}
                    </h3>
                    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
                      {project.summary}
                    </p>
                    {project.url ? (
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-5 inline-flex text-sm font-semibold text-navy-800 transition hover:text-accent-copper"
                      >
                        View case study →
                      </a>
                    ) : null}
                  </div>
                </article>
              </FadeInSection>
            ))}
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
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 text-lg font-bold text-navy-800">
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
                <p className="mt-4 text-sm leading-relaxed text-slate-600">{founder.bio}</p>
              </article>
            ))}
          </div>
        </FadeInSection>

        <FadeInSection
          id="contact"
          className="relative mx-auto w-full max-w-6xl px-6 py-20 sm:py-24"
        >
          <div className="contact-panel rounded-[2rem] p-7 sm:p-10 lg:p-12">
            <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
              <div>
                <p className="section-kicker">Contact</p>
                <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl">
                  Tell us what you are building next.
                </h2>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-600 sm:text-base">
                  Share context on your platform, timeline, and constraints. We respond with
                  a direct next step — typically a working session, not a generic
                  capabilities deck.
                </p>
                <a
                  href={`mailto:${siteConfig.contactEmail}`}
                  className="mt-6 inline-flex text-sm font-semibold text-navy-800 hover:text-accent-copper"
                >
                  {siteConfig.contactEmail}
                </a>
              </div>

              <form className="space-y-4" onSubmit={handleContact}>
                <label className="block text-sm font-medium text-slate-700">
                  Name
                  <input name="name" required className="input-light" />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Work email
                  <input name="email" type="email" required className="input-light" />
                </label>
                <label className="block text-sm font-medium text-slate-700">
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

      <footer className="footer-navy border-t border-slate-800/50">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt=""
              className="h-7 w-7 rounded-md object-cover ring-1 ring-white/10"
            />
            <div>
              <p className="font-display text-sm font-bold">{siteConfig.companyName}</p>
              <p className="text-xs text-slate-400">
                B2B cloud consulting · Platform engineering
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
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
