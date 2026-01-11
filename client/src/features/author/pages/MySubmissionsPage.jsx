import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubmissionStore } from '../../../app/store/useSubmissionStore';
import { submissionService } from '../../../services/submissionService';
import { Eye, Edit, Trash2, Loader2 } from 'lucide-react';

export default function MySubmissionsPage() {
  const navigate = useNavigate();
  const { submissions, fetchDashboardData } = useSubmissionStore();
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    fetchDashboardData('author');
  }, [fetchDashboardData]);

  const handleWithdraw = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn rút bài báo này? Dữ liệu sẽ bị xóa vĩnh viễn.")) return;
    
    setLoadingId(id);
    try {
      await submissionService.delete(id);
      alert("Đã rút bài thành công.");
      await fetchDashboardData('author'); // Reload dữ liệu Store
    } catch (error) {
      alert(error.response?.data?.detail || "Lỗi khi rút bài. Có thể đã quá hạn chót.");
    } finally {
      setLoadingId(null);
    }
  };

  const isActionable = (status) => {
    const s = status?.toLowerCase();
    // Thường chỉ cho phép sửa/xóa khi bài vừa nộp hoặc đang chờ duyệt sơ bộ
    return s === 'submitted' || s === 'under review';
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Bài báo của tôi</h2>
        <button 
          onClick={() => navigate('/dashboard/submission')}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center shadow-sm"
        >
          + Nộp bài mới
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-600 text-sm">
            <tr>
              <th className="p-4 font-semibold">Tiêu đề</th>
              <th className="p-4 font-semibold text-center">Trạng thái</th>
              <th className="p-4 font-semibold text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {submissions.map((sub) => (
              <tr key={sub.id} className="hover:bg-slate-50 transition">
                <td className="p-4 font-medium text-gray-900">{sub.title}</td>
                <td className="p-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusStyle(sub.status)}`}>
                    {sub.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end space-x-2">
                    <button 
                      onClick={() => navigate(`/dashboard/submission/${sub.id}`)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="Xem chi tiết"
                    >
                      <Eye size={18} />
                    </button>
                    
                    {isActionable(sub.status) && (
                      <>
                        <button 
                          onClick={() => navigate(`/dashboard/submission/edit/${sub.id}`)}
                          className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg"
                          title="Sửa bài"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          disabled={loadingId === sub.id}
                          onClick={() => handleWithdraw(sub.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Rút bài"
                        >
                          {loadingId === sub.id ? <Loader2 className="animate-spin" size={18}/> : <Trash2 size={18} />}
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {submissions.length === 0 && (
          <div className="p-10 text-center text-gray-400 italic">Bạn chưa nộp bài báo nào.</div>
        )}
      </div>
    </div>
  );
}

function getStatusStyle(status) {
  const styles = {
    'submitted': 'bg-blue-100 text-blue-700',
    'under review': 'bg-yellow-100 text-yellow-700',
    'accept': 'bg-green-100 text-green-700',
    'reject': 'bg-red-100 text-red-700',
  };
  return styles[status?.toLowerCase()] || 'bg-gray-100 text-gray-700';
}