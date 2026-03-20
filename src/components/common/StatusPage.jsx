import { Link } from "react-router-dom";
import BrandLogo from "../branding/BrandLogo";

function StatusAction({ action, variant = "primary" }) {
  if (!action) return null;

  const Icon = action.icon;
  const baseClassName =
    "inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition duration-200";
  const variantClassName =
    variant === "primary"
      ? "border border-emerald-300/30 bg-emerald-400 text-[#041108] shadow-[0_18px_40px_rgba(16,185,129,0.18)] hover:border-emerald-200/50 hover:bg-emerald-300"
      : "border border-white/12 bg-white/[0.04] text-white/86 hover:border-white/20 hover:bg-white/[0.08]";
  const className = `${baseClassName} ${variantClassName}`;

  const content = (
    <>
      {Icon ? <Icon className="text-[18px]" aria-hidden="true" /> : null}
      <span>{action.label}</span>
    </>
  );

  if (action.to) {
    return (
      <Link to={action.to} replace={action.replace} state={action.state} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={action.onClick} className={className}>
      {content}
    </button>
  );
}

export default function StatusPage({
  code,
  badge,
  title,
  description,
  insights = [],
  primaryAction,
  secondaryAction,
  panelLabel,
  panelTitle,
  panelDescription,
  contextLabel,
  contextValue,
}) {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-10rem)] w-full max-w-6xl items-center justify-center py-4 sm:py-8 lg:py-10">
      <section className="relative w-full overflow-hidden rounded-[30px] border border-white/10 bg-[#050505] px-5 py-6 shadow-[0_30px_90px_rgba(0,0,0,0.55)] sm:px-7 sm:py-8 lg:px-10 lg:py-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(29,185,84,0.2),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.14),transparent_38%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />

        <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.92fr)] lg:items-center">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/18 bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.26em] text-emerald-200/84">
              <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_14px_rgba(110,231,183,0.8)]" />
              {badge}
            </div>

            <h1 className="mt-5 text-3xl font-black tracking-[-0.04em] text-white sm:text-4xl lg:text-5xl">
              {title}
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/66 sm:text-base">
              {description}
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <StatusAction action={primaryAction} variant="primary" />
              <StatusAction action={secondaryAction} variant="secondary" />
            </div>

            {insights.length ? (
              <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {insights.map((insight) => (
                  <div
                    key={insight}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-white/68"
                  >
                    {insight}
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.03] p-5 sm:p-6 lg:p-7">
            <div className="flex items-center justify-between gap-4">
              <BrandLogo compact />
              <div className="inline-flex rounded-full border border-white/10 bg-black/25 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/52">
                {panelLabel}
              </div>
            </div>

            <div className="mt-6 rounded-[24px] border border-emerald-400/16 bg-[#040404] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] sm:p-6">
              <div className="text-[11px] font-semibold uppercase tracking-[0.34em] text-emerald-300/68">
                Error state
              </div>
              <div className="mt-3 text-6xl font-black tracking-[-0.1em] text-white sm:text-7xl">
                {code}
              </div>
              <div className="mt-4 h-px w-full bg-gradient-to-r from-emerald-400/45 via-cyan-400/16 to-transparent" />

              <div className="mt-5 space-y-3">
                <h2 className="text-xl font-semibold text-white">{panelTitle}</h2>
                <p className="text-sm leading-7 text-white/62">{panelDescription}</p>
              </div>

              {contextValue ? (
                <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.26em] text-white/42">
                    {contextLabel}
                  </div>
                  <div className="mt-2 break-all text-sm font-medium text-white/78">
                    {contextValue}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
