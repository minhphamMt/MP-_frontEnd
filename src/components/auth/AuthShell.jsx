import clsx from "clsx";
import BrandLogo from "../branding/BrandLogo";

const shellThemes = {
  listener: "auth-shell-listener",
  artist: "auth-shell-artist",
};

const TUNNEL_VIEWBOX = {
  width: 1600,
  height: 900,
  portalSize: 280,
};

const tunnelLines = (() => {
  const { width, height, portalSize } = TUNNEL_VIEWBOX;
  const innerLeft = (width - portalSize) / 2;
  const innerRight = innerLeft + portalSize;
  const innerTop = (height - portalSize) / 2;
  const innerBottom = innerTop + portalSize;
  const major = [];
  const minor = [];
  const addLine = (x1, y1, x2, y2, isMajor = false) => {
    const target = isMajor ? major : minor;
    target.push({
      x1: Number(x1.toFixed(2)),
      y1: Number(y1.toFixed(2)),
      x2: Number(x2.toFixed(2)),
      y2: Number(y2.toFixed(2)),
    });
  };
  const lerp = (a, b, t) => a + (b - a) * t;

  for (let i = 0; i <= 40; i += 1) {
    const t = i / 40;
    const xOuter = lerp(0, width, t);
    const xInner = lerp(innerLeft, innerRight, t);
    addLine(xOuter, 0, xInner, innerTop, i % 4 === 0);
    addLine(xOuter, height, xInner, innerBottom, i % 4 === 0);
  }

  for (let i = 0; i <= 18; i += 1) {
    const t = i / 18;
    addLine(lerp(0, innerLeft, t), lerp(0, innerTop, t), lerp(width, innerRight, t), lerp(0, innerTop, t), i % 3 === 0);
    addLine(lerp(0, innerLeft, t), lerp(height, innerBottom, t), lerp(width, innerRight, t), lerp(height, innerBottom, t), i % 3 === 0);
  }

  for (let i = 0; i <= 30; i += 1) {
    const t = i / 30;
    addLine(0, lerp(0, height, t), innerLeft, lerp(innerTop, innerBottom, t), i % 3 === 0);
    addLine(width, lerp(0, height, t), innerRight, lerp(innerTop, innerBottom, t), i % 3 === 0);
  }

  for (let i = 0; i <= 14; i += 1) {
    const t = i / 14;
    const xLeft = lerp(0, innerLeft, t);
    const xRight = lerp(width, innerRight, t);
    addLine(xLeft, lerp(0, innerTop, t), xLeft, lerp(height, innerBottom, t), i % 3 === 0);
    addLine(xRight, lerp(0, innerTop, t), xRight, lerp(height, innerBottom, t), i % 3 === 0);
  }

  for (let i = 0; i <= 10; i += 1) {
    const t = i / 10;
    addLine(lerp(innerLeft, innerRight, t), innerTop, lerp(innerLeft, innerRight, t), innerBottom, i % 2 === 0);
    addLine(innerLeft, lerp(innerTop, innerBottom, t), innerRight, lerp(innerTop, innerBottom, t), i % 2 === 0);
  }

  return {
    major,
    minor,
    portal: { innerLeft, innerTop, portalSize },
  };
})();

function TunnelSvg({ hover = false }) {
  const lineClassName = hover ? "auth-tunnel-line auth-tunnel-line--hover" : "auth-tunnel-line";
  const rectClassName = hover ? "auth-tunnel-portal auth-tunnel-portal--hover" : "auth-tunnel-portal";

  return (
    <svg
      className="auth-shell-tunnel-svg"
      viewBox={`0 0 ${TUNNEL_VIEWBOX.width} ${TUNNEL_VIEWBOX.height}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <g className={`${lineClassName} auth-tunnel-line--minor`}>
        {tunnelLines.minor.map((line, index) => (
          <line key={`minor-${hover ? "h" : "b"}-${index}`} {...line} />
        ))}
      </g>
      <g className={`${lineClassName} auth-tunnel-line--major`}>
        {tunnelLines.major.map((line, index) => (
          <line key={`major-${hover ? "h" : "b"}-${index}`} {...line} />
        ))}
      </g>
      <rect
        className={rectClassName}
        x={tunnelLines.portal.innerLeft}
        y={tunnelLines.portal.innerTop}
        width={tunnelLines.portal.portalSize}
        height={tunnelLines.portal.portalSize}
        rx="2"
      />
    </svg>
  );
}

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

    event.currentTarget.style.setProperty("--auth-hover-x", `${clamp(x, 0, 100)}%`);
    event.currentTarget.style.setProperty("--auth-hover-y", `${clamp(y, 0, 100)}%`);
    event.currentTarget.style.setProperty("--auth-hover-opacity", "1");
    event.currentTarget.dataset.hover = "true";
  };

  const handlePointerLeave = (event) => {
    event.currentTarget.dataset.hover = "false";
    event.currentTarget.style.setProperty("--auth-hover-opacity", "0");
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
        "--auth-hover-opacity": "0",
      }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <div className="absolute inset-0 auth-shell-backdrop" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[58%] auth-shell-atmosphere" />
      <div className="pointer-events-none absolute inset-0 auth-shell-tunnel-layer">
        <TunnelSvg />
      </div>
      <div className="pointer-events-none absolute inset-0 auth-shell-tunnel-layer auth-shell-tunnel-layer--hover">
        <TunnelSvg hover />
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
        <div className="pointer-events-none fixed inset-0 z-10 flex items-center justify-center px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6">
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
