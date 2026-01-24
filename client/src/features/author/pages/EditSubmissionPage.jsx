import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSubmissionStore } from "../../../app/store/useSubmissionStore";
import { userService } from "../../../services/userService";
import { conferenceService } from "../../../services/conferenceService";
import { Save, Trash2, FileUp, ArrowLeft, Loader2, CheckCircle, UserPlus, Plus } from "lucide-react";
import StatusAlert from "../../../components/StatusAlert";
import { canEditSubmission, getSubmissionBlockReason } from "../../../utils/validationUtils";

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
    file: null,
    authors: [{ name: "", email: "", affiliation: "", is_main: true }]
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [conference, setConference] = useState(null);

  // 1. Tải dữ liệu khi mount
  useEffect(() => {
    if (paperId) {
      fetchSubmissionById(paperId);
    }
  }, [paperId]); // Chỉ chạy khi paperId thay đổi

  // 2. Cập nhật state nội bộ khi Store có dữ liệu mới
  useEffect(() => {
    if (currentSubmission) {
      const rawAuthors = currentSubmission.authors || [];
      const mappedAuthors = rawAuthors.length > 0
        ? rawAuthors.map((author, index) => ({
            name: author.name || author.full_name || "",
            email: author.email || "",
            affiliation: author.affiliation || "",
            is_main: author.is_main === true || author.order_index === 0 || index === 0
          }))
        : [{ name: "", email: "", affiliation: "", is_main: true }];

      setFormData({
        title: currentSubmission.title || "",
        abstract: currentSubmission.abstract || "",
        file: null,
        authors: mappedAuthors
      });

      // Load conference data for validation
      if (currentSubmission.conference_id) {
        conferenceService.getById(currentSubmission.conference_id)
          .then(setConference)
          .catch(err => console.error("Load conference error:", err));
      }
    }
  }, [currentSubmission]);

  // 3. Xử lý Cập nhật
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check validation
    if (!canEditSubmission(currentSubmission, conference)) {
      const reason = getSubmissionBlockReason(conference);
      alert(reason || "Không thể chỉnh sửa bài nộp này");
      return;
    }
    
    // Tạo FormData chuẩn để gửi lên Backend
    const data = new FormData();
    data.append("title", formData.title);
    data.append("abstract", formData.abstract);
    data.append("authors", JSON.stringify(formData.authors));
    
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

  // Check if can edit
  const canEdit = canEditSubmission(currentSubmission, conference);
  const blockReason = getSubmissionBlockReason(conference);

  const addAuthor = () => {
    setFormData({
      ...formData,
      authors: [...formData.authors, { name: "", email: "", affiliation: "", is_main: false }]
    });
  };

  const removeAuthor = (index) => {
    if (index === 0) return;
    const newAuthors = formData.authors.filter((_, i) => i !== index);
    setFormData({ ...formData, authors: newAuthors });
  };

  const updateAuthor = (index, field, value) => {
    const newAuthors = [...formData.authors];
    newAuthors[index][field] = value;
    setFormData({ ...formData, authors: newAuthors });
  };

  const addAuthorFromSearch = (user) => {
    const exists = formData.authors.some(a => (a.email || "").toLowerCase() === user.email.toLowerCase());
    if (exists) return;
    setFormData({
      ...formData,
      authors: [
        ...formData.authors,
        {
          name: user.full_name || "",
          email: user.email,
          affiliation: user.affiliation || "",
          is_main: false
        }
      ]
    });
    setSearchTerm("");
    setSearchResults([]);
  };

  const handleSearchUsers = async () => {
    if (!searchTerm.trim()) return;
    setSearching(true);
    try {
      const res = await userService.search({ q: searchTerm.trim(), limit: 10 });
      setSearchResults(res?.users || []);
    } catch (err) {
      setSearchResults([]);
    } finally {
      setSearching(false);
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
          {/* Status Alert */}
          {!canEdit && blockReason && (
            <StatusAlert
              type="error"
              title="Không thể chỉnh sửa bài nộp"
              message={blockReason}
            />
          )}
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

          {/* Co-authors */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-blue-900 flex items-center gap-2">
                <UserPlus className="w-4 h-4" /> Danh sách đồng tác giả
              </h3>
              <button
                type="button"
                onClick={addAuthor}
                className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg font-bold hover:bg-blue-100 flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3 h-3" /> Thêm tác giả
              </button>
            </div>

            <div className="flex flex-col md:flex-row gap-3">
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm theo email hoặc tên để chọn đồng tác giả..."
                className="flex-1 p-2.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleSearchUsers}
                className="px-4 py-2.5 bg-gray-100 rounded-lg text-xs font-bold hover:bg-gray-200"
              >
                {searching ? "Đang tìm..." : "Tìm"}
              </button>
            </div>

            {searchResults.length > 0 && (
              <div className="border rounded-xl bg-white shadow-sm divide-y">
                {searchResults.map((user) => (
                  <button
                    type="button"
                    key={user.id}
                    onClick={() => addAuthorFromSearch(user)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-xs font-bold"
                  >
                    {user.full_name || "N/A"} • {user.email} {user.affiliation ? `• ${user.affiliation}` : ""}
                  </button>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 gap-3">
              {formData.authors.map((author, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-xl border border-gray-200 relative group transition-all hover:bg-white hover:shadow-md">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      required
                      placeholder="Họ tên"
                      value={author.name}
                      onChange={(e) => updateAuthor(index, "name", e.target.value)}
                      className="p-2 border rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-400 bg-transparent focus:bg-white"
                    />
                    <input
                      required
                      type="email"
                      placeholder="Email"
                      value={author.email}
                      onChange={(e) => updateAuthor(index, "email", e.target.value)}
                      className="p-2 border rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-400 bg-transparent focus:bg-white"
                    />
                    <input
                      required
                      placeholder="Đơn vị công tác"
                      value={author.affiliation}
                      onChange={(e) => updateAuthor(index, "affiliation", e.target.value)}
                      className="p-2 border rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-400 bg-transparent focus:bg-white"
                    />
                  </div>
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => removeAuthor(index)}
                      className="absolute -top-2 -right-2 bg-white text-red-500 p-1.5 rounded-full shadow-md border border-red-100 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                  <span className="text-[10px] font-black text-blue-900/30 mt-2 block uppercase tracking-widest">
                    {index === 0 ? "Tác giả chính (Corresponding)" : `Đồng tác giả ${index}`}
                  </span>
                </div>
              ))}
            </div>
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
            disabled={isLoading || !canEdit}
            className={`flex-2 py-5 rounded-2xl font-black flex items-center justify-center gap-3 transition-all shadow-xl ${
              !canEdit 
                ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none" 
                : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200 disabled:opacity-50"
            }`}
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            {isLoading ? "UPDATING..." : !canEdit ? "KHÔNG THỂ CHỈNH SỬA" : "SAVE CHANGES"}
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