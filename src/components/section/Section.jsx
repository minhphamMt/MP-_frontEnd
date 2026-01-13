export default function Section({ title, subtitle, action, children }) {
  return (
    <section className="relative space-y-4">
      {/* Header */}
      <div className="relative flex items-center justify-between gap-3">
        <div className="relative">
          {subtitle && (
            <p className="mb-1 text-[11px] uppercase tracking-[0.25em] text-white/50">
              {subtitle}
            </p>
          )}

          <div className="flex items-center gap-3">
            {/* Accent bar */}
            <div className="h-7 w-1 rounded-full bg-[#1db954]" />
            <h2 className="text-xl font-bold text-white sm:text-2xl">
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
      <div className="relative overflow-hidden rounded-2xl border border-[#242424] bg-[#181818] p-4 shadow-[0_18px_50px_rgba(0,0,0,0.35)] transition">
        <div className="relative">{children}</div>
      </div>
    </section>
  );
}