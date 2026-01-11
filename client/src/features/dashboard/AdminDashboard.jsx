import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../app/store/useAuthStore";
import { adminService, userService, auditLogService } from "../../services";
import { 
  Users, 
  Server, 
  Settings, 
  Shield,
  Activity,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  ArrowRight
} from "lucide-react";
import { toast } from "react-hot-toast";

/**
 * Dashboard cho Admin
 */
const StatCard = ({ title, value, icon: Icon, color, onClick, loading = false, status }) => (
  <div
    onClick={onClick}
    className={`bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow ${
      onClick ? "cursor-pointer hover:border-teal-300" : ""
    }`}
  >
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-sm text-gray-500 mb-2">{title}</p>
        {loading ? (
          <div className="h-8 w-20 bg-gray-200 animate-pulse rounded"></div>
        ) : (
          <div className="flex items-center gap-2">
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {status && (
              <span
                className={`px-2 py-0.5 rounded text-xs font-medium ${
                  status === "healthy"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {status === "healthy" ? "OK" : "Error"}
              </span>
            )}
          </div>
        )}
      </div>
      <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
    </div>
  </div>
);

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    systemHealth: "unknown",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load users
      const usersData = await userService.getAll();
      const users = usersData.users || usersData || [];
      const activeUsers = users.filter((u) => u.is_active).length;

      // Load system health
      let systemHealth = "unknown";
      try {
        const healthData = await adminService.getSystemHealth();
        systemHealth = healthData.status === "operational" ? "healthy" : "unhealthy";
      } catch (error) {
        console.error("Error loading system health:", error);
      }

      setStats({
        totalUsers: users.length,
        activeUsers,
        systemHealth,
      });
    } catch (error) {
      toast.error("Không thể tải dữ liệu");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
        <p className="mt-1 text-sm text-gray-500">Quản lý hệ thống và người dùng</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Tổng số người dùng"
          value={stats.totalUsers}
          icon={Users}
          color="text-blue-500"
          loading={loading}
          onClick={() => navigate("/dashboard/admin/users")}
        />
        <StatCard
          title="Người dùng đang hoạt động"
          value={stats.activeUsers}
          icon={Activity}
          color="text-green-500"
          loading={loading}
        />
        <StatCard
          title="Trạng thái hệ thống"
          value={stats.systemHealth === "healthy" ? "Hoạt động" : "Lỗi"}
          icon={Server}
          color="text-purple-500"
          loading={loading}
          status={stats.systemHealth}
          onClick={() => navigate("/dashboard/admin/system-health")}
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Thao tác nhanh</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate("/dashboard/admin/users")}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-teal-300 hover:bg-teal-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-teal-500" />
              <span className="font-medium">Quản lý người dùng</span>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </button>

          <button
            onClick={() => navigate("/dashboard/smtp-config")}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-teal-300 hover:bg-teal-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-teal-500" />
              <span className="font-medium">Cấu hình SMTP</span>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </button>

          <button
            onClick={() => navigate("/dashboard/audit-logs")}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-teal-300 hover:bg-teal-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-teal-500" />
              <span className="font-medium">Audit Logs</span>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </button>

          <button
            onClick={() => navigate("/dashboard/admin/system-health")}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-teal-300 hover:bg-teal-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Server className="w-5 h-5 text-teal-500" />
              <span className="font-medium">System Health</span>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
}