import { NavLink } from "react-router-dom";

export default function SidebarItem({ to, icon: Icon, label, end = false }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        [
          "group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200",
          " hover:bg-white/5",
          isActive
            ? [
                "border border-cyan-400/30",
                "bg-gradient-to-r from-cyan-400/15 via-violet-400/10 to-transparent",
                "text-white",
                "shadow-[0_12px_40px_rgba(56,189,248,0.25)]",
              ].join(" ")
            : "border border-transparent text-white/75",
        ].join(" ")
      }
    >
      {/* Accent line khi active */}
      <span
        className={`
          absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-full
          bg-gradient-to-b from-cyan-300 to-violet-400
          opacity-0 transition
          group-[.active]:opacity-100
        `}
      />

      {/* Icon */}
      {Icon && (
        <span
          className={`
            relative flex h-9 w-9 items-center justify-center rounded-lg
            bg-white/5 text-white/80 transition
            group-hover:bg-white/10
            group-[.active]:bg-gradient-to-br
            group-[.active]:from-cyan-400/30
            group-[.active]:to-violet-400/30
            group-[.active]:text-white
            group-[.active]:shadow-[0_0_14px_rgba(56,189,248,0.45)]
          `}
        >
          <Icon size={18} />
        </span>
      )}

      {/* Label */}
      <span className="truncate tracking-tight">{label}</span>
    </NavLink>
  );
}
