import { NavLink } from "react-router-dom";
import {
  Home,
  User,
  Mail,
  Settings,
  Building2,
  Users,
  Calendar,
  FileText,
  Activity,
  LayoutDashboard
} from "lucide-react";
import { useAuthStore } from "../app/store/useAuthStore";

export default function Sidebar({ open }) {
  const { user, role } = useAuthStore();

  const userRoles = user?.role_names || [role];
  const isAdmin = userRoles.some(r => ["admin", "chair"].includes(r.toLowerCase()));
  const isAuthor = userRoles.some(r => ["author", "authors"].includes(r.toLowerCase()));

  const menus = [];

  if (isAuthor) {
    menus.push({
      label: "Tổng quan Author",
      icon: LayoutDashboard,
      path: "/dashboard/overview",
    });
  }

  menus.push({
    label: "Hồ sơ cá nhân",
    icon: User,
    path: "/dashboard/profile",
  });

  // Admin/Chair menus
  const adminMenus = [
    {
      label: "Quản lý Hội nghị",
      icon: Calendar,
      path: "/dashboard/chair/conferences",
    },
    {
      label: "Quản lý Đơn vị",
      icon: Building2,
      path: "/dashboard/admin/tenants",
    },
    {
      label: "Quản lý User",
      icon: Users,
      path: "/dashboard/admin/users",
    },
    {
      label: "SMTP & Hệ thống",
      icon: Mail,
      path: "/dashboard/smtp-config",
    },
    {
      label: "Audit Logs",
      icon: Activity,
      path: "/dashboard/audit-logs",
    },
  ];

  const currentMenus = isAdmin ? [...menus, ...adminMenus] : menus;

  return (
    <aside
      className={`
        bg-[#008689] text-white
        transition-all duration-300
        ${open ? "w-64" : "w-16"}
        flex flex-col
        sticky top-0 h-screen
      `}
    >
      {/* LOGO */}
      <div className="flex items-center gap-3 p-4 border-b border-white/10 h-16">
        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-[#008689] font-bold">
          U
        </div>
        {open && <span className="font-bold tracking-wider text-lg">UTH-ConfMS</span>}
      </div>

      {/* MENU */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {currentMenus.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm
                transition-all duration-200 group
                ${isActive
                  ? "bg-white text-[#008689] font-bold shadow-lg"
                  : "hover:bg-white/10 text-white/80 hover:text-white"}
              `
              }
            >
              <Icon size={20} className={`${open ? "" : "mx-auto"}`} />
              {open && <span>{item.label}</span>}
              {!open && (
                <div className="absolute left-16 bg-[#008689] px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl border border-white/10">
                  {item.label}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* FOOTER */}
      {open && (
        <div className="p-4 text-[10px] text-white/40 border-t border-white/5 uppercase tracking-widest font-bold">
          UTH Conference Management © {new Date().getFullYear()}
        </div>
      )}
    </aside>
  );
}
