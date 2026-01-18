import { useEffect, useState } from "react";
import { adminService } from "../../../services/adminService";
import { toast } from "react-hot-toast";

export default function SystemHealthPage() {
  const [health, setHealth] = useState(null);

  const loadHealth = async () => {
    try {
      const data = await adminService.getSystemHealth();
      setHealth(data);
    } catch (err) {
      toast.error("Không thể tải trạng thái hệ thống");
    }
  };

  useEffect(() => {
    loadHealth();
  }, []);

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-6">System Health</h2>
      {!health ? (
        <p className="text-gray-500">Đang tải...</p>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b pb-2">
            <span className="font-medium text-gray-700">Database</span>
            <span className={`text-sm font-bold ${health.database === "healthy" ? "text-green-600" : "text-red-600"}`}>
              {health.database}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-700">Overall</span>
            <span className={`text-sm font-bold ${health.status === "operational" ? "text-green-600" : "text-amber-600"}`}>
              {health.status}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
