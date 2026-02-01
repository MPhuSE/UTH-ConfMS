import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../app/store/useAuthStore";

export default function DashboardSelector() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const userRoles = (user.role_names || []).map(r => r.toLowerCase());

    // Phân quyền ưu tiên: Admin > Chair > Reviewer > Author
    if (userRoles.includes("admin")) {
      navigate("/dashboard/admin/users");
      return;
    }

    if (userRoles.includes("chair")) {
      navigate("/dashboard/chair/dashboard");
      return;
    }

    if (userRoles.includes("reviewer")) {
      navigate("/dashboard/reviewer/dashboard");
      return;
    }

    if (userRoles.includes("author") || userRoles.includes("authors")) {
      navigate("/dashboard/overview");
      return;
    }

    // Default if no specific role matched
    navigate("/dashboard/profile");
  }, [user, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      <p className="mt-4 text-gray-600 font-medium">Đang kiểm tra quyền truy cập...</p>
    </div>
  );
}