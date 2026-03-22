export default function Section({
  title,
  subtitle,
  action,
  children,
  shellClassName = "",
  surfaceClassName = "",
  headerClassName = "",
  subtitleClassName = "",
  titleClassName = "",
}) {
  return (
    <section className={["user-page-shell space-y-4 p-4 sm:p-6", shellClassName].join(" ")}>
      <div className={["flex items-center justify-between gap-3", headerClassName].join(" ")}>
        <div>
          {subtitle && (
            <p className={["home-section-subtitle user-heading-label mb-1", subtitleClassName].join(" ")}>{subtitle}</p>
          )}
          <h2 className={["home-section-title text-2xl font-extrabold text-white sm:text-3xl", titleClassName].join(" ")}>
            {title}
          </h2>
        </div>

        {action ? <div className="flex items-center gap-2 text-xs text-white/70">{action}</div> : null}
      </div>

      <div className={["user-surface overflow-hidden p-3 sm:p-4", surfaceClassName].join(" ")}>
        <div className="relative">{children}</div>
      </div>
    </section>
  );
}
