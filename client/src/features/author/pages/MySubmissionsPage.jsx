import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubmissionStore } from '../../../app/store/useSubmissionStore';
import { submissionService } from '../../../services/submissionService';
import { 
  Eye, 
  Edit, 
  Trash2, 
  Loader2, 
  Plus, 
  Filter, 
  Search, 
  Calendar, 
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Download,
  MessageSquare,
  BarChart3,
  ChevronRight,
  Globe,
  Users,
  Award
} from 'lucide-react';
import { useAuthStore } from '../../../app/store/useAuthStore';

export default function MySubmissionsPage() {
  const navigate = useNavigate();
  const { submissions, fetchDashboardData } = useSubmissionStore();
  const { user } = useAuthStore();
  const [loadingId, setLoadingId] = useState(null);
  const [language, setLanguage] = useState('VI'); // VI/EN toggle
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    underReview: 0,
    accepted: 0,
    rejected: 0
  });

  useEffect(() => {
    fetchDashboardData('author');
  }, [fetchDashboardData]);

  useEffect(() => {
    // Calculate stats
    const statsData = {
      total: submissions.length,
      underReview: submissions.filter(s => s.status?.toLowerCase() === 'under review').length,
      accepted: submissions.filter(s => s.status?.toLowerCase() === 'accept').length,
      rejected: submissions.filter(s => s.status?.toLowerCase() === 'reject').length
    };
    setStats(statsData);
  }, [submissions]);

  const handleWithdraw = async (id) => {
    const confirmMsg = language === 'VI' 
      ? "Bạn có chắc chắn muốn rút bài báo này? Dữ liệu sẽ bị xóa vĩnh viễn."
      : "Are you sure you want to withdraw this paper? Data will be permanently deleted.";
    
    if (!window.confirm(confirmMsg)) return;
    
    setLoadingId(id);
    try {
      await submissionService.delete(id);
      const successMsg = language === 'VI' 
        ? "Đã rút bài thành công." 
        : "Paper withdrawn successfully.";
      alert(successMsg);
      await fetchDashboardData('author');
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 
        (language === 'VI' 
          ? "Lỗi khi rút bài. Có thể đã quá hạn chót." 
          : "Error withdrawing paper. May be past deadline.");
      alert(errorMsg);
    } finally {
      setLoadingId(null);
    }
  };

  const isActionable = (status) => {
    const s = status?.toLowerCase();
    return s === 'submitted' || s === 'under review';
  };

  const canEdit = (status) => {
    const s = status?.toLowerCase();
    return s === 'submitted';
  };

  const getStatusInfo = (status) => {
    const statusLower = status?.toLowerCase();
    const statusTexts = {
      'submitted': language === 'VI' ? 'ĐÃ NỘP' : 'SUBMITTED',
      'under review': language === 'VI' ? 'ĐANG PHẢN BIỆN' : 'UNDER REVIEW',
      'accept': language === 'VI' ? 'ĐÃ CHẤP NHẬN' : 'ACCEPTED',
      'reject': language === 'VI' ? 'BỊ TỪ CHỐI' : 'REJECTED',
      'camera ready': language === 'VI' ? 'BẢN CUỐI' : 'CAMERA READY',
      'withdrawn': language === 'VI' ? 'ĐÃ RÚT' : 'WITHDRAWN'
    };

    const statusColors = {
      'submitted': { bg: 'bg-blue-100', text: 'text-blue-700', icon: Clock },
      'under review': { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
      'accept': { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
      'reject': { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
      'camera ready': { bg: 'bg-purple-100', text: 'text-purple-700', icon: CheckCircle },
      'withdrawn': { bg: 'bg-gray-100', text: 'text-gray-700', icon: XCircle }
    };

    return {
      text: statusTexts[statusLower] || status,
      ...(statusColors[statusLower] || { bg: 'bg-gray-100', text: 'text-gray-700', icon: AlertCircle })
    };
  };

  const filterOptions = [
    { id: 'all', label: language === 'VI' ? 'Tất cả' : 'All' },
    { id: 'under review', label: language === 'VI' ? 'Đang phản biện' : 'Under Review' },
    { id: 'accept', label: language === 'VI' ? 'Đã chấp nhận' : 'Accepted' },
    { id: 'reject', label: language === 'VI' ? 'Bị từ chối' : 'Rejected' },
    { id: 'submitted', label: language === 'VI' ? 'Đã nộp' : 'Submitted' }
  ];

  const filteredSubmissions = submissions.filter(sub => {
    const matchesFilter = filter === 'all' || sub.status?.toLowerCase() === filter;
    const matchesSearch = search === '' || 
      sub.title?.toLowerCase().includes(search.toLowerCase()) ||
      sub.conference?.name?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {language === 'VI' ? 'Bài báo của tôi' : 'My Submissions'}
          </h1>
          <p className="text-gray-600">
            {language === 'VI' 
              ? 'Quản lý và theo dõi tất cả bài báo đã nộp'
              : 'Manage and track all submitted papers'
            }
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setLanguage(lang => lang === 'VI' ? 'EN' : 'VI')}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-[#2C7A7B] transition-colors"
          >
            <Globe className="w-4 h-4" />
            <span className="font-medium">{language}</span>
          </button>

          <button 
            onClick={() => navigate('/dashboard/submission')}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1A365D] to-[#2C7A7B] text-white rounded-lg font-bold hover:shadow-lg hover:shadow-[#2C7A7B]/30 transition-all duration-300 hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            {language === 'VI' ? 'Nộp bài mới' : 'New Submission'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{language === 'VI' ? 'Tổng bài nộp' : 'Total Submissions'}</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{language === 'VI' ? 'Đang phản biện' : 'Under Review'}</p>
              <p className="text-2xl font-bold text-gray-900">{stats.underReview}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{language === 'VI' ? 'Đã chấp nhận' : 'Accepted'}</p>
              <p className="text-2xl font-bold text-gray-900">{stats.accepted}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{language === 'VI' ? 'Bị từ chối' : 'Rejected'}</p>
              <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="search"
                placeholder={language === 'VI' ? 'Tìm kiếm bài báo...' : 'Search papers...'}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C7A7B]/50 focus:border-[#2C7A7B]"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <div className="flex flex-wrap gap-2">
              {filterOptions.map(option => (
                <button
                  key={option.id}
                  onClick={() => setFilter(option.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === option.id
                      ? 'bg-[#2C7A7B] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Submissions List */}
        <div className="space-y-4">
          {filteredSubmissions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {language === 'VI' ? 'Không có bài báo nào' : 'No submissions found'}
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                {language === 'VI' 
                  ? search 
                    ? 'Không tìm thấy bài báo phù hợp với tìm kiếm.'
                    : 'Bạn chưa nộp bài báo nào. Hãy bắt đầu bằng cách nộp bài mới.'
                  : search
                    ? 'No papers match your search.'
                    : "You haven't submitted any papers. Start by submitting a new paper."
                }
              </p>
              {!search && (
                <button 
                  onClick={() => navigate('/dashboard/submission')}
                  className="mt-6 px-6 py-3 bg-gradient-to-r from-[#1A365D] to-[#2C7A7B] text-white rounded-lg font-bold hover:shadow-lg transition-all"
                >
                  {language === 'VI' ? 'Nộp bài đầu tiên' : 'Submit First Paper'}
                </button>
              )}
            </div>
          ) : (
            filteredSubmissions.map((sub) => {
              const statusInfo = getStatusInfo(sub.status);
              const StatusIcon = statusInfo.icon;
              
              return (
                <div key={sub.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-[#2C7A7B]/50 hover:shadow-md transition-all">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    {/* Paper Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${statusInfo.bg}`}>
                          <StatusIcon className={`w-6 h-6 ${statusInfo.text}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-gray-900 truncate">
                              {sub.title}
                            </h3>
                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusInfo.bg} ${statusInfo.text}`}>
                              {statusInfo.text}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                            {sub.conference?.name && (
                              <div className="flex items-center gap-2">
                                <Award className="w-4 h-4" />
                                <span>{sub.conference.name}</span>
                              </div>
                            )}
                            {sub.track?.name && (
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                <span>{sub.track.name}</span>
                              </div>
                            )}
                            {sub.submitted_at && (
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>
                                  {new Date(sub.submitted_at).toLocaleDateString('vi-VN')}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Authors */}
                          {sub.authors && sub.authors.length > 0 && (
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-gray-400" />
                              <div className="flex flex-wrap gap-2">
                                {sub.authors.slice(0, 3).map((author, idx) => (
                                  <span key={idx} className="text-sm text-gray-600">
                                    {author.name}
                                    {idx < Math.min(sub.authors.length, 3) - 1 && ', '}
                                  </span>
                                ))}
                                {sub.authors.length > 3 && (
                                  <span className="text-sm text-gray-500">
                                    +{sub.authors.length - 3}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {/* View Details */}
                        <button 
                          onClick={() => navigate(`/dashboard/submission/${sub.id}`)}
                          className="flex items-center gap-2 px-4 py-2 bg-[#2C7A7B]/10 text-[#2C7A7B] rounded-lg font-medium hover:bg-[#2C7A7B]/20 transition-colors"
                          title={language === 'VI' ? 'Xem chi tiết' : 'View Details'}
                        >
                          <Eye className="w-4 h-4" />
                          <span className="hidden sm:inline">
                            {language === 'VI' ? 'Chi tiết' : 'Details'}
                          </span>
                        </button>
                        
                        {/* Edit Button - only for actionable papers */}
                        {canEdit(sub.status) && (
                          <button 
                            onClick={() => navigate(`/dashboard/submission/edit/${sub.id}`)}
                            className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 rounded-lg font-medium hover:bg-amber-100 transition-colors"
                            title={language === 'VI' ? 'Sửa bài' : 'Edit Paper'}
                          >
                            <Edit className="w-4 h-4" />
                            <span className="hidden sm:inline">
                              {language === 'VI' ? 'Sửa' : 'Edit'}
                            </span>
                          </button>
                        )}

                        {/* Reviews/Comments */}
                        {(sub.status?.toLowerCase() === 'under review' || sub.status?.toLowerCase() === 'accept' || sub.status?.toLowerCase() === 'reject') && (
                          <button 
                            onClick={() => navigate(`/dashboard/submission/${sub.id}/reviews`)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-colors"
                            title={language === 'VI' ? 'Xem phản biện' : 'View Reviews'}
                          >
                            <MessageSquare className="w-4 h-4" />
                            <span className="hidden sm:inline">
                              {language === 'VI' ? 'Phản biện' : 'Reviews'}
                            </span>
                          </button>
                        )}

                        {/* Download/View File */}
                        {sub.file_url && (
                          <a 
                            href={sub.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                            title={language === 'VI' ? 'Xem file' : 'View File'}
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        )}

                        {/* Withdraw Button - only for actionable papers */}
                        {isActionable(sub.status) && (
                          <button 
                            disabled={loadingId === sub.id}
                            onClick={() => handleWithdraw(sub.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title={language === 'VI' ? 'Rút bài' : 'Withdraw Paper'}
                          >
                            {loadingId === sub.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                            <span className="hidden sm:inline">
                              {language === 'VI' ? 'Rút' : 'Withdraw'}
                            </span>
                          </button>
                        )}
                      </div>
                      
                      {/* View More Arrow */}
                      <button 
                        onClick={() => navigate(`/dashboard/submission/${sub.id}`)}
                        className="p-2 text-gray-400 hover:text-[#2C7A7B] hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Progress/Status Details */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        {sub.review_count > 0 && (
                          <div className="flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">
                              {sub.review_count} {language === 'VI' ? 'lượt phản biện' : 'reviews'}
                            </span>
                          </div>
                        )}
                        
                        {sub.average_score && (
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">
                              {language === 'VI' ? 'Điểm TB:' : 'Avg Score:'} {sub.average_score}/5
                            </span>
                          </div>
                        )}
                      </div>

                      {sub.status?.toLowerCase() === 'under review' && (
                        <div className="text-amber-600 text-sm font-medium">
                          {language === 'VI' 
                            ? '⏳ Đang chờ phản biện...' 
                            : '⏳ Awaiting reviews...'
                          }
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Summary Footer */}
      {filteredSubmissions.length > 0 && (
        <div className="bg-gradient-to-r from-[#1A365D] to-[#2C7A7B] rounded-xl p-6 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h3 className="text-lg font-bold mb-2">
                {language === 'VI' ? 'Tóm tắt bài nộp' : 'Submission Summary'}
              </h3>
              <p className="text-white/80">
                {language === 'VI' 
                  ? `Đang hiển thị ${filteredSubmissions.length} bài báo ${filter !== 'all' ? `(${filter})` : ''}`
                  : `Showing ${filteredSubmissions.length} papers ${filter !== 'all' ? `(${filter})` : ''}`
                }
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/dashboard/statistics')}
                className="px-6 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg font-medium hover:bg-white/30 transition-colors"
              >
                {language === 'VI' ? 'Xem thống kê' : 'View Statistics'}
              </button>
              <button 
                onClick={() => navigate('/dashboard/submission')}
                className="px-6 py-3 bg-white text-[#1A365D] rounded-lg font-bold hover:bg-white/90 transition-colors"
              >
                {language === 'VI' ? 'Nộp bài mới' : 'New Submission'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}