import { NavLink } from "react-router-dom";

export default function SidebarItem({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded text-sm
         ${isActive ? "bg-[#393243] text-white" : "text-white/80 hover:bg-[#393243]"}`
      }
    >
      {Icon && <Icon size={18} />}
      <span>{label}</span>
    </NavLink>
  );
}
