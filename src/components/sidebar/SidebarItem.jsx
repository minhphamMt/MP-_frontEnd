import { NavLink } from "react-router-dom";

export default function SidebarItem({ to, icon: Icon, label, end = false }) {
  return (
    <NavLink to={to} end={end}>
      {({ isActive }) => (
        <div
          className={[
            "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
            isActive
              ? "border border-[#1db954]/80 bg-[#1db954] text-[#041409] shadow-[0_10px_26px_rgba(29,185,84,0.3)]"
              : "border border-transparent text-white/75 md:hover:border-white/15 md:hover:bg-[#1a1a1a] md:hover:text-white",
          ].join(" ")}
        >
          {Icon && (
            <span
              className={[
                "relative flex h-9 w-9 items-center justify-center rounded-lg border transition",
                isActive
                  ? "border-[#0f8f3f]/45 bg-[#1ed760] text-[#03200e]"
                  : "border-white/10 bg-[#181818] text-white/80 md:group-hover:border-white/20 md:group-hover:bg-[#222222]",
              ].join(" ")}
            >
              <Icon size={18} />
            </span>
          )}

          <span className="truncate tracking-tight">{label}</span>
        </div>
      )}
    </NavLink>
  );
}
