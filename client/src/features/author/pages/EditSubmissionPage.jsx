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
  }, [paperId]);

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
        <Loader2 className="animate-spin text-emerald-600" size={48} />
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
          <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-xl shadow-sm border border-emerald-100 hover:bg-emerald-50 transition-all hover:border-emerald-200">
            <ArrowLeft size={20} className="text-emerald-700" />
          </button>
          <h1 className="text-2xl font-black text-emerald-900 uppercase italic">Chỉnh Sửa Bài Nộp</h1>
        </div>
        
        <button 
          onClick={handleDelete}
          className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all border border-red-100 shadow-sm"
        >
          <Trash2 size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-[32px] shadow-2xl shadow-emerald-100/50 border border-emerald-50 overflow-hidden">
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
            <label className="text-[10px] font-black uppercase tracking-widest text-emerald-600 ml-1">Tiêu Đề Bài Báo</label>
            <input 
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full p-5 bg-emerald-50/50 rounded-2xl border-2 border-transparent focus:border-emerald-500 focus:bg-white transition-all font-bold text-emerald-900 placeholder-emerald-400/60"
              placeholder="Nhập tiêu đề bài báo..."
              required
            />
          </div>

          {/* Abstract */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-emerald-600 ml-1">Tóm Tắt</label>
            <textarea 
              rows="8"
              value={formData.abstract}
              onChange={(e) => setFormData({...formData, abstract: e.target.value})}
              className="w-full p-5 bg-emerald-50/50 rounded-2xl border-2 border-transparent focus:border-emerald-500 focus:bg-white transition-all font-medium text-emerald-800 leading-relaxed placeholder-emerald-400/60"
              placeholder="Nhập tóm tắt bài báo..."
              required
            />
          </div>

          {/* Co-authors */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-emerald-800 flex items-center gap-2">
                <UserPlus className="w-4 h-4" /> Danh sách đồng tác giả
              </h3>
              <button
                type="button"
                onClick={addAuthor}
                className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg font-bold hover:bg-emerald-100 border border-emerald-100 flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3 h-3" /> Thêm tác giả
              </button>
            </div>

            <div className="flex flex-col md:flex-row gap-3">
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm theo email hoặc tên để chọn đồng tác giả..."
                className="flex-1 p-2.5 border border-emerald-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 bg-white"
              />
              <button
                type="button"
                onClick={handleSearchUsers}
                disabled={searching}
                className="px-4 py-2.5 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold hover:bg-emerald-200 border border-emerald-200 disabled:opacity-50"
              >
                {searching ? "Đang tìm..." : "Tìm"}
              </button>
            </div>

            {searchResults.length > 0 && (
              <div className="border border-emerald-200 rounded-xl bg-emerald-50/50 shadow-sm divide-y divide-emerald-100">
                {searchResults.map((user) => (
                  <button
                    type="button"
                    key={user.id}
                    onClick={() => addAuthorFromSearch(user)}
                    className="w-full text-left px-4 py-2 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-colors"
                  >
                    {user.full_name || "N/A"} • {user.email} {user.affiliation ? `• ${user.affiliation}` : ""}
                  </button>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 gap-3">
              {formData.authors.map((author, index) => (
                <div key={index} className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 relative group transition-all hover:bg-emerald-50 hover:shadow-md hover:border-emerald-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      required
                      placeholder="Họ tên"
                      value={author.name}
                      onChange={(e) => updateAuthor(index, "name", e.target.value)}
                      className="p-2 border border-emerald-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-emerald-400 bg-white focus:bg-white placeholder-emerald-400/60"
                    />
                    <input
                      required
                      type="email"
                      placeholder="Email"
                      value={author.email}
                      onChange={(e) => updateAuthor(index, "email", e.target.value)}
                      className="p-2 border border-emerald-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-emerald-400 bg-white focus:bg-white placeholder-emerald-400/60"
                    />
                    <input
                      required
                      placeholder="Đơn vị công tác"
                      value={author.affiliation}
                      onChange={(e) => updateAuthor(index, "affiliation", e.target.value)}
                      className="p-2 border border-emerald-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-emerald-400 bg-white focus:bg-white placeholder-emerald-400/60"
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
                  <span className="text-[10px] font-black text-emerald-700/60 mt-2 block uppercase tracking-widest">
                    {index === 0 ? "Tác giả chính (Corresponding)" : `Đồng tác giả ${index}`}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* File Upload */}
          <div className="relative group">
            <div className={`p-8 border-2 border-dashed rounded-3xl transition-all text-center ${formData.file ? 'border-emerald-300 bg-emerald-50' : 'border-emerald-200 bg-emerald-50/50 group-hover:bg-emerald-100/50'}`}>
              {formData.file ? <CheckCircle className="mx-auto text-emerald-500 mb-3" size={32} /> : <FileUp className="mx-auto text-emerald-400 mb-3" size={32} />}
              <p className="text-sm font-black text-emerald-700">
                {formData.file ? "File mới sẵn sàng để tải lên" : "Tải lên phiên bản mới"}
              </p>
              <p className="text-xs text-emerald-500/70 mt-1">
                {formData.file ? `Kích thước: ${(formData.file.size / 1024 / 1024).toFixed(2)} MB` : "Chỉ chấp nhận file PDF"}
              </p>
              <input 
                type="file" 
                accept=".pdf"
                onChange={(e) => setFormData({...formData, file: e.target.files[0]})}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            {formData.file && (
              <p className="mt-2 text-center text-xs text-emerald-600 font-bold uppercase tracking-tighter">
                📄 {formData.file.name}
              </p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-8 bg-emerald-50/50 border-t border-emerald-100 flex gap-4">
          <button 
            type="submit" 
            disabled={isLoading || !canEdit}
            className={`flex-2 py-5 rounded-2xl font-black flex items-center justify-center gap-3 transition-all shadow-xl ${
              !canEdit 
                ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none" 
                : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200 hover:shadow-emerald-300 disabled:opacity-50"
            }`}
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            {isLoading ? "ĐANG CẬP NHẬT..." : !canEdit ? "KHÔNG THỂ CHỈNH SỬA" : "LƯU THAY ĐỔI"}
          </button>
          <button 
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 bg-white text-emerald-700 py-5 rounded-2xl font-black border border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 transition-all"
          >
            HỦY BỎ
          </button>
        </div>
      </form>
    </div>
  );
}