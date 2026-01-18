import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../app/store/useAuthStore";
import { 
  conferenceService, 
  submissionService, 
  reviewService,
  decisionService,
  reportsService
} from "../../services";
import { 
  FileText, 
  Users, 
  CheckCircle, 
  XCircle,
  Clock,
  TrendingUp,
  Award,
  BarChart3,
  ArrowRight
} from "lucide-react";
import { toast } from "react-hot-toast";

/**
 * Dashboard cho Chair
 */
const StatCard = ({ title, value, icon: Icon, color, onClick, loading = false }) => (
  <div
    onClick={onClick}
    className={`bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
      onClick ? "hover:border-teal-300" : ""
    }`}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 mb-2">{title}</p>
        {loading ? (
          <div className="h-8 w-20 bg-gray-200 animate-pulse rounded"></div>
        ) : (
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        )}
      </div>
      <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
    </div>
  </div>
);

export default function ChairDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [conferences, setConferences] = useState([]);
  const [selectedConference, setSelectedConference] = useState(null);
  const [stats, setStats] = useState({
    totalSubmissions: 0,
    underReview: 0,
    accepted: 0,
    rejected: 0,
    pendingDecisions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConferences();
  }, []);

  useEffect(() => {
    if (selectedConference) {
      loadStats();
    }
  }, [selectedConference]);

  const loadConferences = async () => {
    try {
      setLoading(true);
      const data = await conferenceService.getAll();
      setConferences(data.conferences || data || []);
      if (data.conferences?.length > 0 || data?.length > 0) {
        setSelectedConference(data.conferences?.[0] || data[0]);
      }
    } catch (error) {
      toast.error("Không thể tải danh sách hội nghị");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    if (!selectedConference) return;

    try {
      // Load submissions
      const submissions = await submissionService.getAll();
      const conferenceSubmissions = submissions.filter(
        (s) => s.conference_id === selectedConference.id
      );

      const totalSubmissions = conferenceSubmissions.length;
      const underReview = conferenceSubmissions.filter((s) => s.status === "under_review").length;
      const accepted = conferenceSubmissions.filter((s) => s.status === "accepted").length;
      const rejected = conferenceSubmissions.filter((s) => s.status === "rejected").length;
      const pendingDecisions = conferenceSubmissions.filter(
        (s) => s.status === "under_review"
      ).length;

      setStats({
        totalSubmissions,
        underReview,
        accepted,
        rejected,
        pendingDecisions,
      });
    } catch (error) {
      toast.error("Không thể tải thống kê bài nộp");
      console.error("Error loading stats:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Chair</h1>
        <p className="mt-1 text-sm text-gray-500">Quản lý hội nghị và đánh giá</p>
      </div>

      {/* Conference Selector */}
      {conferences.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chọn hội nghị
          </label>
          <select
            value={selectedConference?.id || ""}
            onChange={(e) => {
              const conf = conferences.find((c) => c.id === parseInt(e.target.value));
              setSelectedConference(conf);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            {conferences.map((conf) => (
              <option key={conf.id} value={conf.id}>
                {conf.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <StatCard
          title="Tổng bài nộp"
          value={stats.totalSubmissions}
          icon={FileText}
          color="text-blue-500"
          loading={loading}
        />
        <StatCard
          title="Đang đánh giá"
          value={stats.underReview}
          icon={Clock}
          color="text-yellow-500"
          loading={loading}
          onClick={() => navigate(`/dashboard/chair/assignments/${selectedConference?.id}`)}
        />
        <StatCard
          title="Đã chấp nhận"
          value={stats.accepted}
          icon={CheckCircle}
          color="text-green-500"
          loading={loading}
        />
        <StatCard
          title="Đã từ chối"
          value={stats.rejected}
          icon={XCircle}
          color="text-red-500"
          loading={loading}
        />
        <StatCard
          title="Chờ quyết định"
          value={stats.pendingDecisions}
          icon={TrendingUp}
          color="text-purple-500"
          loading={loading}
          onClick={() => navigate(`/dashboard/chair/decisions/${selectedConference?.id}`)}
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Thao tác nhanh</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <button
            onClick={() => navigate(`/dashboard/chair/assignments/${selectedConference?.id}`)}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-teal-300 hover:bg-teal-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-teal-500" />
              <span className="font-medium">Phân công Reviewer</span>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </button>

          <button
            onClick={() => navigate(`/dashboard/chair/decisions/${selectedConference?.id}`)}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-teal-300 hover:bg-teal-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-teal-500" />
              <span className="font-medium">Quản lý quyết định</span>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </button>

          <button
            onClick={() => navigate(`/dashboard/chair/notifications/${selectedConference?.id}`)}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-teal-300 hover:bg-teal-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-teal-500" />
              <span className="font-medium">Bulk email</span>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </button>

          <button
            onClick={() => navigate(`/dashboard/chair/proceedings/${selectedConference?.id}`)}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-teal-300 hover:bg-teal-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-teal-500" />
              <span className="font-medium">Proceedings export</span>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </button>

          <button
            onClick={() => navigate("/dashboard/chair/conferences")}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-teal-300 hover:bg-teal-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Award className="w-5 h-5 text-teal-500" />
              <span className="font-medium">Quản lý Hội nghị</span>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
}