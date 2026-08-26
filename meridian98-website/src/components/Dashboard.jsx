import { useMemo, useState } from "react";

/**
 * Dashboard authentication
 * Prefer VITE_DASHBOARD_PASSWORD from the environment.
 * Fallback is intentional for local demos only — rotate before any production deploy.
 */
const DASHBOARD_PASSWORD =
  import.meta.env.VITE_DASHBOARD_PASSWORD || "meridianAdmin98";

const TABS = [
  { id: "current", label: "Current" },
  { id: "past", label: "Past" },
  { id: "sold", label: "Sold" },
  { id: "analytics", label: "Analytics Hub" },
];

function statusClass(status) {
  switch (status) {
    case "current":
      return "status-current";
    case "past":
      return "status-past";
    case "sold":
      return "status-sold";
    case "discontinued":
      return "status-discontinued";
    default:
      return "status-past";
  }
}

function filterProjects(projects, tab) {
  if (tab === "current") {
    return projects.filter((p) => p.status === "current");
  }
  if (tab === "past") {
    return projects.filter((p) => p.status === "past");
  }
  if (tab === "sold") {
    return projects.filter(
      (p) => p.status === "sold" || p.status === "discontinued"
    );
  }
  return [];
}

export default function Dashboard({ siteConfig, onExit }) {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [tab, setTab] = useState("current");

  const matrix = useMemo(
    () => filterProjects(siteConfig.projects, tab),
    [siteConfig.projects, tab]
  );

  const handleSubmit = (event) => {
    event.preventDefault();
    if (password === DASHBOARD_PASSWORD) {
      setAuthed(true);
      setError("");
      setPassword("");
      return;
    }
    setError("Access denied. Check the dashboard credential and try again.");
  };

  if (!authed) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#030712] text-slate-50">
        <div className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-40" />
        <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-indigo-500/30 blur-3xl animate-glow-orb" />
        <div className="pointer-events-none absolute -right-16 bottom-10 h-80 w-80 rounded-full bg-teal-400/20 blur-3xl animate-glow-orb" />

        <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center px-6 py-16">
          <div className="cinematic-glow-card rounded-3xl p-8 sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-300">
              Private route
            </p>
            <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-gradient">
              Meridian98 Dashboard
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              Enter the operator password to unlock internal project telemetry,
              lifecycle matrices, and the analytics compile slot.
            </p>

            <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
              <label className="block text-sm font-medium text-slate-300">
                Password
                <input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-700/80 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none ring-indigo-400/40 transition focus:ring-2"
                  placeholder="••••••••••••"
                  required
                />
              </label>
              {error ? (
                <p className="text-sm text-rose-300" role="alert">
                  {error}
                </p>
              ) : null}
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-teal-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110"
              >
                Unlock Dashboard
              </button>
            </form>

            <button
              type="button"
              onClick={onExit}
              className="mt-5 text-sm font-medium text-slate-400 transition hover:text-slate-200"
            >
              ← Back to marketing site
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#030712] text-slate-50">
      <div className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-30" />
      <div className="pointer-events-none absolute left-1/4 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-indigo-500/20 blur-3xl animate-glow-orb" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-teal-400/15 blur-3xl animate-glow-orb" />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-8 sm:py-10">
        <header className="glass-panel flex flex-col gap-4 rounded-2xl px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300/90">
                Live session
              </p>
              <h1 className="font-display text-xl font-bold tracking-tight sm:text-2xl">
                {siteConfig.companyName} Control Plane
              </h1>
            </div>
          </div>
          <button
            type="button"
            onClick={onExit}
            className="rounded-full border border-slate-600/80 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-400 hover:bg-slate-900/60"
          >
            Exit Dashboard
          </button>
        </header>

        <nav
          className="mt-6 flex flex-wrap gap-2"
          aria-label="Dashboard sections"
        >
          {TABS.map((item) => {
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  active
                    ? "bg-indigo-500 text-white shadow-glow"
                    : "border border-slate-700/80 bg-slate-950/40 text-slate-300 hover:border-slate-500"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        <section className="mt-8">
          {tab === "analytics" ? (
            <div className="cinematic-glow-card rounded-3xl p-8 sm:p-10">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-300">
                Analytics Hub
              </p>
              <h2 className="mt-3 font-display text-2xl font-bold tracking-tight sm:text-3xl">
                Telemetry compile slot
              </h2>
              <div className="mt-6 rounded-2xl border border-dashed border-indigo-400/40 bg-slate-950/50 p-6 font-mono text-sm leading-relaxed text-indigo-100">
                STATUS: {"{{ANALYTICS_SCRIPT}}"} COMPILE SLOT ACTIVE — INBOUND
                TELEMETRY IDLE.
              </div>
              <p className="mt-4 max-w-2xl text-sm text-slate-400">
                Wire production analytics into the compile slot when ready. Until
                then, this hub remains a guarded placeholder for inbound
                telemetry streams.
              </p>
            </div>
          ) : (
            <div>
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                    Project matrix
                  </p>
                  <h2 className="mt-2 font-display text-2xl font-bold tracking-tight">
                    {TABS.find((t) => t.id === tab)?.label} portfolio
                  </h2>
                </div>
                <p className="text-sm text-slate-500">{matrix.length} systems</p>
              </div>

              <div className="grid gap-4">
                {matrix.map((project) => (
                  <article
                    key={project.id}
                    className="cinematic-glow-card rounded-2xl p-5 sm:p-6"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-display text-lg font-bold tracking-tight">
                            {project.name}
                          </h3>
                          <span className="rounded-full border border-slate-600/70 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-slate-300">
                            {project.tag}
                          </span>
                        </div>
                        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-400">
                          {project.summary}
                        </p>
                      </div>
                      <span
                        className={`inline-flex shrink-0 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${statusClass(
                          project.status
                        )}`}
                      >
                        {project.status}
                      </span>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span>visibility: {project.visibility}</span>
                      <span>id: {project.id}</span>
                      {project.url ? (
                        <a
                          href={project.url}
                          className="font-medium text-indigo-300 hover:text-indigo-200"
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open reference →
                        </a>
                      ) : (
                        <span>No public URL</span>
                      )}
                    </div>
                  </article>
                ))}
                {matrix.length === 0 ? (
                  <div className="glass-panel rounded-2xl p-8 text-sm text-slate-400">
                    No projects in this lane.
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
