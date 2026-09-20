import FadeInSection from "./FadeInSection";
import ClientMonogram from "./ClientMonogram";

export default function TrustedByStrip({ clients = [] }) {
  if (!clients.length) return null;

  return (
    <FadeInSection className="relative mx-auto w-full max-w-6xl px-6 pb-6 pt-2">
      <p className="mb-5 text-center text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
        Trusted by teams we have shipped for
      </p>
      <ul className="trusted-by-strip flex flex-wrap items-center justify-center gap-3 sm:gap-4">
        {clients.map((client) => {
          const inner = (
            <>
              {client.logoUrl ? (
                <img
                  src={client.logoUrl}
                  alt=""
                  className="h-7 max-w-[120px] object-contain opacity-80 grayscale transition group-hover:opacity-100 group-hover:grayscale-0"
                />
              ) : (
                <ClientMonogram name={client.name} className="h-9 w-9 text-[11px]" />
              )}
              <span className="font-display text-sm font-semibold tracking-tight text-slate-700 transition group-hover:text-navy-950">
                {client.name}
              </span>
            </>
          );

          const className =
            "trusted-by-item group flex items-center gap-2.5 rounded-2xl px-4 py-2.5 no-underline transition";

          if (client.website) {
            return (
              <li key={client.id}>
                <a
                  href={client.website}
                  target="_blank"
                  rel="noreferrer"
                  className={className}
                  aria-label={`${client.name} (opens in new tab)`}
                >
                  {inner}
                </a>
              </li>
            );
          }

          return (
            <li key={client.id}>
              <div className={className}>{inner}</div>
            </li>
          );
        })}
      </ul>
    </FadeInSection>
  );
}
