export const siteContent = {
  companyName: "Meridian98",
  heroHeadline: "Enterprise cloud systems, designed to hold up under real load.",
  tagline:
    "Meridian98 partners with B2B and SaaS teams to architect, modernize, and operate cloud platforms that stay dependable as you grow.",
  supportingText:
    "We bring senior engineering judgment to migrations, platform design, and long-running delivery — so your operators inherit clarity, not another layer of fragility.",
  primaryCta: "Start a conversation",
  trustSignals: [
    "Platform engineering",
    "FinOps & data",
    "Regulated B2B",
    "Multi-tenant SaaS",
  ],
  contactEmail: "{{CONTACT_EMAIL}}",
  founders: [
    {
      id: "daniel-smith",
      name: "Daniel Smith",
      role: "Co-Founder",
      bio: "{{BIO}}",
    },
    {
      id: "dante-zuniga",
      name: "Dante Zuniga",
      role: "Co-Founder",
      bio: "{{BIO}}",
    },
  ],
  /*
   * CLIENT COMPANIES — replace placeholders with real customer names.
   * - Drop SVG/PNG logos into `public/logos/` (e.g. `public/logos/acme-corp.svg`).
   * - Set `logoUrl` to `/logos/your-file.svg` (omit to show a monogram from the name).
   * - `projectRef` must match a `projects[].id` with visibility "public".
   * - Optional: `website`, `testimonial` (short quote for the client grid).
   */
  clients: [
    {
      id: "enterprise-client-a",
      name: "Enterprise Client A",
      logoUrl: "",
      industry: "FinTech · B2B",
      projectRef: "atlas-ledger",
      website: "",
      testimonial:
        "Meridian98 delivered a consolidation platform our finance team could run without daily engineering support.",
    },
    {
      id: "enterprise-client-b",
      name: "Enterprise Client B",
      logoUrl: "",
      industry: "Cloud SaaS",
      projectRef: "nimbus-ops",
      website: "",
      testimonial:
        "They unified incidents, deploys, and cost signals into one control plane our SRE org actually adopted.",
    },
    {
      id: "enterprise-client-c",
      name: "Enterprise Client C",
      logoUrl: "",
      industry: "Product-led B2B",
      projectRef: "signal-forge",
      website: "",
      testimonial:
        "The telemetry pipeline now feeds revenue workflows — not another dashboard nobody opens.",
    },
  ],
  projects: [
    {
      id: "atlas-ledger",
      name: "Atlas Ledger",
      clientRef: "enterprise-client-a",
      summary:
        "Multi-entity financial consolidation platform for mid-market B2B operators.",
      tag: "FinOps",
      status: "past",
      visibility: "public",
      url: "https://example.com/atlas-ledger",
    },
    {
      id: "nimbus-ops",
      name: "Nimbus Ops",
      clientRef: "enterprise-client-b",
      summary:
        "Cloud operations control plane unifying incidents, deploys, and cost signals.",
      tag: "DevOps",
      status: "past",
      visibility: "public",
      url: "https://example.com/nimbus-ops",
    },
    {
      id: "signal-forge",
      name: "Signal Forge",
      clientRef: "enterprise-client-c",
      summary:
        "Customer telemetry pipeline that turns product events into revenue workflows.",
      tag: "Data",
      status: "past",
      visibility: "public",
      url: "https://example.com/signal-forge",
    },
    {
      id: "meridian-core",
      name: "Meridian Core",
      summary:
        "Internal platform kernel powering multi-tenant SaaS orchestration at scale.",
      tag: "Platform",
      status: "current",
      visibility: "internal",
      url: "",
    },
    {
      id: "orbit-desk",
      name: "Orbit Desk",
      summary:
        "Enterprise support workspace with SLA routing and private knowledge graphs.",
      tag: "Support",
      status: "current",
      visibility: "internal",
      url: "",
    },
    {
      id: "pulse-relay",
      name: "Pulse Relay",
      summary:
        "Realtime event bus product line transitioned after acquisition integration.",
      tag: "Infra",
      status: "sold",
      visibility: "internal",
      url: "",
    },
    {
      id: "harbor-kit",
      name: "Harbor Kit",
      summary:
        "Legacy onboarding toolkit discontinued in favor of Meridian Core modules.",
      tag: "Legacy",
      status: "discontinued",
      visibility: "internal",
      url: "",
    },
  ],
};

/** @param {typeof siteContent.clients} clients */
export function clientById(clients, id) {
  if (!id) return undefined;
  return clients.find((c) => c.id === id);
}

/** Clients linked to public-facing shipped work */
export function publicClients(site = siteContent) {
  const publicProjectIds = new Set(
    site.projects
      .filter((p) => p.visibility === "public" && p.status === "past")
      .map((p) => p.id)
  );
  return site.clients.filter((c) => publicProjectIds.has(c.projectRef));
}

export default siteContent;
