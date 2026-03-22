import clsx from "clsx";
import BrandLogo from "../branding/BrandLogo";

const shellThemes = {
  listener: "auth-shell-listener",
  artist: "auth-shell-artist",
};

export default function AuthShell({
  theme = "listener",
  nav = null,
  hero = null,
  children,
  footer = null,
  heroCardClassName = "",
  contentClassName = "",
  watermarkSide = "right",
  showHeader = true,
  centerViewport = false,
}) {
  const themeClassName = shellThemes[theme] ?? shellThemes.listener;
  const hasSplitLayout = Boolean(hero);
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const handlePointerMove = (event) => {
    if (event.pointerType === "touch") return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    const topOpacity = 1 - clamp((y - 68) / 18, 0, 1);
    const floorOpacity = clamp((y - 54) / 20, 0, 1);

    event.currentTarget.style.setProperty("--auth-hover-x", `${clamp(x, 0, 100)}%`);
    event.currentTarget.style.setProperty("--auth-hover-y", `${clamp(y, 0, 100)}%`);
    event.currentTarget.style.setProperty("--auth-top-hover-opacity", (topOpacity * 0.9).toFixed(3));
    event.currentTarget.style.setProperty("--auth-floor-hover-opacity", (floorOpacity * 0.82).toFixed(3));
    event.currentTarget.dataset.hover = "true";
  };

  const handlePointerLeave = (event) => {
    event.currentTarget.dataset.hover = "false";
    event.currentTarget.style.setProperty("--auth-top-hover-opacity", "0");
    event.currentTarget.style.setProperty("--auth-floor-hover-opacity", "0");
  };

  return (
    <div
      className={clsx(
        "auth-scroll-shell relative overflow-hidden bg-[#05070a] text-white",
        themeClassName
      )}
      data-hover="false"
      style={{
        "--auth-hover-x": "50%",
        "--auth-hover-y": "50%",
        "--auth-top-hover-opacity": "0",
        "--auth-floor-hover-opacity": "0",
      }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <div className="absolute inset-0 auth-shell-backdrop" />
      <div className="pointer-events-none absolute inset-0 auth-shell-top-grid" />
      <div className="pointer-events-none absolute inset-0 auth-shell-top-grid-hover" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[360px] w-[min(88vw,780px)] -translate-x-1/2 -translate-y-1/2 rounded-full auth-shell-focus-glow md:h-[440px]" />
      <div className="pointer-events-none absolute inset-x-[-10%] bottom-[-34%] h-[54%] auth-shell-floor-grid" />
      <div className="pointer-events-none absolute inset-x-[-10%] bottom-[-34%] h-[54%] auth-shell-floor-grid auth-shell-floor-grid--fine" />
      <div className="pointer-events-none absolute inset-0 auth-shell-floor-hover-stage">
        <div className="absolute inset-x-[-10%] bottom-[-34%] h-[54%] auth-shell-floor-grid auth-shell-floor-grid-hover" />
        <div className="absolute inset-x-[-10%] bottom-[-34%] h-[54%] auth-shell-floor-grid auth-shell-floor-grid--fine auth-shell-floor-grid-hover auth-shell-floor-grid-hover--fine" />
      </div>
      <div className="absolute inset-0 auth-shell-vignette" />
      <div className="absolute inset-0 opacity-[0.08] auth-shell-noise-map" />
      <img
        src="/logo-brand.png"
        alt=""
        className={clsx(
          "pointer-events-none absolute bottom-4 h-28 w-28 select-none opacity-[0.04] grayscale sm:h-32 sm:w-32 lg:h-36 lg:w-36",
          watermarkSide === "left" ? "left-4" : "right-4"
        )}
        draggable="false"
      />

      {centerViewport ? (
        <div className="pointer-events-none fixed inset-0 z-10 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto flex h-full w-full max-w-[1180px] items-center justify-center">
            <div className={clsx("pointer-events-auto mx-auto w-full", contentClassName)}>{children}</div>
          </div>
        </div>
      ) : (
        <div
          className={clsx(
            "auth-shell-frame relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-[1180px] flex-col px-4 sm:px-6 lg:px-8",
            showHeader ? "py-4 sm:py-5 lg:py-6" : "py-0"
          )}
        >
          {showHeader ? (
            <header className="flex items-center justify-between gap-4">
              <BrandLogo className="min-w-0" />
              {nav}
            </header>
          ) : null}

          <main
            className={clsx(
              "auth-shell-main flex flex-1",
              hasSplitLayout ? "items-center" : "items-center justify-center lg:py-0"
            )}
          >
            <div
              className={clsx(
                hasSplitLayout
                  ? "grid w-full gap-5 lg:grid-cols-[minmax(0,1.02fr)_minmax(400px,470px)] lg:items-center xl:gap-8"
                  : "mx-auto w-full",
                contentClassName
              )}
            >
              {hero ? (
                <section className={clsx("auth-hero-card rounded-[28px] p-5 sm:p-6 lg:p-7", heroCardClassName)}>
                  <div
                    className="pointer-events-none absolute -right-14 top-8 h-24 w-24 rounded-full blur-[68px]"
                    style={{ backgroundColor: "rgb(var(--auth-accent-rgb) / 0.16)" }}
                  />
                  <div className="relative">{hero}</div>
                </section>
              ) : null}

              <div className={clsx("w-full", hero ? "lg:justify-self-end" : "lg:col-span-full")}>{children}</div>
            </div>
          </main>

          {footer ? (
            <footer className="hidden items-center justify-between text-[10px] uppercase tracking-[0.22em] text-white/34 xl:flex">
              {footer}
            </footer>
          ) : null}
        </div>
      )}
    </div>
  );
}
