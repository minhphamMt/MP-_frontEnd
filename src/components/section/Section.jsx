export default function Section({ title, subtitle, action, children }) {
  return (
    <section className="relative space-y-4">
      {/* Header */}
      <div className="relative flex items-center justify-between gap-3">
        {/* Glow nền nhẹ */}
        <div className="pointer-events-none absolute -inset-x-4 -top-4 h-20 bg-[radial-gradient(circle_at_20%_50%,rgba(167,139,250,0.18),transparent_55%)]" />

        <div className="relative">
          {subtitle && (
            <p className="mb-1 text-[11px] uppercase tracking-[0.25em] text-white/50">
              {subtitle}
            </p>
          )}

          <div className="flex items-center gap-3">
            {/* Accent bar */}
            <div className="h-8 w-1 rounded-full bg-gradient-to-b from-violet-400 via-fuchsia-400 to-cyan-300 shadow-[0_0_14px_rgba(56,189,248,0.55)]" />
            <h2 className="text-2xl font-bold text-white drop-shadow-sm">
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
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/6 via-white/3 to-white/6 p-4 shadow-[0_25px_70px_rgba(0,0,0,0.5)] backdrop-blur-md transition">
        {/* Inner glow */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(56,189,248,0.12),transparent_45%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_10%,rgba(167,139,250,0.12),transparent_45%)]" />

        <div className="relative">{children}</div>
      </div>
    </section>
  );
}
