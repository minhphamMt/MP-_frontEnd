export default function Section({ title, subtitle, action, children }) {
  return (
    <section className="relative space-y-4">
      {/* Header */}
      <div className="relative flex items-center justify-between gap-3">
        <div className="pointer-events-none absolute -inset-x-4 -top-4 h-16 bg-[radial-gradient(circle_at_20%_50%,rgba(34,197,94,0.12),transparent_55%)]" />

        <div className="relative">
          {subtitle && (
            <p className="mb-1 text-[11px] uppercase tracking-[0.25em] text-white/50">
              {subtitle}
            </p>
          )}

          <div className="flex items-center gap-3">
            {/* Accent bar */}
            <div className="h-8 w-1 rounded-full bg-gradient-to-b from-emerald-300 via-emerald-400 to-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.55)]" />
             <h2 className="text-xl font-bold text-white drop-shadow-sm sm:text-2xl">
              {title}
            </h2>
          </div>
        </div>

        {action ? (
          <div className="relative flex items-center gap-2 text-xs text-white/70">
            {action}
          </div>
        ) : null}
      </div>

      {/* Content */}
      <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#181818] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.45)] transition">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(34,197,94,0.08),transparent_45%)]" />

        <div className="relative">{children}</div>
      </div>
    </section>
  );
}