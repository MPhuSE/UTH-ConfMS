import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { submissionService } from "../../../services/submissionService";
import { ArrowLeft, Download, MessageSquare, FileText, Globe, Clock, AlertCircle } from "lucide-react";

export default function SubmissionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Gọi API lấy chi tiết bài nộp theo ID
    submissionService.getById(id)
      .then(setData)
      .catch((err) => {
        console.error("Lỗi:", err);
        setError("Không thể tải thông tin bài báo này.");
      });
  }, [id]);

  if (error) return (
    <div className="p-10 text-center flex flex-col items-center">
      <AlertCircle className="text-red-500 w-12 h-12 mb-2" />
      <p className="text-gray-600">{error}</p>
      <button onClick={() => navigate(-1)} className="mt-4 text-indigo-600 underline">Quay lại</button>
    </div>
  );

  if (!data) return (
    <div className="p-20 text-center text-gray-400 animate-pulse">
      Đang tải thông tin bài nộp...
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 animate-in fade-in duration-500">
      {/* Nút quay lại */}
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center text-gray-500 hover:text-indigo-600 mb-6 font-medium transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Dashboard
      </button>

      <div className="bg-white rounded-2xl shadow-sm border p-8">
        {/* Tiêu đề & Tải PDF */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
          <h1 className="text-2xl font-black text-gray-900 leading-tight flex-1">
            {data.title}
          </h1>
          <a 
            href={data.file_url || "#"} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors font-bold text-sm"
          >
            <Download className="w-4 h-4 mr-2" /> Tải bản PDF
          </a>
        </div>

        {/* Thông tin Meta: Hội nghị, Trạng thái, Ngày nộp */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 pb-8 border-b border-gray-100">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center">
              <Globe className="w-3 h-3 mr-1" /> Hội nghị
            </p>
            <p className="mt-1 font-semibold text-gray-800">
              {data.conference?.name || "UTH Scientific Conference"}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center">
              <Clock className="w-3 h-3 mr-1" /> Ngày nộp
            </p>
            <p className="mt-1 font-semibold text-gray-800">
              {new Date(data.created_at).toLocaleDateString('vi-VN')}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Trạng thái hiện tại</p>
            <span className={`mt-2 inline-block px-3 py-1 rounded-full text-xs font-bold ${
              data.status === 'Accepted' ? 'bg-green-100 text-green-700' : 
              data.status === 'Rejected' ? 'bg-red-100 text-red-700' : 
              'bg-amber-100 text-amber-700'
            }`}>
              {data.status || "Đang thẩm định"}
            </span>
          </div>
        </div>

        {/* Nội dung Tóm tắt */}
        <div className="mb-10">
          <h3 className="text-md font-bold mb-4 flex items-center text-gray-800">
            <FileText className="w-5 h-5 mr-2 text-indigo-500" /> Tóm tắt bài báo (Abstract)
          </h3>
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-50 shadow-inner">
            <p className="text-gray-700 leading-relaxed italic whitespace-pre-wrap">
              {data.abstract}
            </p>
          </div>
        </div>

        {/* Phần phản hồi của Reviewer */}
        <div className="mt-10 pt-10 border-t">
          <h3 className="text-md font-bold mb-6 flex items-center text-gray-800">
            <MessageSquare className="w-5 h-5 mr-2 text-indigo-500" /> Nhận xét từ hội đồng phản biện
          </h3>
          
          {data.reviews && data.reviews.length > 0 ? (
            <div className="space-y-4">
              {data.reviews.map((review, idx) => (
                <div key={idx} className="p-5 border rounded-xl bg-white shadow-sm border-gray-100">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-black text-indigo-500 uppercase tracking-tighter">Phản biện #{idx + 1}</span>
                    <span className="text-xs font-bold bg-gray-100 px-2 py-1 rounded">Điểm: {review.score}/5</span>
                  </div>
                  <p className="text-gray-600 text-sm italic leading-relaxed">
                    "{review.comment || review.content}"
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 p-8 rounded-2xl text-gray-400 text-center text-sm border-2 border-dashed">
              Hệ thống đang điều phối phản biện. Nhận xét ẩn danh sẽ xuất hiện tại đây sau khi có quyết định chính thức.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}