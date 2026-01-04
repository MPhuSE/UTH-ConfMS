// features/dashboard/AuthorDashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../app/store/useAuthStore";
import { useSubmissionStore } from "../../app/store/useSubmissionStore";
import { 
  RefreshCw, 
  FileText, 
  CheckCircle, 
  Clock, 
  XCircle,
  Calendar,
  ChevronRight,
  PlusCircle,
  Download,
  Eye,
  Edit,
  AlertCircle
} from "lucide-react";

export default function AuthorDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();
  const location = useLocation();
  const { role, user } = useAuthStore();
  
  // Get state and actions from store
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
    console.log('Component mounted, fetching data...');
    console.log('Current user role:', role);
    console.log('Current user:', user);
    
    if (role) {
      fetchDashboardData(role);
    } else {
      console.log('Role is undefined, waiting for auth...');
    }
  }, [fetchDashboardData, role, user]);

  // Log state changes
  useEffect(() => {
    console.log('Submissions updated:', submissions);
    console.log('Conferences updated:', conferences);
    console.log('Is loading:', isLoading);
    console.log('Error:', error);
  }, [submissions, conferences, isLoading, error]);

  // Use computed values from store
  const counts = getCounts();
  const myCounts = getMyCounts();

  console.log('Counts:', counts);
  console.log('My Counts:', myCounts);

  const getStatusColor = (status) => {
    switch(status) {
      case "Accepted": return "bg-green-100 text-green-800";
      case "Rejected": return "bg-red-100 text-red-800";
      case "Submitted": return "bg-blue-100 text-blue-800";
      case "Under Review": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case "Accepted": return <CheckCircle className="w-4 h-4" />;
      case "Rejected": return <XCircle className="w-4 h-4" />;
      case "Under Review": return <Clock className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  // Kiểm tra role - chỉ hiển thị cho AUTHOR
  if (role !== 'authors') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Không có quyền truy cập</h3>
          <p className="text-gray-600">
            Trang này chỉ dành cho tác giả. Vai trò của bạn là: {role || 'undefined'}
          </p>
          <p className="text-sm text-gray-500 mt-2">User ID: {user?.id}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Debug Info - Remove in production */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
          <span className="font-medium text-yellow-800">Debug Info</span>
        </div>
        <div className="mt-2 text-sm text-yellow-700 space-y-1">
          <div>Role: {role}</div>
          <div>User: {user?.name} ({user?.id})</div>
          <div>Submissions count: {submissions.length}</div>
          <div>Conferences count: {conferences.length}</div>
          <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
          {error && <div className="text-red-600">Error: {error}</div>}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex-1 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "overview"
                ? "border-teal-600 text-teal-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Tổng quan
          </button>
          <button
            onClick={() => setActiveTab("submissions")}
            className={`flex-1 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "submissions"
                ? "border-teal-600 text-teal-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Bài nộp của tôi
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {activeTab === "overview" ? "Tổng quan" : "Quản lý bài nộp"}
          </h1>
          <p className="text-gray-600">
            {activeTab === "overview" 
              ? "Thống kê và báo cáo hệ thống" 
              : "Quản lý các bài nộp của bạn"}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => navigate("/dashboard/my-submissions/new")}
            className="inline-flex items-center px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Bài nộp mới
          </button>
          <button 
            onClick={() => fetchDashboardData(role)}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Đang tải...' : 'Làm mới'}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <XCircle className="w-5 h-5 text-red-600 mr-2" />
            <span className="font-medium text-red-800">Lỗi khi tải dữ liệu</span>
          </div>
          <p className="text-sm text-red-700 mt-1">{error}</p>
          <button 
            onClick={() => fetchDashboardData(role)}
            className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Bài nộp của tôi</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{myCounts.total}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Đã chấp nhận</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{myCounts.accepted}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Đang xét duyệt</p>
                  <p className="text-3xl font-bold text-yellow-600 mt-2">{myCounts.underReview}</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Bị từ chối</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">{myCounts.rejected}</p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Charts and Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* My Submission Distribution */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="font-bold text-gray-900 mb-4">Phân bố bài nộp của tôi</h3>
              {myCounts.total > 0 ? (
                <div className="space-y-4">
                  {[
                    { label: "Đã chấp nhận", value: myCounts.accepted, color: "bg-green-500", percentage: (myCounts.accepted/myCounts.total)*100 },
                    { label: "Đang xét duyệt", value: myCounts.underReview, color: "bg-yellow-500", percentage: (myCounts.underReview/myCounts.total)*100 },
                    { label: "Bị từ chối", value: myCounts.rejected, color: "bg-red-500", percentage: (myCounts.rejected/myCounts.total)*100 },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">{item.label}</span>
                        <span className="text-sm font-medium text-gray-700">{item.value} ({item.percentage.toFixed(1)}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`${item.color} h-2 rounded-full`} 
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Chưa có bài nộp nào</p>
              )}
            </div>

            {/* System Overview */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="font-bold text-gray-900 mb-4">Tổng quan hệ thống</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Tổng bài nộp hệ thống</span>
                  <span className="font-bold text-gray-900">{counts.total}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Đã chấp nhận</span>
                  <span className="font-bold text-green-600">{counts.accepted}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Đang xét duyệt</span>
                  <span className="font-bold text-yellow-600">{counts.underReview}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Bị từ chối</span>
                  <span className="font-bold text-red-600">{counts.rejected}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Open Conferences */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Hội nghị đang mở</h2>
                <p className="text-sm text-gray-600">Đang nhận bài nộp</p>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Đang tải hội nghị...</p>
              </div>
            ) : conferences.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-xl">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Hiện tại không có hội nghị nào đang mở</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {conferences.slice(0, 3).map((conference) => (
                  <div 
                    key={conference.id}
                    className="border rounded-lg p-4 hover:border-teal-300 hover:shadow-sm transition-all"
                  >
                    <h4 className="font-bold text-gray-900 mb-2 truncate">{conference.name}</h4>
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>Bắt đầu: {new Date(conference.start_date).toLocaleDateString('vi-VN')}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>Kết thúc: {new Date(conference.end_date).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => navigate(`/dashboard/my-submissions/new?conference=${conference.id}`)}
                      className="w-full px-3 py-2 text-sm bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Nộp bài
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBMISSIONS TAB */}
      {activeTab === "submissions" && (
        <div className="space-y-6">
          {/* Submissions Table */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
              </div>
            ) : submissions.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có bài nộp nào</h3>
                <p className="text-gray-600 mb-6">Bắt đầu bằng việc nộp bài đầu tiên của bạn</p>
                <button 
                  onClick={() => navigate("/dashboard/my-submissions/new")}
                  className="inline-flex items-center px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium"
                >
                  <PlusCircle className="w-5 h-5 mr-2" />
                  Tạo bài nộp mới
                </button>
              </div>
            ) : (
              <>
                <div className="p-6 border-b">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Bài nộp của tôi</h2>
                      <p className="text-gray-600 mt-1">Danh sách các bài nộp của bạn</p>
                    </div>
                    <div className="mt-4 sm:mt-0 flex items-center space-x-3">
                      <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
                        <Download className="w-4 h-4 inline mr-2" />
                        Xuất dữ liệu
                      </button>
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tiêu đề bài báo
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Hội nghị
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Trạng thái
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ngày nộp
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {submissions.map((paper) => (
                        <tr key={paper.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <FileText className="flex-shrink-0 w-5 h-5 text-gray-400 mr-3" />
                              <div className="text-sm font-medium text-gray-900">
                                {paper.title}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {paper.conference?.name || '—'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(paper.status)}`}>
                              {getStatusIcon(paper.status)}
                              <span className="ml-1.5">{paper.status}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {paper.submitted_at ? new Date(paper.submitted_at).toLocaleDateString('vi-VN') : '—'}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => navigate(`/dashboard/my-submissions/${paper.id}`)}
                                className="text-teal-600 hover:text-teal-900 p-1"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => navigate(`/dashboard/my-submissions/${paper.id}/edit`)}
                                className="text-blue-600 hover:text-blue-900 p-1"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}