import { NavLink } from "react-router-dom";
import {
  Home,
  User,
  Mail,
  Settings
} from "lucide-react";

const menus = [
  {
    label: "Trang chủ",
    icon: Home,
    path: "/dashboard",
  },
  {
    label: "Hồ sơ cá nhân",
    icon: User,
    path: "/dashboard/profile",
  },
  {
    label: "SMTP Config",
    icon: Mail,
    path: "/dashboard/smtp-config",
  },
];

export default function Sidebar({ open }) {
  return (
    <aside
      className={`
        bg-[#008689] text-white
        transition-all duration-300
        ${open ? "w-64" : "w-14"}
        flex flex-col
      `}
    >
      {/* LOGO */}
      <div className="flex items-center gap-3 p-4 border-b border-white/20">
        <span className="text-xl">📄</span>
        {open && <span className="font-semibold">UTH-ConfMS</span>}
      </div>

      {/* MENU */}
      <nav className="flex-1 p-2 space-y-1">
        {menus.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `
                flex items-center gap-3 px-3 py-2 rounded-md text-sm
                hover:bg-white/20 transition
                ${isActive ? "bg-white/30 font-medium" : ""}
              `
              }
            >
              <Icon size={18} />
              {open && item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* FOOTER */}
      {open && (
        <div className="p-4 text-xs text-white/70 border-t border-white/20">
          © {new Date().getFullYear()} UTH
        </div>
      )}
    </aside>
  );
}
