import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { submissionService } from "../../../services/submissionService";
import { userService } from "../../../services/userService";
import { trackService } from "../../../services/trackService";
import { useConferenceStore } from "../../../app/store/useConferenceStore";
import {
  Loader2,
  Layout,
  CheckCircle2,
  Upload,
  ArrowLeft,
  FileText,
  Eye,
  Plus,
  Trash2,
  UserPlus,
  AlertCircle,
  Clock
} from "lucide-react";
import AuthorAISupport from "../../../components/AI/AuthorAISupport";

export default function PaperSubmissionPage() {
  const { paperId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const isEditMode = Boolean(paperId);


  const confIdFromUrl = searchParams.get("confId");

  const { conferences, fetchConferences, loading } = useConferenceStore();
  const [tracks, setTracks] = useState([]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(isEditMode);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const [formData, setFormData] = useState({
    conference_id: confIdFromUrl ? Number(confIdFromUrl) : "",
    track_id: "",
    title: "",
    abstract: "",
    file: null,
    authors: [{ name: "", email: "", is_main: true }]
  });

  useEffect(() => {
    fetchConferences();
    if (isEditMode) {
      loadOldPaper();
    } else {
      loadCurrentUser();
    }
  }, [paperId]);

  const loadCurrentUser = async () => {
    try {
      const user = await userService.getMe();
      if (user) {
        setFormData(prev => ({
          ...prev,
          authors: [{
            name: user.full_name || "",
            email: user.email || "",
            is_main: true
          }]
        }));
      }
    } catch (err) {
      console.error("Không thể tải thông tin người dùng:", err);
    }
  };

  const loadOldPaper = async () => {
    try {
      const res = await submissionService.getById(paperId);
      const paper = res.data;
      setFormData({
        conference_id: paper.conference_id,
        track_id: paper.track_id,
        title: paper.title,
        abstract: paper.abstract,
        file: null,
        authors: paper.authors || [{ name: "", email: "", is_main: true }]
      });
      if (paper.file_url || paper.file_path) setPdfPreviewUrl(paper.file_url || paper.file_path);
    } catch (err) {
      console.error(err);
    } finally {
      setFetchingData(false);
    }
  };

  useEffect(() => {
    if (!formData.conference_id) return;
    const loadTracks = async () => {
      try {
        const res = await trackService.getByConference(formData.conference_id);
        setTracks(Array.isArray(res) ? res : res?.items || res?.data || []);
      } catch (err) { setTracks([]); }
    };
    loadTracks();
  }, [formData.conference_id]);

  const selectedConf = conferences.find(c => c.id === formData.conference_id);
  const isExpired = selectedConf && new Date() > new Date(selectedConf.submission_deadline);
  const isClosed = selectedConf && !selectedConf.is_open;

  const addAuthor = () => {
    setFormData({
      ...formData,
      authors: [...formData.authors, { name: "", email: "", is_main: false }]
    });
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
          is_main: false
        }
      ]
    });
    setSearchTerm("");
    setSearchResults([]);
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

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      alert("Chỉ chấp nhận file PDF (.pdf)");
      e.target.value = "";
      return;
    }

    if (file.type && file.type !== "application/pdf") {
      alert("Chỉ chấp nhận file PDF. File hiện tại không phải PDF.");
      e.target.value = "";
      return;
    }

    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      alert(`File quá lớn. Kích thước tối đa: 10MB. File hiện tại: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
      e.target.value = "";
      return;
    }

    setFormData({ ...formData, file });
    const url = URL.createObjectURL(file);
    setPdfPreviewUrl(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isExpired || isClosed) {
      alert("Lỗi: Hội nghị đã đóng hoặc hết hạn nhận bài. Bạn không thể thực hiện thao tác này.");
      return;
    }

    setSubmitLoading(true);
    const data = new FormData();
    data.append("conference_id", formData.conference_id);
    data.append("track_id", formData.track_id);
    data.append("title", formData.title);
    data.append("abstract", formData.abstract);
    if (formData.file) data.append("file", formData.file);
    data.append("authors", JSON.stringify(formData.authors));

    try {
      if (isEditMode) {
        await submissionService.update(paperId, data);
        alert("Cập nhật thành công!");
      } else {
        await submissionService.submit(data);
        alert("Nộp bài thành công!");
      }
      navigate("/dashboard/my-submissions");
    } catch (err) {
      const detail = err?.response?.data?.detail;
      let message = "Thao tác thất bại";
      if (typeof detail === "string") {
        message = detail;
      } else if (Array.isArray(detail)) {
        const msgs = detail.map((d) => d?.msg || d?.message).filter(Boolean);
        message = msgs.length ? msgs.join(", ") : message;
      } else if (detail && typeof detail === "object") {
        message = detail.message || detail.error || message;
      }
      alert(message);
    } finally { setSubmitLoading(false); }
  };

  if (fetchingData) return <div className="flex justify-center p-20"><Loader2 className="animate-spin" style={{ color: 'rgb(0,134,137)' }} /></div>;

  return (
    <div className="max-w-[1400px] mx-auto p-4 lg:p-6 grid grid-cols-1 xl:grid-cols-5 gap-6">
      {/* CỘT TRÁI: FORM */}
      <div className="xl:col-span-3 space-y-6">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border" style={{ borderColor: 'rgba(0,134,137,0.1)' }}>
          <div className="p-5 text-white flex justify-between items-center" style={{ background: 'linear-gradient(to right, rgb(0,134,137), rgb(0,154,157))' }}>
            <h1 className="flex items-center gap-2 font-bold"><Layout className="w-5 h-5" /> {isEditMode ? "Chỉnh sửa bài báo" : "Nộp bài báo mới"}</h1>
            <button onClick={() => navigate(-1)} className="text-xs flex items-center gap-1 hover:underline opacity-90 hover:opacity-100"><ArrowLeft className="w-4 h-4" /> Quay lại</button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {(isExpired || isClosed) && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-700 shadow-sm">
                <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-sm">Hội nghị hiện không nhận bài nộp</p>
                  <p className="text-xs opacity-80">Lý do: {isExpired ? "Đã quá hạn chót nộp bài." : "Hội nghị đang tạm đóng."}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold mb-1 uppercase" style={{ color: 'rgb(0,134,137)' }}>Hội nghị *</label>
                <select
                  required
                  value={formData.conference_id}
                  onChange={(e) => setFormData({ ...formData, conference_id: Number(e.target.value), track_id: "" })}
                  className="w-full p-2.5 border rounded-lg outline-none transition-all focus:bg-white"
                  style={{
                    borderColor: 'rgba(0,134,137,0.3)',
                    backgroundColor: 'rgba(0,134,137,0.05)'
                  }}
                  onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px rgba(0,134,137,0.2)'}
                  onBlur={(e) => e.target.style.boxShadow = 'none'}
                >
                  <option value="">-- Chọn hội nghị --</option>
                  {conferences.map((c) => {
                    const expired = new Date() > new Date(c.submission_deadline);
                    const disabled = !c.is_open || expired;
                    return (
                      <option key={c.id} value={c.id} disabled={disabled && !isEditMode} className={disabled ? "text-gray-400" : ""}>
                        {c.name} {disabled ? "(Đã đóng)" : ""}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1 uppercase" style={{ color: 'rgb(0,134,137)' }}>Track *</label>
                <select
                  required
                  value={formData.track_id}
                  onChange={(e) => setFormData({ ...formData, track_id: Number(e.target.value) })}
                  className="w-full p-2.5 border rounded-lg outline-none transition-all focus:bg-white"
                  style={{
                    borderColor: 'rgba(0,134,137,0.3)',
                    backgroundColor: 'rgba(0,134,137,0.05)'
                  }}
                  onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px rgba(0,134,137,0.2)'}
                  onBlur={(e) => e.target.style.boxShadow = 'none'}
                >
                  <option value="">-- Chọn track --</option>
                  {tracks.map((t) => (<option key={t.id} value={t.id}>{t.name}</option>))}
                </select>
              </div>
            </div>

            {selectedConf && (
              <div className="inline-flex items-center gap-2 text-[11px] font-bold p-2 rounded-lg border" style={{ color: 'rgb(0,134,137)', backgroundColor: 'rgba(0,134,137,0.05)', borderColor: 'rgba(0,134,137,0.2)' }}>
                <Clock className="w-3.5 h-3.5" />
                Hạn chót: {new Date(selectedConf.submission_deadline).toLocaleString('vi-VN')}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold mb-1 uppercase" style={{ color: 'rgb(0,134,137)' }}>Tiêu đề bài báo *</label>
              <input
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full p-2.5 border rounded-lg outline-none transition-all focus:bg-white"
                placeholder="Nhập tiêu đề bài báo..."
                style={{
                  borderColor: 'rgba(0,134,137,0.3)',
                  backgroundColor: 'rgba(0,134,137,0.05)'
                }}
                onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px rgba(0,134,137,0.2)'}
                onBlur={(e) => e.target.style.boxShadow = 'none'}
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1 uppercase" style={{ color: 'rgb(0,134,137)' }}>Tóm tắt *</label>
              <textarea
                required
                rows={4}
                value={formData.abstract}
                onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
                className="w-full p-2.5 border rounded-lg outline-none transition-all focus:bg-white"
                placeholder="Nhập tóm tắt (Abstract)..."
                style={{
                  borderColor: 'rgba(0,134,137,0.3)',
                  backgroundColor: 'rgba(0,134,137,0.05)'
                }}
                onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px rgba(0,134,137,0.2)'}
                onBlur={(e) => e.target.style.boxShadow = 'none'}
              />
              <AuthorAISupport
                text={formData.abstract}
                onApplyRevision={(revised) => setFormData({ ...formData, abstract: revised })}
              />
            </div>

            {/* PHẦN ĐỒNG TÁC GIẢ */}
            <div className="space-y-4 pt-4 border-t" style={{ borderColor: 'rgba(0,134,137,0.15)' }}>
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: 'rgb(0,100,103)' }}><UserPlus className="w-4 h-4" /> Danh sách tác giả</h3>
                <button
                  type="button"
                  onClick={addAuthor}
                  className="text-xs px-3 py-1.5 rounded-lg font-bold border flex items-center gap-1 transition-colors hover:opacity-80"
                  style={{
                    backgroundColor: 'rgba(0,134,137,0.05)',
                    color: 'rgb(0,134,137)',
                    borderColor: 'rgba(0,134,137,0.3)'
                  }}
                >
                  <Plus className="w-3 h-3" /> Thêm tác giả
                </button>
              </div>

              <div className="flex flex-col md:flex-row gap-3">
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm theo email hoặc tên để chọn đồng tác giả..."
                  className="flex-1 p-2.5 border rounded-lg text-sm outline-none bg-white"
                  style={{ borderColor: 'rgba(0,134,137,0.3)' }}
                  onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px rgba(0,134,137,0.2)'}
                  onBlur={(e) => e.target.style.boxShadow = 'none'}
                />
                <button
                  type="button"
                  onClick={handleSearchUsers}
                  disabled={searching}
                  className="px-4 py-2.5 rounded-lg text-xs font-bold border disabled:opacity-50"
                  style={{
                    backgroundColor: 'rgba(0,134,137,0.1)',
                    color: 'rgb(0,134,137)',
                    borderColor: 'rgba(0,134,137,0.3)'
                  }}
                >
                  {searching ? "Đang tìm..." : "Tìm"}
                </button>
              </div>

              {searchResults.length > 0 && (
                <div className="border rounded-xl shadow-sm divide-y" style={{ backgroundColor: 'rgba(0,134,137,0.05)', borderColor: 'rgba(0,134,137,0.3)' }}>
                  {searchResults.map((user) => (
                    <button
                      type="button"
                      key={user.id}
                      onClick={() => addAuthorFromSearch(user)}
                      className="w-full text-left px-4 py-2 text-xs font-bold transition-colors"
                      style={{ color: 'rgb(0,100,103)' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,134,137,0.15)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      {user.full_name || "N/A"} • {user.email}
                    </button>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 gap-3">
                {formData.authors.map((author, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl border relative group transition-all hover:shadow-md"
                    style={{
                      backgroundColor: 'rgba(0,134,137,0.04)',
                      borderColor: 'rgba(0,134,137,0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(0,134,137,0.08)';
                      e.currentTarget.style.borderColor = 'rgba(0,134,137,0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(0,134,137,0.04)';
                      e.currentTarget.style.borderColor = 'rgba(0,134,137,0.3)';
                    }}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        required
                        placeholder="Họ tên"
                        value={author.name}
                        onChange={(e) => updateAuthor(index, 'name', e.target.value)}
                        className="p-2 border rounded-lg text-sm outline-none bg-white"
                        style={{ borderColor: 'rgba(0,134,137,0.3)' }}
                        onFocus={(e) => e.target.style.boxShadow = '0 0 0 1px rgba(0,134,137,0.3)'}
                        onBlur={(e) => e.target.style.boxShadow = 'none'}
                      />
                      <input
                        required
                        type="email"
                        placeholder="Email"
                        value={author.email}
                        onChange={(e) => updateAuthor(index, 'email', e.target.value)}
                        className="p-2 border rounded-lg text-sm outline-none bg-white"
                        style={{ borderColor: 'rgba(0,134,137,0.3)' }}
                        onFocus={(e) => e.target.style.boxShadow = '0 0 0 1px rgba(0,134,137,0.3)'}
                        onBlur={(e) => e.target.style.boxShadow = 'none'}
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
                    <span className="text-[10px] font-black mt-2 block uppercase tracking-widest" style={{ color: 'rgba(0,134,137,0.7)' }}>
                      {index === 0 ? "Tác giả chính (Corresponding) - Người nộp bài" : `Đồng tác giả ${index}`}
                    </span>
                    {index === 0 && (
                      <p className="text-[9px] mt-1 italic" style={{ color: 'rgba(0,134,137,0.6)' }}>Thông tin này được tự động điền từ tài khoản của bạn</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <input
                ref={fileInputRef}
                type="file"
                hidden
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
              />
              <div
                onClick={() => fileInputRef.current.click()}
                className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all group"
                style={{
                  borderColor: 'rgba(0,134,137,0.4)',
                  backgroundColor: 'rgba(0,134,137,0.03)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(0,134,137,0.08)';
                  e.currentTarget.style.borderColor = 'rgba(0,134,137,0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(0,134,137,0.03)';
                  e.currentTarget.style.borderColor = 'rgba(0,134,137,0.4)';
                }}
              >
                <Upload className="mx-auto mb-2 w-8 h-8 group-hover:-translate-y-1 transition-transform" style={{ color: 'rgb(0,134,137)' }} />
                <p className="text-sm font-bold" style={{ color: 'rgb(0,100,103)' }}>
                  {formData.file ? formData.file.name : "Nhấp để tải lên bài báo (PDF)"}
                </p>
                <p className="text-[10px] mt-2" style={{ color: 'rgba(0,134,137,0.6)' }}>
                  Dung lượng tối đa 10MB • Chỉ chấp nhận file PDF (.pdf)
                </p>
                {formData.file && (
                  <p className="text-[10px] mt-1 font-bold" style={{ color: 'rgb(0,134,137)' }}>
                    ✓ File PDF hợp lệ: {(formData.file.size / 1024 / 1024).toFixed(2)}MB
                  </p>
                )}
              </div>
            </div>

            <button
              disabled={submitLoading || isExpired || isClosed}
              className={`w-full py-4 rounded-xl font-black text-sm tracking-widest flex justify-center gap-2 transition-all shadow-lg text-white ${(isExpired || isClosed)
                ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                : "active:scale-[0.98]"
                }`}
              style={
                (isExpired || isClosed)
                  ? {}
                  : {
                    background: 'linear-gradient(to right, rgb(0,134,137), rgb(0,154,157))',
                    boxShadow: '0 4px 14px 0 rgba(0,134,137,0.25)'
                  }
              }
              onMouseEnter={(e) => {
                if (!isExpired && !isClosed) {
                  e.currentTarget.style.background = 'linear-gradient(to right, rgb(0,114,117), rgb(0,134,137))';
                  e.currentTarget.style.boxShadow = '0 6px 20px 0 rgba(0,134,137,0.35)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isExpired && !isClosed) {
                  e.currentTarget.style.background = 'linear-gradient(to right, rgb(0,134,137), rgb(0,154,157))';
                  e.currentTarget.style.boxShadow = '0 4px 14px 0 rgba(0,134,137,0.25)';
                }
              }}
            >
              {submitLoading ? <Loader2 className="animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
              {isEditMode ? "CẬP NHẬT THAY ĐỔI" : "XÁC NHẬN NỘP BÀI BÁO"}
            </button>
          </form>
        </div>
      </div>

      {/* CỘT PHẢI: PREVIEW */}
      <div className="xl:col-span-2">
        <div
          className="rounded-2xl h-[calc(100vh-120px)] sticky top-6 flex flex-col shadow-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgb(0,134,137), rgb(0,114,117))',
            border: '1px solid rgba(0,134,137,0.3)'
          }}
        >
          <div className="p-4 border-b flex items-center justify-between" style={{ backgroundColor: 'rgba(0,0,0,0.2)', borderColor: 'rgba(255,255,255,0.1)' }}>
            <span className="flex items-center gap-2 font-bold text-white text-xs">
              <Eye className="w-4 h-4" />
              BẢN XEM TRƯỚC NỘI DUNG PDF
            </span>
          </div>

          <div className="flex-1 flex items-center justify-center relative" style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}>
            {pdfPreviewUrl ? (
              <iframe
                src={`${pdfPreviewUrl}#toolbar=0`}
                className="w-full h-full bg-white"
                title="PDF Preview"
              />
            ) : (
              <div className="text-center p-10 space-y-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                  <FileText className="w-8 h-8 text-white opacity-80" />
                </div>
                <div className="space-y-1">
                  <p className="text-white font-bold text-xs uppercase tracking-widest">CHƯA CHỌN FILE PDF</p>
                  <p className="text-white opacity-70 text-[10px] max-w-[200px] mx-auto">
                    Vui lòng chọn tệp ở bên trái để kiểm tra định dạng trước khi nộp.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}