import { useEffect, useMemo, useState } from "react";
import siteContent from "./siteContent";
import Dashboard from "./components/Dashboard";
import ScrollFrameHero from "./components/ScrollFrameHero";
import FadeInSection from "./components/FadeInSection";

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
    <div className="relative min-h-screen overflow-x-hidden bg-[#030712] text-slate-50">
      <div className="pointer-events-none fixed inset-0 bg-grid-pattern opacity-[0.18]" />
      <div className="pointer-events-none fixed -left-32 top-24 h-[28rem] w-[28rem] rounded-full bg-indigo-600/20 blur-3xl animate-glow-orb" />
      <div className="pointer-events-none fixed -right-24 top-[28rem] h-[26rem] w-[26rem] rounded-full bg-teal-400/15 blur-3xl animate-glow-orb" />

      <header
        className={`sticky top-0 z-50 border-b border-transparent transition-all duration-300 ${
          scrolled ? "nav-scrolled" : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
          <a href="#top" className="flex items-center gap-3 no-underline">
            <img
              src="/logo.png"
              alt={`${siteConfig.companyName} logo`}
              className="h-8 w-8 rounded-lg object-cover ring-1 ring-white/10"
            />
            <span className="font-display text-lg font-bold tracking-tight">
              {siteConfig.companyName}
            </span>
          </a>

          <nav className="hidden items-center gap-7 text-sm font-medium text-slate-300 md:flex">
            <a href="#about" className="transition hover:text-white">
              About
            </a>
            <a href="#projects" className="transition hover:text-white">
              Projects
            </a>
            <a href="#team" className="transition hover:text-white">
              Team
            </a>
            <a href="#contact" className="transition hover:text-white">
              Contact
            </a>
            <a
              href="#contact"
              className="rounded-full bg-gradient-to-r from-indigo-500 to-teal-400 px-4 py-2 font-semibold text-slate-950 transition hover:brightness-110"
            >
              {siteConfig.primaryCta}
            </a>
          </nav>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700/80 md:hidden"
            aria-expanded={mobileOpen}
            aria-label="Toggle navigation"
            onClick={() => setMobileOpen((v) => !v)}
          >
            <span className="sr-only">Menu</span>
            <span className="flex flex-col gap-1.5">
              <span className="block h-0.5 w-4 bg-slate-200" />
              <span className="block h-0.5 w-4 bg-slate-200" />
            </span>
          </button>
        </div>

        {mobileOpen ? (
          <div className="border-t border-slate-800/80 bg-[#030712]/95 px-6 py-4 md:hidden">
            <div className="flex flex-col gap-3 text-sm font-medium text-slate-200">
              {[
                ["#about", "About"],
                ["#projects", "Projects"],
                ["#team", "Team"],
                ["#contact", "Contact"],
              ].map(([href, label]) => (
                <a
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-2 py-2 hover:bg-slate-900"
                >
                  {label}
                </a>
              ))}
              <a
                href="#contact"
                onClick={() => setMobileOpen(false)}
                className="mt-1 rounded-full bg-gradient-to-r from-indigo-500 to-teal-400 px-4 py-2 text-center font-semibold text-slate-950"
              >
                {siteConfig.primaryCta}
              </a>
            </div>
          </div>
        ) : null}
      </header>

      <main id="top">
        <ScrollFrameHero siteConfig={siteConfig} onDashboard={goDashboard} />

        <FadeInSection
          id="about"
          className="relative mx-auto w-full max-w-6xl px-6 py-24"
        >
          <div className="mb-10 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-300">
              About
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Consulting built for operators, not slide decks.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-400 sm:text-base">
              Meridian98 embeds with your leadership and engineering teams to make
              durable decisions — then stays through delivery until the system runs
              the way you promised customers it would.
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
                <article className="cinematic-glow-card h-full rounded-3xl p-6">
                  <h3 className="font-display text-xl font-bold tracking-tight">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-400">
                    {item.body}
                  </p>
                </article>
              </FadeInSection>
            ))}
          </div>
        </FadeInSection>

        <FadeInSection
          id="projects"
          className="relative mx-auto w-full max-w-6xl px-6 py-24"
        >
          <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-300">
                Selected work
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                Platforms we have shipped in production.
              </h2>
            </div>
            <p className="max-w-sm text-sm text-slate-400">
              A public sample of completed engagements. Active programs and internal
              lanes remain in the operator dashboard.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {publicProjects.map((project) => (
              <article
                key={project.id}
                className="cinematic-glow-card group rounded-3xl p-6 transition duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full border border-slate-600/70 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-slate-300">
                    {project.tag}
                  </span>
                  <span className="rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider status-past">
                    {project.status}
                  </span>
                </div>
                <h3 className="mt-5 font-display text-xl font-bold tracking-tight">
                  {project.name}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">
                  {project.summary}
                </p>
                {project.url ? (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-flex text-sm font-semibold text-indigo-300 transition group-hover:text-teal-300"
                  >
                    View case →
                  </a>
                ) : null}
              </article>
            ))}
          </div>
        </FadeInSection>

        <FadeInSection
          id="team"
          className="relative mx-auto w-full max-w-6xl px-6 py-24"
        >
          <div className="mb-10 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-300">
              Leadership
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Founders who still write and review the work.
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {siteConfig.founders.map((founder) => (
              <article
                key={founder.id}
                className="cinematic-glow-card rounded-3xl p-7 sm:p-8"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/40 to-teal-400/30 text-lg font-bold">
                  {founder.name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")}
                </div>
                <h3 className="mt-5 font-display text-2xl font-bold tracking-tight">
                  {founder.name}
                </h3>
                <p className="mt-1 text-sm font-semibold uppercase tracking-[0.18em] text-indigo-300">
                  {founder.role}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-slate-400">
                  {founder.bio}
                </p>
              </article>
            ))}
          </div>
        </FadeInSection>

        <FadeInSection
          id="contact"
          className="relative mx-auto w-full max-w-6xl px-6 py-24"
        >
          <div className="cinematic-glow-card rounded-[2rem] p-7 sm:p-10">
            <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-300">
                  Contact
                </p>
                <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                  Tell us what you are building next.
                </h2>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-400">
                  Share context on your platform, timeline, and constraints. We
                  respond with a direct next step — typically a working session, not
                  a generic capabilities deck.
                </p>
                <a
                  href={`mailto:${siteConfig.contactEmail}`}
                  className="mt-6 inline-flex text-sm font-semibold text-teal-300 hover:text-teal-200"
                >
                  {siteConfig.contactEmail}
                </a>
              </div>

              <form className="space-y-4" onSubmit={handleContact}>
                <label className="block text-sm font-medium text-slate-300">
                  Name
                  <input
                    name="name"
                    required
                    className="mt-2 w-full rounded-xl border border-slate-700/80 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none ring-indigo-400/40 transition focus:ring-2"
                  />
                </label>
                <label className="block text-sm font-medium text-slate-300">
                  Work email
                  <input
                    name="email"
                    type="email"
                    required
                    className="mt-2 w-full rounded-xl border border-slate-700/80 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none ring-indigo-400/40 transition focus:ring-2"
                  />
                </label>
                <label className="block text-sm font-medium text-slate-300">
                  What are you scaling?
                  <textarea
                    name="message"
                    rows={4}
                    required
                    className="mt-2 w-full resize-y rounded-xl border border-slate-700/80 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none ring-indigo-400/40 transition focus:ring-2"
                  />
                </label>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="submit"
                    className="rounded-full bg-gradient-to-r from-indigo-500 to-teal-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110"
                  >
                    {siteConfig.primaryCta}
                  </button>
                  <p className="text-sm text-teal-300" role="status">
                    {formStatus}
                  </p>
                </div>
              </form>
            </div>
          </div>
        </FadeInSection>
      </main>

      <footer className="border-t border-slate-800/80">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt=""
              className="h-7 w-7 rounded-md object-cover ring-1 ring-white/10"
            />
            <div>
              <p className="font-display text-sm font-bold">{siteConfig.companyName}</p>
              <p className="text-xs text-slate-500">
                B2B cloud consulting · Platform engineering
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
            <button
              type="button"
              onClick={goDashboard}
              className="font-medium text-slate-400 transition hover:text-slate-200"
            >
              Dashboard
            </button>
            <a
              href={`mailto:${siteConfig.contactEmail}`}
              className="font-medium text-slate-400 transition hover:text-slate-200"
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
