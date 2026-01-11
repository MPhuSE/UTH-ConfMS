import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../app/store/useAuthStore" 

export default function DashboardSelector() {
  const navigate = useNavigate();
  const { user } = useAuthStore(); 

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    // Điều hướng dựa trên Role của User
    switch (user.role?.toLowerCase()) {
      case "admin":
        navigate("/dashboard/admin/users");
        break;
      case "chair":
        navigate("/dashboard/conference-list");
        break;
      case "reviewer":
        navigate("/dashboard/reviewer/dashboard");
        break;
      case "author":
      default:
        // Mặc định Author sẽ vào danh sách bài nộp của họ
        navigate("/dashboard/my-submissions");
        break;
    }
  }, [user, navigate]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      <p className="ml-4 text-gray-600 font-medium">Đang chuẩn bị không gian làm việc...</p>
    </div>
  );
}