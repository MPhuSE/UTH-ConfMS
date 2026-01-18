import React from "react";
import { Outlet, Link } from "react-router-dom";

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar đơn giản */}
      <aside className="w-64 bg-indigo-900 text-white p-6">
      <Link to="/dashboard/overview" className="block hover:opacity-80 transition-all">
  <h2 className="text-xl font-black mb-8 tracking-tighter text-gray-900">
    UTH-Conf<span className="text-blue-600">MS</span>
  </h2>
</Link>
        <nav className="space-y-4">
          <Link to="/dashboard/overview" className="block hover:text-indigo-300">Tổng quan</Link>
          <Link to="/dashboard/my-submissions" className="block hover:text-indigo-300">Bài nộp của tôi</Link>
          <Link to="/dashboard/submission" className="block hover:text-indigo-300">Nộp bài mới</Link>
          <Link to="/dashboard/results" className="block hover:text-indigo-300">Kết quả & Reviews</Link>
          <Link to="/dashboard/profile" className="block hover:text-indigo-300">Hồ sơ</Link>
          <Link to="/login" className="block text-red-400 mt-10">Đăng xuất</Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <header className="mb-8 bg-white p-4 rounded-xl shadow-sm">
          <span className="text-gray-600">Xin chào, Tác giả</span>
        </header>
        <Outlet /> 
      </main>
    </div>
  );
}