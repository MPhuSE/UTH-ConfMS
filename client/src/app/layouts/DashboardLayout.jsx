import React from "react";
import { Outlet, Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { 
  Home, 
  FileText, 
  Upload, 
  Award, 
  User, 
  Settings,
  Users,
  Building,
  Mail,
  Shield,
  BarChart,
  LogOut,
  ChevronRight,
  Bell,
  UserCog,
  ClipboardList,
  CheckCircle
} from "lucide-react";

export default function DashboardLayout() {
  const { role, user } = useAuthStore();

  const roleNames = Array.isArray(user?.role_names) && user.role_names.length
    ? user.role_names.map((r) => String(r || "").toLowerCase())
    : [String(role || "").toLowerCase()].filter(Boolean);

  const isAdmin = roleNames.includes("admin");
  const isChair = roleNames.includes("chair");
  const isReviewer = roleNames.includes("reviewer");
  const isAuthor = roleNames.includes("author") || roleNames.includes("authors");

  // Map role to display name
  const getRoleName = () => {
    if (isAdmin) return "Quản trị viên";
    if (isChair) return "Chủ tịch";
    if (isReviewer) return "Phản biện";
    if (isAuthor) return "Tác giả";
    return "Người dùng";
  };

  const displayName = user?.full_name || user?.name || user?.email || "Người dùng";

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-200">
          <Link to="/dashboard/overview" className="inline-flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-linear-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">UT</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                UTH-Conf<span className="text-blue-600">MS</span>
              </h2>
              <p className="text-xs text-gray-500">Hệ thống hội nghị</p>
            </div>
          </Link>
        </div>

        {/* User Info */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
              {displayName?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <p className="font-medium text-gray-900">{displayName}</p>
              <p className="text-sm text-gray-500">{getRoleName()}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {/* Common Links */}
          <Link 
            to="/dashboard" 
            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors group"
          >
            <Home className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
            <span>Tổng quan</span>
          </Link>

          {/* Author Links */}
          {isAuthor && (
            <>
              <Link 
                to="/dashboard/my-submissions" 
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors group"
              >
                <FileText className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                <span>Bài nộp của tôi</span>
              </Link>
              
              <Link 
                to="/dashboard/submission" 
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors group"
              >
                <Upload className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                <span>Nộp bài mới</span>
              </Link>
              
              <Link 
                to="/dashboard/results" 
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors group"
              >
                <Award className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                <span>Kết quả & Reviews</span>
              </Link>
              
              <Link 
                to="/dashboard/profile" 
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors group"
              >
                <User className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                <span>Hồ sơ</span>
              </Link>
            </>
          )}

          {/* Reviewer Links */}
          {isReviewer && (
            <>
              <div className="pt-4 pb-2">
                <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reviewer</p>
              </div>
              <Link
                to="/dashboard/reviewer/dashboard"
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors group"
              >
                <ClipboardList className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                <span>Assignments</span>
              </Link>
            </>
          )}

          {/* Chair Links */}
          {isChair && (
            <>
              <div className="pt-4 pb-2">
                <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Chair</p>
              </div>
              <Link
                to="/dashboard/chair/dashboard"
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors group"
              >
                <UserCog className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                <span>Chair Dashboard</span>
              </Link>
              <Link
                to="/dashboard/chair/conferences"
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors group"
              >
                <Award className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                <span>Quản lý hội nghị</span>
              </Link>
              <Link
                to="/dashboard/audit-logs"
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors group"
              >
                <FileText className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                <span>Audit Logs</span>
              </Link>
            </>
          )}

          {/* Admin Links */}
          {isAdmin && (
            <>
              <div className="pt-4 pb-2">
                <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Quản trị</p>
              </div>
              
              <Link 
                to="/dashboard/admin" 
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors group"
              >
                <Settings className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                <span>Admin Dashboard</span>
              </Link>
              
              <Link 
                to="/dashboard/admin/users" 
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors group"
              >
                <Users className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                <span>Quản lý người dùng</span>
              </Link>
              
              <Link 
                to="/dashboard/admin/tenants" 
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors group"
              >
                <Building className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                <span>Tenancy</span>
              </Link>
              
              <Link 
                to="/dashboard/admin/smtp-config" 
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors group"
              >
                <Mail className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                <span>SMTP</span>
              </Link>
              
              <Link 
                to="/dashboard/admin/quota-config" 
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors group"
              >
                <BarChart className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                <span>Quota</span>
              </Link>
              
              <Link 
                to="/dashboard/admin/system-health" 
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors group"
              >
                <Shield className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                <span>System Health</span>
              </Link>
              
              <Link 
                to="/dashboard/audit-logs" 
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors group"
              >
                <FileText className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                <span>Audit Logs</span>
              </Link>
            </>
          )}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <Link 
            to="/login" 
            className="flex items-center justify-between px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors group"
          >
            <div className="flex items-center gap-3">
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Đăng xuất</span>
            </div>
            <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                Xin chào, <span className="text-blue-600">{getRoleName()}</span>
              </h1>
              <p className="text-sm text-gray-600">
                Chào mừng đến với hệ thống quản lý hội nghị
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              {/* User Menu */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{displayName}</p>
                  <p className="text-xs text-gray-500">{user?.email || "example@uth.edu.vn"}</p>
                </div>
                <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                  {displayName?.[0]?.toUpperCase() || "U"}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}