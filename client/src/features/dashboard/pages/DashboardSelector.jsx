import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../app/store/useAuthStore"; 

export default function DashboardSelector() {
  const navigate = useNavigate();
  const { user } = useAuthStore(); 

  useEffect(() => {
    // 1. Debug cực mạnh để diệt tận gốc lỗi undefined
    console.log("=== DEBUG USER DATA ===");
    console.log("Full Object:", user);

    if (!user) {
      console.log("Chưa có user, về trang login");
      navigate("/login");
      return;
    }


    const role = (
      user.role_names[0] || 
      user.user?.role || 
      user.data?.role || 
      user.profile?.role
    );


    if (!role) {
      console.error("LỖI: Không tìm thấy trường 'role' trong dữ liệu Store!");
      navigate("/dashboard/my-submissions");
      return;
    }



    // 3. Điều hướng chính xác dựa trên role
    // Chú ý: Dùng .includes hoặc nhiều case để tránh lỗi 'author' vs 'authors'
    switch (role) {
      case "admin":
        navigate("/dashboard/admin/users");
        break;
      case "chair":
        navigate("/dashboard/chair/dashboard");
        break;
      case "reviewer":
        navigate("/dashboard/reviewer/dashboard");
        break;
      case "author":
      case "authors":
        navigate("/dashboard/overview");
        break;
      default:
        console.warn("Role lạ, chuyển về my-submissions:", role);
        navigate("/dashboard/my-submissions");
        break;
    }
  }, [user, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      <p className="mt-4 text-gray-600 font-medium">Đang kiểm tra quyền truy cập...</p>
    </div>
  );
}