import { NavLink } from "react-router-dom";

export default function SidebarItem({
  to,
  icon: Icon,
  label,
  end = false,
  collapsed = false,
  tone = "default",
}) {
  const isArtistTone = tone === "artist";

  return (
    <NavLink
      to={to}
      end={end}
      title={collapsed ? label : undefined}
      aria-label={label}
      className="block"
    >
      {({ isActive }) => {
        const itemClassName = isActive
          ? isArtistTone
            ? "border border-transparent bg-[#84bee8] text-[#07111d] shadow-[0_12px_30px_rgba(132,190,232,0.22)]"
            : "border border-[#1db954]/80 bg-[#1db954] text-[#041409] shadow-[0_10px_26px_rgba(29,185,84,0.3)]"
          : isArtistTone
            ? "border border-transparent text-slate-100/78 md:hover:border-sky-200/[0.14] md:hover:bg-[#18253a] md:hover:text-white"
            : "border border-transparent text-white/75 md:hover:border-white/15 md:hover:bg-[#1a1a1a] md:hover:text-white";
        const iconClassName = isActive
          ? isArtistTone
            ? "border-sky-300/14 bg-[#dcecf9] text-[#123459]"
            : "border-[#0f8f3f]/45 bg-[#1ed760] text-[#03200e]"
          : isArtistTone
            ? "border-sky-200/[0.1] bg-[#152133] text-slate-100/80 md:group-hover/sidebar-item:border-sky-200/[0.18] md:group-hover/sidebar-item:bg-[#1d2c45]"
            : "border-white/10 bg-[#181818] text-white/80 md:group-hover/sidebar-item:border-white/20 md:group-hover/sidebar-item:bg-[#222222]";
        const tooltipClassName = isArtistTone
          ? "pointer-events-none absolute left-[calc(100%+12px)] top-1/2 z-[70] hidden -translate-y-1/2 whitespace-nowrap rounded-xl border border-sky-200/[0.12] bg-[#101a2c]/96 px-3 py-2 text-xs font-semibold text-white opacity-0 shadow-[0_12px_30px_rgba(2,6,18,0.35)] backdrop-blur transition duration-200 lg:block md:translate-x-2 md:group-hover/sidebar-item:translate-x-0 md:group-hover/sidebar-item:opacity-100"
          : "pointer-events-none absolute left-[calc(100%+12px)] top-1/2 z-[70] hidden -translate-y-1/2 whitespace-nowrap rounded-xl border border-white/12 bg-[#111111]/95 px-3 py-2 text-xs font-semibold text-white opacity-0 shadow-[0_12px_30px_rgba(0,0,0,0.35)] backdrop-blur transition duration-200 lg:block md:translate-x-2 md:group-hover/sidebar-item:translate-x-0 md:group-hover/sidebar-item:opacity-100";

        return (
          <div className="group/sidebar-item relative">
            <div
              className={[
                "relative flex items-center rounded-xl text-sm font-medium transition-all duration-200",
                collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5",
                itemClassName,
              ].join(" ")}
            >
              {Icon ? (
                <span
                  className={[
                    `relative flex ${collapsed ? "h-10 w-10 rounded-xl" : "h-9 w-9 rounded-lg"} items-center justify-center border transition`,
                    iconClassName,
                  ].join(" ")}
                >
                  <Icon size={18} />
                </span>
              ) : null}

              <span className={collapsed ? "sr-only" : "truncate tracking-tight"}>{label}</span>
            </div>

            {collapsed ? <div className={tooltipClassName}>{label}</div> : null}
          </div>
        );
      }}
    </NavLink>
  );
}
