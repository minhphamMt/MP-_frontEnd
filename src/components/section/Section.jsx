export default function Section({ title, subtitle, action, children }) {
  return (
    <section className="user-page-shell space-y-4 p-4 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          {subtitle && <p className="user-heading-label mb-1">{subtitle}</p>}
          <h2 className="text-2xl font-extrabold text-white sm:text-3xl">{title}</h2>
        </div>

        {action ? <div className="flex items-center gap-2 text-xs text-white/70">{action}</div> : null}
      </div>

      <div className="user-surface overflow-hidden p-3 sm:p-4">
        <div className="relative">{children}</div>
      </div>
    </section>
  );
}
