import { NavLink } from "react-router-dom";

export default function SidebarItem({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition hover:-translate-y-[1px] hover:border-white/20 hover:bg-white/5 ${
          isActive
            ? "border border-white/20 bg-gradient-to-r from-cyan-400/10 to-violet-400/10 text-white shadow-[0_12px_30px_rgba(0,0,0,0.35)]"
            : "border border-transparent text-white/80"
        }`
      }
    >
      {Icon && (
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-lg text-white/80">
          <Icon size={18} />
        </span>
      )}
      <span className="font-semibold tracking-tight">{label}</span>
    </NavLink>
  );
}