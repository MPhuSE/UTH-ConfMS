import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSubmissionStore } from "../../../app/store/useSubmissionStore";
import { Save, Trash2, FileUp, ArrowLeft, Loader2, CheckCircle } from "lucide-react";

export default function EditSubmissionPage() {
  const { paperId } = useParams(); 
  const navigate = useNavigate();
  
  const { 
    currentSubmission, 
    fetchSubmissionById, 
    updateSubmission, 
    deleteSubmission,
    isLoading,
    error 
  } = useSubmissionStore();
  
  const [formData, setFormData] = useState({
    title: "",
    abstract: "",
    file: null
  });

  // 1. Tải dữ liệu khi mount
  useEffect(() => {
    if (paperId) {
      fetchSubmissionById(paperId);
    }
  }, [paperId]); // Chỉ chạy khi paperId thay đổi

  // 2. Cập nhật state nội bộ khi Store có dữ liệu mới
  useEffect(() => {
    if (currentSubmission) {
      setFormData({
        title: currentSubmission.title || "",
        abstract: currentSubmission.abstract || "",
        file: null
      });
    }
  }, [currentSubmission]);

  // 3. Xử lý Cập nhật
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Tạo FormData chuẩn để gửi lên Backend
    const data = new FormData();
    data.append("title", formData.title);
    data.append("abstract", formData.abstract);
    
    // Chỉ gửi file nếu người dùng thực sự chọn file mới
    if (formData.file) {
      data.append("file", formData.file);
    }

    const success = await updateSubmission(paperId, data);
    
    if (success) {
      // Dùng timeout nhẹ để người dùng thấy feedback trước khi chuyển trang
      setTimeout(() => {
        navigate(`/dashboard/submission/${paperId}`);
      }, 500);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa vĩnh viễn bài nộp này?")) {
      const success = await deleteSubmission(paperId);
      if (success) navigate("/dashboard/submissions");
    }
  };

  // Màn hình loading khi đang tải dữ liệu ban đầu
  if (isLoading && !currentSubmission) {
    return (
      <div className="flex flex-col justify-center items-center h-screen gap-4">
        <Loader2 className="animate-spin text-blue-600" size={48} />
        <p className="text-gray-500 font-bold animate-pulse">ĐANG TẢI DỮ LIỆU...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      {/* Thông báo lỗi nếu có */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-xl font-medium">
          Lỗi: {error}
        </div>
      )}

      {/* Header Bar */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-xl shadow-sm border hover:bg-gray-50 transition-all">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-black text-gray-900 uppercase italic">Edit Manuscript</h1>
        </div>
        
        <button 
          onClick={handleDelete}
          className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all border border-red-100 shadow-sm"
        >
          <Trash2 size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-[32px] shadow-2xl shadow-blue-100/50 border border-gray-100 overflow-hidden">
        <div className="p-8 md:p-12 space-y-8">
          {/* Title */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Paper Title</label>
            <input 
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full p-5 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all font-bold text-gray-800"
              required
            />
          </div>

          {/* Abstract */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Abstract</label>
            <textarea 
              rows="8"
              value={formData.abstract}
              onChange={(e) => setFormData({...formData, abstract: e.target.value})}
              className="w-full p-5 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all font-medium text-gray-600 leading-relaxed"
              required
            />
          </div>

          {/* File Upload */}
          <div className="relative group">
            <div className={`p-8 border-2 border-dashed rounded-3xl transition-all text-center ${formData.file ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50 group-hover:bg-blue-50'}`}>
              {formData.file ? <CheckCircle className="mx-auto text-green-500 mb-3" size={32} /> : <FileUp className="mx-auto text-gray-400 mb-3" size={32} />}
              <p className="text-sm font-black text-gray-500">
                {formData.file ? "New file ready to upload" : "Upload New Revision"}
              </p>
              <input 
                type="file" 
                accept=".pdf"
                onChange={(e) => setFormData({...formData, file: e.target.files[0]})}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            {formData.file && (
              <p className="mt-2 text-center text-xs text-green-600 font-bold uppercase tracking-tighter">
                {formData.file.name}
              </p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-8 bg-gray-50 border-t border-gray-100 flex gap-4">
          <button 
            type="submit" 
            disabled={isLoading}
            className="flex-[2] bg-blue-600 text-white py-5 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            {isLoading ? "UPDATING..." : "SAVE CHANGES"}
          </button>
          <button 
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 bg-white text-gray-500 py-5 rounded-2xl font-black border border-gray-200 hover:bg-gray-100 transition-all"
          >
            CANCEL
          </button>
        </div>
      </form>
    </div>
  );
}