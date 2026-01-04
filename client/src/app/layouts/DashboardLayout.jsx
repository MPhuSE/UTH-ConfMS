import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import SidebarDashboard from "../../features/dashboard/SidebarDashboard";

export default function DashboardLayout() {
  const [open, setOpen] = useState(true);
  const location = useLocation();

  const { user, isAuthenticated, isCheckingAuth, checkAuth } = useAuthStore();

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

  return (
    <div className="flex min-h-screen">
      {/* SIDEBAR */}
      <aside
        className={`
          text-white transition-all duration-300 flex-shrink-0
          ${open ? "w-64" : "w-14"}
        `}
        style={{ backgroundColor: "rgb(0, 134, 137)" }}
      >
        <div className="flex items-center gap-3 p-4 border-b border-white/10">
          <button onClick={() => setOpen(!open)} className="text-xl">
            ☰
          </button>
          {open && <span className="font-semibold">UTH-ConfMS</span>}
        </div>
        <div className={`p-2 ${open ? '' : 'hidden'}`}>
          {location.pathname.startsWith("/dashboard") && <SidebarDashboard />}
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 flex flex-col bg-gray-50">
        {/* <Navbar /> */}
        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
