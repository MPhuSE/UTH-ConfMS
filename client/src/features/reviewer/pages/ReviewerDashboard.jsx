import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../app/store/useAuthStore";
import { reviewService } from "../../../services";
import { FileText, Clock, CheckCircle, AlertCircle } from "lucide-react";
import Table from "../../../components/Table";
import { toast } from "react-hot-toast";

/**
 * Dashboard cho Reviewer
 */
export default function ReviewerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [assignments, setAssignments] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    overdue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadAssignments();
    }
  }, [user]);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const data = await reviewService.getAssignmentsByReviewer(user.id);
      setAssignments(data);

      // Calculate stats
      const pending = data.filter((a) => !a.review?.submitted).length;
      const completed = data.filter((a) => a.review?.submitted).length;
      const overdue = data.filter((a) => {
        if (a.review?.submitted) return false;
        const deadline = new Date(a.deadline);
        return deadline < new Date();
      }).length;

      setStats({
        total: data.length,
        pending,
        completed,
        overdue,
      });
    } catch (error) {
      toast.error("Không thể tải danh sách bài được phân công");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      header: "Tiêu đề",
      accessor: "title",
      render: (row) => (
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-gray-400" />
          <span className="font-medium">{row.submission?.title || "N/A"}</span>
        </div>
      ),
    },
    {
      header: "Hội nghị",
      accessor: "conference",
      render: (row) => row.submission?.conference?.name || "N/A",
    },
    {
      header: "Track",
      accessor: "track",
      render: (row) => row.submission?.track?.name || "N/A",
    },
    {
      header: "Trạng thái",
      accessor: "status",
      render: (row) => (
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
            row.review?.submitted
              ? "bg-green-100 text-green-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {row.review?.submitted ? "Đã đánh giá" : "Chưa đánh giá"}
        </span>
      ),
    },
    {
      header: "Hạn chót",
      accessor: "deadline",
      render: (row) => {
        const deadline = new Date(row.deadline);
        const isOverdue = deadline < new Date() && !row.review?.submitted;
        return (
          <span className={isOverdue ? "text-red-600 font-medium" : ""}>
            {deadline.toLocaleDateString("vi-VN")}
          </span>
        );
      },
    },
    {
      header: "Thao tác",
      accessor: "actions",
      render: (row) => (
        <button
          onClick={() => navigate(`/dashboard/review/${row.submission_id}`)}
          className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors text-sm"
        >
          {row.review?.submitted ? "Xem đánh giá" : "Đánh giá"}
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Reviewer</h1>
        <p className="mt-1 text-sm text-gray-500">Quản lý các bài được phân công đánh giá</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Tổng số</p>
              <p className="text-2xl font-bold mt-1">{stats.total}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Chờ đánh giá</p>
              <p className="text-2xl font-bold mt-1">{stats.pending}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Đã hoàn thành</p>
              <p className="text-2xl font-bold mt-1">{stats.completed}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Quá hạn</p>
              <p className="text-2xl font-bold mt-1 text-red-600">{stats.overdue}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Assignments Table */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-lg font-semibold mb-4">Danh sách bài được phân công</h2>
        <Table
          columns={columns}
          data={assignments}
          loading={loading}
          emptyMessage="Bạn chưa được phân công bài nào"
        />
      </div>
    </div>
  );
}