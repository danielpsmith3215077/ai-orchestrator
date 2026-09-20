/** InspoAI B2B Trust Blue — https://www.inspoai.io/blogs/best-color-palette-for-saas-website */
export const brandTheme = {
  name: "B2B Trust Blue",
  rationale:
    "InspoAI recommends blue for trust, light slate neutrals for readability, and a contrasting amber accent reserved for CTAs — ideal for enterprise B2B SaaS consulting.",
  colors: {
    primary: "#1E40AF",
    primaryBright: "#2563EB",
    accent: "#F59E0B",
    accentHover: "#D97706",
    background: "#F8FAFC",
    surface: "#FFFFFF",
    ink: "#0F172A",
    body: "#475569",
    muted: "#64748B",
    border: "#CBD5E1",
    footer: "#0F172A",
  },
};

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
      id: "medstock",
      name: "MedStock",
      logoUrl: "",
      industry: "Healthcare · Inventory",
      projectRef: "medstock",
      website: "https://medstock.it/en/",
      testimonial:
        "Operators can finally see stock and compliance status in one place without chasing spreadsheets.",
    },
    {
      id: "hydroiq",
      name: "HydroIQ",
      logoUrl: "",
      industry: "Utilities · IoT",
      projectRef: "hydroiq",
      website: "https://www.hydroiq.co.ke/",
      testimonial:
        "Metering, billing, and alerts finally share a single operational picture our field teams trust.",
    },
    {
      id: "pizza-barn",
      name: "Pizza Barn",
      logoUrl: "",
      industry: "Hospitality · Web",
      projectRef: "pizza-barn",
      website: "https://pizzabarnprinceton.com/",
      testimonial:
        "The site makes ordering and events obvious — guests find what they need without calling the front desk.",
    },
  ],
  /*
   * TECH STACK — languages, frameworks, and platforms Meridian98 delivers with.
   * Add or remove items under each category; `badge` is optional (defaults to initials).
   * `marqueeItems` powers the scrolling strip — keep a flat list of flagship names.
   */
  techStack: {
    kicker: "Capabilities",
    title: "Languages & platforms we build with",
    subtitle:
      "Modern stack coverage for B2B SaaS consulting — production languages, frameworks, and cloud tooling teams ask for on day one.",
    marqueeItems: [
      "TypeScript",
      "Python",
      "Go",
      "React",
      "Next.js",
      "Node.js",
      "PostgreSQL",
      "AWS",
      "Kubernetes",
      "Terraform",
      "FastAPI",
      "Django",
      ".NET",
      "Rust",
      "GraphQL",
      "Docker",
    ],
    categories: [
      {
        id: "languages",
        label: "Languages",
        items: [
          { name: "TypeScript", badge: "TS" },
          { name: "JavaScript", badge: "JS" },
          { name: "Python", badge: "Py" },
          { name: "Go", badge: "Go" },
          { name: "Rust", badge: "Rs" },
          { name: "Java", badge: "Jv" },
          { name: "C#", badge: "C#" },
          { name: "C++", badge: "C++" },
          { name: "Ruby", badge: "Rb" },
          { name: "PHP", badge: "PHP" },
          { name: "Swift", badge: "Sw" },
          { name: "Kotlin", badge: "Kt" },
          { name: "Dart", badge: "Dt" },
          { name: "SQL", badge: "SQL" },
        ],
      },
      {
        id: "frontend",
        label: "Frontend",
        items: [
          { name: "React", badge: "Re" },
          { name: "Next.js", badge: "Nx" },
          { name: "Vue", badge: "Vu" },
          { name: "Nuxt", badge: "Nu" },
          { name: "Angular", badge: "Ng" },
          { name: "Svelte", badge: "Sv" },
          { name: "SvelteKit", badge: "SK" },
          { name: "Tailwind CSS", badge: "Tw" },
          { name: "Vite", badge: "Vi" },
          { name: "React Native", badge: "RN" },
          { name: "Flutter", badge: "Fl" },
        ],
      },
      {
        id: "backend",
        label: "Backend",
        items: [
          { name: "Node.js", badge: "Nd" },
          { name: "FastAPI", badge: "FA" },
          { name: "Django", badge: "Dj" },
          { name: "Flask", badge: "Fl" },
          { name: "Rails", badge: "Rl" },
          { name: ".NET", badge: "NET" },
          { name: "Spring Boot", badge: "Sp" },
          { name: "Express", badge: "Ex" },
          { name: "NestJS", badge: "Ne" },
          { name: "GraphQL", badge: "GQL" },
          { name: "gRPC", badge: "RPC" },
        ],
      },
      {
        id: "mobile",
        label: "Mobile",
        items: [
          { name: "Swift / iOS", badge: "iOS" },
          { name: "Kotlin / Android", badge: "And" },
          { name: "React Native", badge: "RN" },
          { name: "Flutter", badge: "Fl" },
          { name: "Expo", badge: "Ex" },
        ],
      },
      {
        id: "data-ml",
        label: "Data & ML",
        items: [
          { name: "PostgreSQL", badge: "PG" },
          { name: "dbt", badge: "dbt" },
          { name: "Apache Spark", badge: "Sp" },
          { name: "Kafka", badge: "Kf" },
          { name: "Airflow", badge: "Af" },
          { name: "Snowflake", badge: "Sn" },
          { name: "BigQuery", badge: "BQ" },
          { name: "Redis", badge: "Rd" },
          { name: "Elasticsearch", badge: "ES" },
          { name: "PyTorch", badge: "Pt" },
          { name: "OpenAI APIs", badge: "AI" },
        ],
      },
      {
        id: "cloud-devops",
        label: "Cloud & DevOps",
        items: [
          { name: "AWS", badge: "AWS" },
          { name: "Google Cloud", badge: "GCP" },
          { name: "Azure", badge: "Az" },
          { name: "Docker", badge: "Dk" },
          { name: "Kubernetes", badge: "K8s" },
          { name: "Terraform", badge: "Tf" },
          { name: "Pulumi", badge: "Pl" },
          { name: "GitHub Actions", badge: "GH" },
          { name: "Argo CD", badge: "Ar" },
          { name: "Datadog", badge: "DD" },
          { name: "Prometheus", badge: "Pr" },
        ],
      },
      {
        id: "databases",
        label: "Databases",
        items: [
          { name: "PostgreSQL", badge: "PG" },
          { name: "MySQL", badge: "My" },
          { name: "MongoDB", badge: "Mg" },
          { name: "DynamoDB", badge: "Dy" },
          { name: "Redis", badge: "Rd" },
          { name: "CockroachDB", badge: "Cr" },
          { name: "PlanetScale", badge: "PS" },
        ],
      },
      {
        id: "tools",
        label: "Tools & workflow",
        items: [
          { name: "Git", badge: "Git" },
          { name: "Cursor", badge: "Cu" },
          { name: "Figma", badge: "Fi" },
          { name: "Linear", badge: "Ln" },
          { name: "Notion", badge: "No" },
          { name: "Stripe", badge: "St" },
          { name: "Auth0", badge: "A0" },
          { name: "Vercel", badge: "Vc" },
        ],
      },
    ],
  },
  projects: [
    {
      id: "medstock",
      name: "MedStock",
      clientRef: "medstock",
      summary:
        "Cloud inventory for regulated medical supplies — scan, track lots, and keep compliance-ready records without the spreadsheet chase.",
      tag: "Healthcare",
      status: "past",
      visibility: "public",
      url: "https://medstock.it/en/",
      imageUrl: "/platforms/medstock-live.png",
      imageCaption: "Public product surface",
    },
    {
      id: "hydroiq",
      name: "HydroIQ",
      clientRef: "hydroiq",
      summary:
        "Water network visibility for utilities and operators — metering signals, billing workflows, and leak alerts in one operational view.",
      tag: "IoT",
      status: "past",
      visibility: "public",
      url: "https://www.hydroiq.co.ke/",
      imageUrl: "/platforms/hydroiq-live.png",
      imageCaption: "Public product surface",
    },
    {
      id: "pizza-barn",
      name: "Pizza Barn website",
      clientRef: "pizza-barn",
      summary:
        "A hospitality site built for guests first — menu, ordering paths, and local events without burying the brand under booking widgets.",
      tag: "Web",
      status: "past",
      visibility: "public",
      url: "https://pizzabarnprinceton.com/",
      imageUrl: "/platforms/pizza-barn-live.png",
      imageCaption: "Public product surface",
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
