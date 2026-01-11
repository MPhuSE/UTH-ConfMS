import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { submissionService } from "../../../services/submissionService";
import { FileText, Plus, Eye, Clock, CheckCircle, XCircle } from "lucide-react";

export default function MySubmissionsPage() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const data = await submissionService.getMySubmissions();
      setSubmissions(data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách bài nộp:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-700",
      accepted: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-700",
    };
    return `px-3 py-1 rounded-full text-xs font-medium ${styles[status?.toLowerCase()] || "bg-gray-100 text-gray-700"}`;
  };

  if (loading) return <div className="p-10 text-center">Đang tải danh sách...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Bài nộp của tôi</h1>
          <p className="text-gray-500">Quản lý và theo dõi trạng thái các bài báo đã nộp</p>
        </div>
        <button
          onClick={() => navigate("/dashboard/submission")}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          <Plus className="w-5 h-5 mr-2" /> Nộp bài mới
        </button>
      </div>

      <div className="grid gap-4">
        {submissions.length > 0 ? (submissions.map((item) => (
          <div key={item.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{item.title}</h3>
                <div className="flex items-center space-x-3 mt-1 text-sm text-gray-500">
                  <span>ID: #{item.id}</span>
                  <span>•</span>
                  <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {new Date(item.created_at).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <span className={getStatusBadge(item.status)}>{item.status || "Đang chờ"}</span>
              <button 
                onClick={() => navigate(`/dashboard/submission/${item.id}`)}
                className="text-gray-400 hover:text-indigo-600 transition"
              >
                <Eye className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))) : (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed">
            <p className="text-gray-500">Bạn chưa có bài nộp nào.</p>
          </div>
        )}
      </div>
    </div>
  );
}