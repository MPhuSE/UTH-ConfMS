import React from "react";
import { Outlet } from "react-router-dom";

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Bạn có thể thêm Navbar chung cho khách ở đây */}
      <main>
        <Outlet /> {/* Đây là nơi các trang Login, Register sẽ hiển thị */}
      </main>
    </div>
  );
}