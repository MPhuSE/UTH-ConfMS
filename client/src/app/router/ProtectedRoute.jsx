import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../app/store/useAuthStore";

export default function ProtectedRoute({ children, allowRoles }) {
  const { isAuthenticated, role, user, isCheckingAuth } = useAuthStore();

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

    // Support multi-role users: allow if ANY role matches
    const userRoles = Array.isArray(user?.role_names) && user.role_names.length
      ? user.role_names.map(normalize)
      : [normalize(role)];

    if (!userRoles.some((r) => allowed.includes(r))) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
}