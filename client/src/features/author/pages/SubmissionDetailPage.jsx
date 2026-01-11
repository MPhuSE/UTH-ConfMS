import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { submissionService } from "../../../services/submissionService";
import { ArrowLeft, Download, MessageSquare } from "lucide-react";

export default function SubmissionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    submissionService.getById(id).then(setData).catch(console.error);
  }, [id]);

  if (!data) return <div className="p-10 text-center">Đang tải...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-gray-800 mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
      </button>

      <div className="bg-white rounded-2xl shadow-sm border p-8">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-3xl font-bold text-gray-900 leading-tight">{data.title}</h1>
          <a 
            href={data.file_url} 
            target="_blank" 
            className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            <Download className="w-4 h-4 mr-2" /> Xem PDF
          </a>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8 pb-8 border-b">
          <div>
            <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Trạng thái</p>
            <p className="mt-1 font-semibold text-indigo-600">{data.status || "Chưa có kết quả"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Ngày nộp</p>
            <p className="mt-1 font-semibold">{new Date(data.created_at).toLocaleDateString('vi-VN')}</p>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-bold mb-3 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-indigo-500" /> Tóm tắt
          </h3>
          <p className="text-gray-700 leading-relaxed italic">{data.abstract}</p>
        </div>

        {/* Phần phản hồi của Reviewer (Nếu có) */}
        <div className="mt-10 pt-10 border-t">
          <h3 className="text-lg font-bold mb-4 flex items-center text-gray-800">
            <MessageSquare className="w-5 h-5 mr-2 text-indigo-500" /> Nhận xét từ hội đồng phản biện
          </h3>
          <div className="bg-gray-50 p-6 rounded-xl text-gray-500 text-center italic">
            Hiện chưa có nhận xét nào cho bài báo này.
          </div>
        </div>
      </div>
    </div>
  );
}