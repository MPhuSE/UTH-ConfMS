import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubmissionStore } from '../../../app/store/useSubmissionStore';
import { submissionService } from '../../../services/submissionService';
import { 
  Eye, Edit, Trash2, Loader2, Plus, Filter, Search, Calendar, 
  FileText, CheckCircle, Clock, XCircle, AlertCircle, Download, 
  MessageSquare, BarChart3, ChevronRight, Globe, Users, Award,
  Shield
} from 'lucide-react';
import { useAuthStore } from '../../../app/store/useAuthStore';

export default function MySubmissionsPage() {
  const navigate = useNavigate();
  const { submissions, fetchDashboardData } = useSubmissionStore();
  const { user } = useAuthStore();
  const [loadingId, setLoadingId] = useState(null);
  const [language, setLanguage] = useState('VI');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState({ total: 0, underReview: 0, accepted: 0, rejected: 0 });

  const getFileUrl = (submission) => submission?.file_url || submission?.file_path || "";

  useEffect(() => {
    fetchDashboardData('author');
  }, [fetchDashboardData]);

  useEffect(() => {
    const statsData = {
      total: submissions.length,
      underReview: submissions.filter(s => (s.status?.toLowerCase() || '').includes('review')).length,
      accepted: submissions.filter(s => {
        const decision = s.decision?.toLowerCase();
        const status = s.status?.toLowerCase();
        return decision === 'accepted' || status === 'accept' || status === 'accepted';
      }).length,
      rejected: submissions.filter(s => {
        const decision = s.decision?.toLowerCase();
        const status = s.status?.toLowerCase();
        return decision === 'rejected' || status === 'reject' || status === 'rejected';
      }).length
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
      alert(language === 'VI' ? "Đã rút bài thành công." : "Paper withdrawn successfully.");
      await fetchDashboardData('author');
    } catch (error) {
      alert(error.response?.data?.detail || (language === 'VI' ? "Lỗi khi rút bài." : "Error withdrawing paper."));
    } finally {
      setLoadingId(null);
    }
  };

  const getStatusInfo = (submission) => {
    const decision = submission?.decision?.toLowerCase();
    if (decision === 'accepted') {
      return { 
        text: language === 'VI' ? 'ĐÃ CHẤP NHẬN' : 'ACCEPTED', 
        bg: 'bg-linear-to-br from-emerald-100 to-emerald-50', 
        textCol: 'text-emerald-700', 
        border: 'border-emerald-200',
        icon: CheckCircle 
      };
    }
    if (decision === 'rejected') {
      return { 
        text: language === 'VI' ? 'BỊ TỪ CHỐI' : 'REJECTED', 
        bg: 'bg-linear-to-br from-rose-100 to-rose-50', 
        textCol: 'text-rose-700', 
        border: 'border-rose-200',
        icon: XCircle 
      };
    }

    const s = submission?.status?.toLowerCase() || '';
    const config = {
      'submitted': { 
        label: language === 'VI' ? 'ĐÃ NỘP' : 'SUBMITTED', 
        bg: 'bg-linear-to-br from-blue-100 to-blue-50',
        textCol: 'text-blue-700',
        border: 'border-blue-200',
        icon: Clock 
      },
      'under review': { 
        label: language === 'VI' ? 'ĐANG PHẢN BIỆN' : 'UNDER REVIEW', 
        bg: 'bg-linear-to-br from-amber-100 to-amber-50',
        textCol: 'text-amber-700',
        border: 'border-amber-200',
        icon: Clock 
      },
      'accept': { 
        label: language === 'VI' ? 'ĐÃ CHẤP NHẬN' : 'ACCEPTED', 
        bg: 'bg-linear-to-br from-emerald-100 to-emerald-50',
        textCol: 'text-emerald-700',
        border: 'border-emerald-200',
        icon: CheckCircle 
      },
      'accepted': { 
        label: language === 'VI' ? 'ĐÃ CHẤP NHẬN' : 'ACCEPTED', 
        bg: 'bg-linear-to-br from-emerald-100 to-emerald-50',
        textCol: 'text-emerald-700',
        border: 'border-emerald-200',
        icon: CheckCircle 
      },
      'reject': { 
        label: language === 'VI' ? 'BỊ TỪ CHỐI' : 'REJECTED', 
        bg: 'bg-linear-to-br from-rose-100 to-rose-50',
        textCol: 'text-rose-700',
        border: 'border-rose-200',
        icon: XCircle 
      },
      'rejected': { 
        label: language === 'VI' ? 'BỊ TỪ CHỐI' : 'REJECTED', 
        bg: 'bg-linear-to-br from-rose-100 to-rose-50',
        textCol: 'text-rose-700',
        border: 'border-rose-200',
        icon: XCircle 
      },
      'camera ready': { 
        label: language === 'VI' ? 'BẢN CUỐI' : 'CAMERA READY', 
        bg: 'bg-linear-to-br from-purple-100 to-purple-50',
        textCol: 'text-purple-700',
        border: 'border-purple-200',
        icon: CheckCircle 
      },
      'camera-ready submitted': { 
        label: language === 'VI' ? 'ĐÃ NỘP BẢN CUỐI' : 'CAMERA READY', 
        bg: 'bg-linear-to-br from-purple-100 to-purple-50',
        textCol: 'text-purple-700',
        border: 'border-purple-200',
        icon: CheckCircle 
      }
    };
    const res = config[s] || { 
      label: s.toUpperCase() || '---', 
      bg: 'bg-linear-to-br from-gray-100 to-gray-50',
      textCol: 'text-gray-700',
      border: 'border-gray-200',
      icon: AlertCircle 
    };
    return {
      text: res.label,
      bg: res.bg,
      textCol: res.textCol,
      border: res.border,
      icon: res.icon
    };
  };

  const filteredSubmissions = submissions.filter(sub => {
    const matchesFilter = filter === 'all' || sub.status?.toLowerCase() === filter;
    const matchesSearch = search === '' || 
      sub.title?.toLowerCase().includes(search.toLowerCase()) ||
      sub.conference?.name?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-linear-to-br from-[#0d9488]/5 via-white to-[#14b8a6]/5">
      

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FileText className="text-[#14b8a6]" size={32} /> 
              {language === 'VI' ? 'Bài báo của tôi' : 'My Submissions'}
            </h1>
            <p className="text-gray-500 mt-1">
              {language === 'VI' ? 'Quản lý và theo dõi bài nộp của bạn' : 'Manage and track your submissions'}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setLanguage(lang => lang === 'VI' ? 'EN' : 'VI')}
              className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 hover:border-[#14b8a6] transition-colors"
            >
              <span className="font-medium text-gray-700">{language}</span>
            </button>
            <button 
              onClick={() => navigate('/dashboard/results')} 
              className="bg-white border border-gray-200 px-5 py-2.5 rounded-lg font-semibold hover:border-[#14b8a6] hover:bg-gray-50 transition-all flex items-center gap-2"
            >
              <MessageSquare size={20} /> 
              {language === 'VI' ? 'Kết quả' : 'Results'}
            </button>
            <button 
              onClick={() => navigate('/dashboard/submission')} 
              className="bg-linear-to-br from-[#0d9488] to-[#14b8a6] text-white px-5 py-2.5 rounded-lg font-semibold hover:shadow-md transition-all flex items-center gap-2"
            >
              <Plus size={20} /> 
              {language === 'VI' ? 'Nộp bài mới' : 'New Submission'}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { 
              label: language === 'VI' ? 'Tổng số' : 'Total', 
              val: stats.total, 
              icon: FileText, 
              color: 'from-[#0d9488] to-[#14b8a6]',
              bg: 'from-[#0d9488]/10 to-[#14b8a6]/10',
              iconColor: 'text-[#14b8a6]'
            },
            { 
              label: language === 'VI' ? 'Đang phản biện' : 'Reviewing', 
              val: stats.underReview, 
              icon: Clock, 
              color: 'from-amber-500 to-amber-600',
              bg: 'from-amber-100 to-amber-50',
              iconColor: 'text-amber-600'
            },
            { 
              label: language === 'VI' ? 'Đã chấp nhận' : 'Accepted', 
              val: stats.accepted, 
              icon: CheckCircle, 
              color: 'from-emerald-500 to-emerald-600',
              bg: 'from-emerald-100 to-emerald-50',
              iconColor: 'text-emerald-600'
            },
            { 
              label: language === 'VI' ? 'Bị từ chối' : 'Rejected', 
              val: stats.rejected, 
              icon: XCircle, 
              color: 'from-rose-500 to-rose-600',
              bg: 'from-rose-100 to-rose-50',
              iconColor: 'text-rose-600'
            }
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-lg bg-linear-to-br ${item.bg}`}>
                  <item.icon className={`w-5 h-5 ${item.iconColor}`} />
                </div>
                <p className="text-3xl font-bold text-gray-900">{item.val}</p>
              </div>
              <p className="text-sm text-gray-600 font-medium">{item.label}</p>
            </div>
          ))}
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={language === 'VI' ? 'Tìm kiếm theo tiêu đề, hội nghị...' : 'Search by title, conference...'}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14b8a6] focus:border-transparent"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14b8a6] focus:border-transparent"
            >
              <option value="all">{language === 'VI' ? 'Tất cả' : 'All'}</option>
              <option value="submitted">{language === 'VI' ? 'Đã nộp' : 'Submitted'}</option>
              <option value="under review">{language === 'VI' ? 'Đang phản biện' : 'Under Review'}</option>
              <option value="accepted">{language === 'VI' ? 'Đã chấp nhận' : 'Accepted'}</option>
              <option value="rejected">{language === 'VI' ? 'Bị từ chối' : 'Rejected'}</option>
            </select>
          </div>
        </div>

        {/* Submissions List */}
        <div className="space-y-4">
          {filteredSubmissions.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                {language === 'VI' ? 'Chưa có bài nộp nào' : 'No submissions yet'}
              </h3>
              <p className="text-gray-500 mb-4">
                {language === 'VI' ? 'Bắt đầu nộp bài báo đầu tiên của bạn' : 'Start by submitting your first paper'}
              </p>
              <button 
                onClick={() => navigate('/dashboard/submission')}
                className="bg-linear-to-br from-[#0d9488] to-[#14b8a6] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-md transition-all"
              >
                {language === 'VI' ? 'Nộp bài mới' : 'New Submission'}
              </button>
            </div>
          ) : (
            filteredSubmissions.map((sub) => {
              const sInfo = getStatusInfo(sub);
              const StatusIcon = sInfo.icon;
              return (
                <div key={sub.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden">
                  <div className="p-6">
                    {/* Title and Status */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${sInfo.bg} ${sInfo.textCol} ${sInfo.border}`}>
                            {sInfo.text}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{sub.title}</h3>
                      </div>
                      <StatusIcon className={`w-6 h-6 ${sInfo.textCol} ml-4`} />
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="p-1.5 bg-gray-100 rounded">
                          <Award size={16} className="text-gray-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">{language === 'VI' ? 'Hội nghị' : 'Conference'}</p>
                          <p className="font-medium">{sub.conference?.name || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="p-1.5 bg-gray-100 rounded">
                          <Calendar size={16} className="text-gray-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">{language === 'VI' ? 'Ngày nộp' : 'Submitted'}</p>
                          <p className="font-medium">{new Date(sub.submitted_at).toLocaleDateString('vi-VN')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="p-1.5 bg-gray-100 rounded">
                          <Users size={16} className="text-gray-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">{language === 'VI' ? 'Tác giả' : 'Authors'}</p>
                          <p className="font-medium">{sub.authors?.length || 0} {language === 'VI' ? 'người' : 'authors'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                      <button 
                        onClick={() => navigate(`/dashboard/submission/${sub.id}`)} 
                        className="flex items-center gap-2 px-4 py-2 bg-linear-to-br from-[#0d9488]/10 to-[#14b8a6]/10 text-[#14b8a6] rounded-lg text-sm font-semibold hover:from-[#0d9488]/20 hover:to-[#14b8a6]/20 transition-colors"
                      >
                        <Eye size={16} /> {language === 'VI' ? 'Chi tiết' : 'Details'}
                      </button>
                      {sub.status?.toLowerCase() === 'submitted' && (
                        <button 
                          onClick={() => navigate(`/dashboard/submission/edit/${sub.id}`)} 
                          className="flex items-center gap-2 px-4 py-2 bg-linear-to-br from-amber-100 to-amber-50 text-amber-700 rounded-lg text-sm font-semibold hover:from-amber-200 hover:to-amber-100 transition-colors"
                        >
                          <Edit size={16} /> {language === 'VI' ? 'Chỉnh sửa' : 'Edit'}
                        </button>
                      )}
                      <button
                        onClick={() => submissionService.downloadPdf(sub.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-linear-to-br from-blue-100 to-blue-50 text-blue-700 rounded-lg text-sm font-semibold hover:from-blue-200 hover:to-blue-100 transition-colors"
                      >
                        <Download size={16} /> {language === 'VI' ? 'Tải PDF' : 'Download'}
                      </button>
                      {(sub.status?.toLowerCase() === 'submitted' || sub.status?.toLowerCase() === 'under review') && (
                        <button 
                          onClick={() => handleWithdraw(sub.id)} 
                          disabled={loadingId === sub.id}
                          className="flex items-center gap-2 px-4 py-2 bg-linear-to-br from-rose-100 to-rose-50 text-rose-700 rounded-lg text-sm font-semibold hover:from-rose-200 hover:to-rose-100 transition-colors disabled:opacity-50"
                        >
                          {loadingId === sub.id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                          {language === 'VI' ? 'Rút bài' : 'Withdraw'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}