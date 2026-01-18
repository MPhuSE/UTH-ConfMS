import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubmissionStore } from '../../../app/store/useSubmissionStore';
import { submissionService } from '../../../services/submissionService';
import { 
  Eye, Edit, Trash2, Loader2, Plus, Filter, Search, Calendar, 
  FileText, CheckCircle, Clock, XCircle, AlertCircle, Download, 
  MessageSquare, BarChart3, ChevronRight, Globe, Users, Award 
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

  // Helper: Biến URL PDF thành ảnh Thumbnail
  const getThumbnailUrl = (url) => {
    if (!url) return null;
    if (url.includes('.pdf')) {
      return url.replace('.pdf', '.jpg').replace('/upload/', '/upload/w_200,h_280,c_fill,pg_1/');
    }
    return url;
  };

  // Helper: Biến URL thành link ép tải về (Attachment)
  const getDownloadUrl = (url) => {
    if (!url) return "#";
    try {
      const parsed = new URL(url);
      let filename = decodeURIComponent(parsed.pathname.split("/").pop() || "paper.pdf");
      if (!filename.toLowerCase().endsWith(".pdf")) {
        filename = `${filename}.pdf`;
      }
      if (!parsed.pathname.includes("/upload/")) return url;
      if (parsed.pathname.includes("fl_attachment")) return url;
      const [prefix, suffix] = parsed.pathname.split("/upload/");
      parsed.pathname = `${prefix}/upload/fl_attachment:${filename}/${suffix}`;
      return parsed.toString();
    } catch (err) {
      return url;
    }
  };

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
      return { text: language === 'VI' ? 'ĐÃ CHẤP NHẬN' : 'ACCEPTED', bg: 'bg-green-100', textCol: 'text-green-700', icon: CheckCircle };
    }
    if (decision === 'rejected') {
      return { text: language === 'VI' ? 'BỊ TỪ CHỐI' : 'REJECTED', bg: 'bg-red-100', textCol: 'text-red-700', icon: XCircle };
    }

    const s = submission?.status?.toLowerCase() || '';
    const config = {
      'submitted': { label: language === 'VI' ? 'ĐÃ NỘP' : 'SUBMITTED', color: 'blue', icon: Clock },
      'under review': { label: language === 'VI' ? 'ĐANG PHẢN BIỆN' : 'UNDER REVIEW', color: 'yellow', icon: Clock },
      'accept': { label: language === 'VI' ? 'ĐÃ CHẤP NHẬN' : 'ACCEPTED', color: 'green', icon: CheckCircle },
      'accepted': { label: language === 'VI' ? 'ĐÃ CHẤP NHẬN' : 'ACCEPTED', color: 'green', icon: CheckCircle },
      'reject': { label: language === 'VI' ? 'BỊ TỪ CHỐI' : 'REJECTED', color: 'red', icon: XCircle },
      'rejected': { label: language === 'VI' ? 'BỊ TỪ CHỐI' : 'REJECTED', color: 'red', icon: XCircle },
      'camera ready': { label: language === 'VI' ? 'BẢN CUỐI' : 'CAMERA READY', color: 'purple', icon: CheckCircle },
      'camera-ready submitted': { label: language === 'VI' ? 'ĐÃ NỘP BẢN CUỐI' : 'CAMERA READY', color: 'purple', icon: CheckCircle }
    };
    const res = config[s] || { label: s.toUpperCase() || '---', color: 'gray', icon: AlertCircle };
    return {
      text: res.label,
      bg: `bg-${res.color}-100`,
      textCol: `text-${res.color}-700`,
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
    <div className="space-y-6 max-w-7xl mx-auto p-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <FileText className="text-[#2C7A7B]" /> {language === 'VI' ? 'Bài báo của tôi' : 'My Submissions'}
          </h1>
          <p className="text-gray-500">{language === 'VI' ? 'Quản lý bài nộp' : 'Manage your papers'}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setLanguage(l => l === 'VI' ? 'EN' : 'VI')} className="p-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Globe size={18} /> {language}
          </button>
          <button onClick={() => navigate('/dashboard/results')} className="bg-white border px-5 py-2.5 rounded-lg font-bold hover:bg-gray-50 transition-all flex items-center gap-2">
            <MessageSquare size={20} /> {language === 'VI' ? 'Kết quả & Reviews' : 'Results & Reviews'}
          </button>
          <button onClick={() => navigate('/dashboard/submission')} className="bg-[#2C7A7B] text-white px-5 py-2.5 rounded-lg font-bold hover:bg-[#1A365D] transition-all flex items-center gap-2">
            <Plus size={20} /> {language === 'VI' ? 'Nộp bài mới' : 'New Submission'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total', val: stats.total, icon: FileText, color: 'blue' },
          { label: 'Reviewing', val: stats.underReview, icon: Clock, color: 'yellow' },
          { label: 'Accepted', val: stats.accepted, icon: CheckCircle, color: 'green' },
          { label: 'Rejected', val: stats.rejected, icon: XCircle, color: 'red' }
        ].map((item, i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase">{item.label}</p>
              <p className="text-2xl font-black">{item.val}</p>
            </div>
            <item.icon className={`w-8 h-8 text-${item.color}-500 opacity-30`} />
          </div>
        ))}
      </div>

      {/* List */}
      <div className="space-y-4">
        {filteredSubmissions.map((sub) => {
          const sInfo = getStatusInfo(sub);
          const StatusIcon = sInfo.icon;
          return (
            <div key={sub.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
              <div className="flex flex-col md:flex-row">
                {/* PDF Thumbnail */}
                <div className="w-full md:w-32 bg-gray-50 flex items-center justify-center border-r border-gray-50">
                  {getFileUrl(sub) ? (
                    <img src={getThumbnailUrl(getFileUrl(sub))} alt="PDF" className="w-full h-full object-cover" />
                  ) : (
                    <FileText size={40} className="text-gray-200" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 p-5">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded ${sInfo.bg} ${sInfo.textCol}`}>
                      {sInfo.text}
                    </span>
                    <h3 className="text-lg font-bold text-gray-900">{sub.title}</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-2"><Award size={14} /> {sub.conference?.name || 'N/A'}</div>
                    <div className="flex items-center gap-2"><Calendar size={14} /> {new Date(sub.submitted_at).toLocaleDateString()}</div>
                    <div className="flex items-center gap-2"><Users size={14} /> {sub.authors?.length} {language === 'VI' ? 'tác giả' : 'authors'}</div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => navigate(`/dashboard/submission/${sub.id}`)} className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-md text-xs font-bold hover:bg-gray-200">
                      <Eye size={14} /> {language === 'VI' ? 'Chi tiết' : 'Details'}
                    </button>
                    {sub.status?.toLowerCase() === 'submitted' && (
                      <button onClick={() => navigate(`/dashboard/submission/edit/${sub.id}`)} className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-md text-xs font-bold hover:bg-amber-200">
                        <Edit size={14} /> {language === 'VI' ? 'Sửa' : 'Edit'}
                      </button>
                    )}
                    <a
                      href={getDownloadUrl(getFileUrl(sub))}
                      download
                      className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-md text-xs font-bold hover:bg-blue-200"
                    >
                      <Download size={14} /> {language === 'VI' ? 'Tải PDF' : 'Download'}
                    </a>
                    {(sub.status?.toLowerCase() === 'submitted' || sub.status?.toLowerCase() === 'under review') && (
                      <button 
                        onClick={() => handleWithdraw(sub.id)} 
                        disabled={loadingId === sub.id}
                        className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-md text-xs font-bold hover:bg-red-100"
                      >
                        {loadingId === sub.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} {language === 'VI' ? 'Rút bài' : 'Withdraw'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}