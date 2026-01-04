import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import SidebarDashboard from "../../features/dashboard/SidebarDashboard";
const sidebarMenus = {
  admin: [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Users", path: "/dashboard/users" },
    { label: "Conferences", path: "/dashboard/conferences" },
  ],
  authors: [
    { label: "Overview", path: "/dashboard/my-conferences" },
    { label: "My Submisstions", path: "/dashboard/my-submissions" },
  ],
  reviewer: [
    { label: "Assigned Reviews", path: "/dashboard/reviews" },
  ],
  chair: [
    { label: "Manage Submissions", path: "/dashboard/manage-submissions" },
    { label: "Manage Reviews", path: "/dashboard/manage-reviews" },
  ],
};

export default function DashboardLayout() {
  const [open, setOpen] = useState(true);
  const location = useLocation();

  const { user, isAuthenticated, isCheckingAuth, checkAuth, role } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) {
    return (
      <div className="h-screen flex items-center justify-center">
        Đang xác thực đăng nhập...
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const menus = sidebarMenus[role] || [];

  return (
    <div className="flex min-h-screen">
      {/* SIDEBAR */}
      <aside
        className={`text-white transition-all duration-300 flex-shrink-0 ${open ? "w-64" : "w-14"}`}
        style={{ backgroundColor: "rgb(0, 134, 137)" }}
      >
        <div className="flex items-center gap-3 p-4 border-b border-white/10">
          <button onClick={() => setOpen(!open)} className="text-xl">☰</button>
          {open && <span className="font-semibold">UTH-ConfMS</span>}
        </div>

        <div className={`p-2 ${open ? "" : "hidden"}`}>
          {menus.map((menu) => (
            <a
              key={menu.path}
              href={menu.path}
              className={`block px-4 py-2 rounded hover:bg-white/10 ${
                location.pathname === menu.path ? "bg-white/20" : ""
              }`}
            >
              {menu.label}
            </a>
          ))}
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
