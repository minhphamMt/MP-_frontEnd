export default function Section({ title, subtitle, action, children }) {
  return (
    <section className="relative space-y-4">
      {/* Header */}
      <div className="relative flex items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="relative">
          {subtitle && (
            <p className="mb-1 text-[11px] uppercase tracking-[0.35em] text-white/50">
              {subtitle}
            </p>
          )}

          <h2 className="text-xl font-semibold text-white sm:text-2xl">
            {title}
          </h2>
        </div>

        {action ? (
          <div className="relative flex items-center gap-2 text-xs text-white/70">
            {action}
          </div>
        ) : null}
      </div>

      {/* Content */}
      <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#181818] p-4 transition hover:bg-[#242424]">
        <div className="relative">{children}</div>
      </div>
    </section>
  );
}