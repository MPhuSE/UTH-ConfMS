// features/dashboard/AuthorDashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../app/store/useAuthStore";
import { useSubmissionStore } from "../../app/store/useSubmissionStore";
import { 
  Sparkles, 
  TrendingUp, 
  FileText, 
  CheckCircle, 
  Clock, 
  XCircle,
  Calendar,
  Plus,
  RefreshCw,
  Download,
  Eye,
  Edit,
  ArrowRight,
  Award,
  BarChart3,
  Users,
  Zap
} from "lucide-react";

// Component cho card thống kê với hiệu ứng
const StatCard = ({ title, value, icon: Icon, color, trend, loading = false }) => (
  <div className="relative group">
    <div className="absolute inset-0 bg-gradient-to-r from-white to-white rounded-2xl transition-all duration-300 group-hover:scale-[1.02]"></div>
    <div className="relative bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-lg shadow-gray-200/50 group-hover:shadow-xl group-hover:shadow-gray-300/50 transition-all duration-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-2">{title}</p>
          {loading ? (
            <div className="h-9 w-24 bg-gray-200 animate-pulse rounded-lg"></div>
          ) : (
            <p className="text-3xl font-bold text-gray-900">{value}</p>
          )}
          {trend && (
            <div className="flex items-center mt-2">
              <TrendingUp className={`w-4 h-4 ${trend > 0 ? 'text-green-500' : 'text-red-500'} mr-1`} />
              <span className={`text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trend > 0 ? '+' : ''}{trend}%
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
          <Icon className={`w-6 h-6 ${color.replace('text-', 'text-')}`} />
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
    </div>
  </div>
);

// Component cho conference card
const ConferenceCard = ({ conference, onClick }) => (
  <div 
    onClick={onClick}
    className="group relative bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-100 hover:border-teal-200 hover:shadow-xl hover:shadow-teal-100/50 transition-all duration-300 cursor-pointer overflow-hidden"
  >
    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-teal-50/50 to-transparent rounded-full -translate-y-12 translate-x-12"></div>
    
    <div className="relative">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h4 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2">{conference.name}</h4>
          <p className="text-sm text-gray-600 line-clamp-2">{conference.description || 'Hội nghị khoa học'}</p>
        </div>
        <Award className="w-5 h-5 text-teal-500 flex-shrink-0 ml-3" />
      </div>
      
      <div className="space-y-3 mb-6">
        <div className="flex items-center text-sm">
          <Calendar className="w-4 h-4 text-gray-400 mr-2" />
          <span className="text-gray-600">
            {new Date(conference.start_date).toLocaleDateString('vi-VN')}
          </span>
          <ArrowRight className="w-3 h-3 mx-2 text-gray-400" />
          <span className="text-gray-600">
            {new Date(conference.end_date).toLocaleDateString('vi-VN')}
          </span>
        </div>
        
        {conference.location && (
          <div className="flex items-center text-sm">
            <Users className="w-4 h-4 text-gray-400 mr-2" />
            <span className="text-gray-600">{conference.location}</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-between">
        <span className="px-3 py-1 bg-teal-50 text-teal-700 text-sm font-medium rounded-full">
          Đang mở
        </span>
        <div className="flex items-center text-teal-600 font-medium group-hover:translate-x-2 transition-transform duration-300">
          <span className="text-sm">Nộp bài</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </div>
      </div>
    </div>
  </div>
);

// Component cho submission row
const SubmissionRow = ({ paper, onView, onEdit }) => {
  const getStatusConfig = (status) => {
    const s = (status || "").toLowerCase();
    switch (s) {
      case "accept":
      case "accepted":
        return {
          color: "text-green-600 bg-green-50 border-green-200",
          icon: CheckCircle,
          label: "Đã chấp nhận"
        };
      case "reject":
      case "rejected":
        return {
          color: "text-red-600 bg-red-50 border-red-200",
          icon: XCircle,
          label: "Bị từ chối"
        };
      case "under review":
      case "reviewing":
        return {
          color: "text-yellow-600 bg-yellow-50 border-yellow-200",
          icon: Clock,
          label: "Đang xét duyệt"
        };
      default:
        return {
          color: "text-blue-600 bg-blue-50 border-blue-200",
          icon: FileText,
          label: "Đã nộp"
        };
    }
  };

  const statusConfig = getStatusConfig(paper.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="group relative bg-white rounded-xl p-4 border border-gray-100 hover:border-teal-200 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-start space-x-3">
            <div className={`p-2 rounded-lg ${statusConfig.color.split(' ')[1]}`}>
              <StatusIcon className={`w-5 h-5 ${statusConfig.color.split(' ')[0]}`} />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 truncate">{paper.title}</h4>
              <p className="text-sm text-gray-500 mt-1">
                {paper.conference?.name || 'Không có hội nghị'}
              </p>
              <div className="flex items-center mt-2 space-x-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                  {statusConfig.label}
                </span>
                <span className="text-sm text-gray-400">
                  {paper.submitted_at ? new Date(paper.submitted_at).toLocaleDateString('vi-VN') : '—'}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={onView}
            className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
            title="Xem chi tiết"
          >
            <Eye className="w-5 h-5" />
          </button>
          <button
            onClick={onEdit}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Chỉnh sửa"
          >
            <Edit className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default function AuthorDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();
  const { role, user } = useAuthStore();
  
  const { 
    submissions,
    conferences,
    isLoading,
    error,
    fetchDashboardData,
    getCounts,
    getMyCounts
  } = useSubmissionStore();

  useEffect(() => {
    if (role) {
      fetchDashboardData(role);
    }
  }, [fetchDashboardData, role]);

  const counts = getCounts();
  const myCounts = getMyCounts();

  // Animation cho loading
  if (isLoading && submissions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
        <div className="max-w-7xl mx-auto">
          {/* Skeleton header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <div className="h-8 w-48 bg-gray-200 animate-pulse rounded-lg mb-2"></div>
              <div className="h-4 w-64 bg-gray-200 animate-pulse rounded"></div>
            </div>
            <div className="h-10 w-32 bg-gray-200 animate-pulse rounded-lg"></div>
          </div>
          
          {/* Skeleton stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="h-4 w-24 bg-gray-200 animate-pulse rounded mb-4"></div>
                <div className="h-9 w-32 bg-gray-200 animate-pulse rounded-lg"></div>
              </div>
            ))}
          </div>
          
          {/* Skeleton content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="h-6 w-48 bg-gray-200 animate-pulse rounded mb-6"></div>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i}>
                    <div className="h-4 w-32 bg-gray-200 animate-pulse rounded mb-2"></div>
                    <div className="h-2 w-full bg-gray-200 animate-pulse rounded"></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="h-6 w-48 bg-gray-200 animate-pulse rounded mb-6"></div>
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-200 animate-pulse rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (role !== 'authors') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <div className="text-center max-w-md">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-12 h-12 text-red-500" />
            </div>
            <Sparkles className="w-6 h-6 text-red-400 absolute top-0 right-1/4 animate-pulse" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Truy cập bị từ chối</h3>
          <p className="text-gray-600 mb-6">
            Trang này chỉ dành cho tác giả. Vai trò của bạn hiện tại không có quyền truy cập.
          </p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-900 to-gray-700 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300"
          >
            Quay về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center mb-2">
                <Sparkles className="w-6 h-6 text-teal-500 mr-3 animate-pulse" />
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-teal-600 bg-clip-text text-transparent">
                  Dashboard Tác Giả
                </h1>
              </div>
              <p className="text-gray-600">
                Chào mừng trở lại, <span className="font-semibold text-teal-600">{user?.full_name || user?.email || 'Tác giả'}</span>! 
                Quản lý bài nộp và theo dõi tiến độ của bạn.
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => fetchDashboardData(role)}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 hover:shadow-sm transition-all duration-300 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Đang cập nhật...' : 'Làm mới'}
              </button>
              <button 
                onClick={() => navigate("/dashboard/my-submissions/new")}
                className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-teal-200 transition-all duration-300 group"
              >
                <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                Bài nộp mới
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="inline-flex bg-white/50 backdrop-blur-sm rounded-xl p-1 border border-gray-100 shadow-sm">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeTab === "overview"
                  ? "bg-white text-teal-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center">
                <BarChart3 className="w-4 h-4 mr-2" />
                Tổng quan
              </div>
            </button>
            <button
              onClick={() => setActiveTab("submissions")}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeTab === "submissions"
                  ? "bg-white text-teal-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                Bài nộp của tôi
                {myCounts.total > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-teal-100 text-teal-700 text-xs font-medium rounded-full">
                    {myCounts.total}
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 animate-slideDown">
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-100 rounded-2xl p-4">
              <div className="flex items-center">
                <XCircle className="w-5 h-5 text-red-500 mr-3" />
                <div className="flex-1">
                  <p className="font-medium text-red-800">Có lỗi xảy ra</p>
                  <p className="text-sm text-red-600 mt-1">{error}</p>
                </div>
                <button 
                  onClick={() => fetchDashboardData(role)}
                  className="text-sm font-medium text-red-600 hover:text-red-800"
                >
                  Thử lại
                </button>
              </div>
            </div>
          </div>
        )}

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-fadeIn">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Tổng bài nộp"
                value={myCounts.total}
                icon={FileText}
                color="text-blue-600"
                loading={isLoading}
              />
              <StatCard
                title="Đã chấp nhận"
                value={myCounts.accepted}
                icon={CheckCircle}
                color="text-green-600"
                loading={isLoading}
                trend={12}
              />
              <StatCard
                title="Đang xét duyệt"
                value={myCounts.underReview}
                icon={Clock}
                color="text-yellow-600"
                loading={isLoading}
                trend={5}
              />
              <StatCard
                title="Bị từ chối"
                value={myCounts.rejected}
                icon={XCircle}
                color="text-red-600"
                loading={isLoading}
                trend={-3}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Distribution Chart */}
              <div className="lg:col-span-2">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-gray-900 text-lg">Phân bố bài nộp</h3>
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm text-gray-600">Tỷ lệ chấp nhận: 
                        <span className="font-bold text-gray-900 ml-1">
                          {myCounts.total > 0 ? ((myCounts.accepted / myCounts.total) * 100).toFixed(1) : 0}%
                        </span>
                      </span>
                    </div>
                  </div>
                  
                  {myCounts.total > 0 ? (
                    <div className="space-y-6">
                      {[
                        { 
                          label: "Đã chấp nhận", 
                          value: myCounts.accepted, 
                          color: "from-green-500 to-emerald-400",
                          bgColor: "bg-green-50"
                        },
                        { 
                          label: "Đang xét duyệt", 
                          value: myCounts.underReview, 
                          color: "from-yellow-500 to-amber-400",
                          bgColor: "bg-yellow-50"
                        },
                        { 
                          label: "Bị từ chối", 
                          value: myCounts.rejected, 
                          color: "from-red-500 to-pink-400",
                          bgColor: "bg-red-50"
                        },
                      ].map((item) => {
                        const percentage = (item.value / myCounts.total) * 100;
                        return (
                          <div key={item.label}>
                            <div className="flex justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">{item.label}</span>
                              <span className="text-sm font-bold text-gray-900">
                                {item.value} <span className="text-gray-500">({percentage.toFixed(1)}%)</span>
                              </span>
                            </div>
                            <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
                              <div 
                                className={`absolute inset-y-0 left-0 bg-gradient-to-r ${item.color} rounded-full transition-all duration-1000 ease-out`}
                                style={{ width: `${percentage}%` }}
                              >
                                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Chưa có dữ liệu thống kê</p>
                    </div>
                  )}
                </div>
              </div>

              {/* System Stats */}
              <div className="bg-gradient-to-b from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-white/20">
                <h3 className="font-bold text-gray-900 text-lg mb-6">Thống kê hệ thống</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-gray-400 mr-3" />
                      <span className="font-medium text-gray-700">Tổng bài hệ thống</span>
                    </div>
                    <span className="text-2xl font-bold text-gray-900">{counts.total}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-green-50/50 rounded-xl">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      <span className="font-medium text-gray-700">Đã chấp nhận</span>
                    </div>
                    <span className="text-2xl font-bold text-green-600">{counts.accepted}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-blue-50/50 rounded-xl">
                    <div className="flex items-center">
                      <Users className="w-5 h-5 text-blue-500 mr-3" />
                      <span className="font-medium text-gray-700">Tác giả tham gia</span>
                    </div>
                    <span className="text-2xl font-bold text-blue-600">1,234</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Open Conferences */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-white/20">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Hội nghị đang mở</h2>
                  <p className="text-gray-600">Cơ hội công bố nghiên cứu của bạn</p>
                </div>
                <div className="flex items-center text-teal-600 font-medium">
                  <span>Xem tất cả</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                      <div className="h-6 bg-gray-200 rounded mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              ) : conferences.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Không có hội nghị nào</h3>
                  <p className="text-gray-600">Vui lòng quay lại sau</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {conferences.slice(0, 3).map((conference) => (
                    <ConferenceCard
                      key={conference.id}
                      conference={conference}
                      onClick={() => navigate(`/dashboard/my-submissions/new?conference=${conference.id}`)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SUBMISSIONS TAB */}
        {activeTab === "submissions" && (
          <div className="animate-fadeIn">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Bài nộp của tôi</h2>
                    <p className="text-gray-600 mt-1">Quản lý và theo dõi tất cả bài nộp</p>
                  </div>
                  <div className="mt-4 sm:mt-0 flex items-center space-x-3">
                    <button className="inline-flex items-center px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-300">
                      <Download className="w-4 h-4 mr-2" />
                      Xuất CSV
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-20 bg-gray-200 animate-pulse rounded-xl"></div>
                    ))}
                  </div>
                ) : submissions.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="relative inline-block mb-6">
                      <FileText className="w-20 h-20 text-gray-300" />
                      <Sparkles className="w-6 h-6 text-teal-400 absolute -top-2 -right-2 animate-pulse" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Chưa có bài nộp nào</h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto"> 
                      Bắt đầu hành trình nghiên cứu của bạn bằng cách nộp bài đầu tiên
                    </p>
                    <button 
                      onClick={() => navigate("/dashboard/my-submissions/new")}
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-teal-600 to-emerald-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-teal-200 transition-all duration-300"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Tạo bài nộp đầu tiên
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {submissions.map((paper) => (
                      <SubmissionRow
                        key={paper.id}
                        paper={paper}
                        onView={() => navigate(`/dashboard/my-submissions/${paper.id}`)}
                        onEdit={() => navigate(`/dashboard/my-submissions/${paper.id}/edit`)}
                      />
                    ))}
                  </div>
                )}

                {submissions.length > 0 && (
                  <div className="mt-8 flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      Hiển thị <span className="font-medium">{submissions.length}</span> bài nộp
                    </p>
                    <button className="inline-flex items-center text-sm font-medium text-teal-600 hover:text-teal-700">
                      Xem tất cả bài nộp
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add custom animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}