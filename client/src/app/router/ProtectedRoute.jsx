import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../app/store/useAuthStore";

export default function ProtectedRoute({ children, allowRoles }) {
  const { isAuthenticated, role, isCheckingAuth } = useAuthStore();

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600">Đang kiểm tra phiên đăng nhập...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowRoles && allowRoles.length) {
    const normalize = (r) => String(r || "").toLowerCase();
    const allowed = allowRoles.map(normalize);
    const userRole = normalize(role);

    if (!allowed.includes(userRole)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
}