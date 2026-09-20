function initialsFromName(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || "??";
}

export default function ClientMonogram({ name, className = "" }) {
  return (
    <span
      className={`client-monogram inline-flex shrink-0 items-center justify-center font-display text-xs font-bold tracking-tight text-navy-800 ${className}`}
      aria-hidden
    >
      {initialsFromName(name)}
    </span>
  );
}
