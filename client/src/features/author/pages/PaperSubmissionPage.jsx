import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { submissionService } from "../../../services/submissionService";
import { userService } from "../../../services/userService";
import { trackService } from "../../../services/trackService";
import { useConferenceStore } from "../../../app/store/useConferenceStore";
import SpellCheckComponent from "../../../components/AI/SpellCheckComponent";
import SummaryComponent from "../../../components/AI/SummaryComponent";
import KeywordsComponent from "../../../components/AI/KeywordsComponent";
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

export default function PaperSubmissionPage() {
  const { paperId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const isEditMode = Boolean(paperId);

  // Lấy ID hội nghị từ URL nếu có (ví dụ: /submission?confId=1)
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
    authors: [{ name: "", email: "", affiliation: "", is_main: true }]
  });

  useEffect(() => {
    fetchConferences();
    if (isEditMode) loadOldPaper();
  }, [paperId]);

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
        authors: paper.authors || [{ name: "", email: "", affiliation: "", is_main: true }]
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

  // Kiểm tra trạng thái hội nghị đang chọn
  const selectedConf = conferences.find(c => c.id === formData.conference_id);
  const isExpired = selectedConf && new Date() > new Date(selectedConf.submission_deadline);
  const isClosed = selectedConf && !selectedConf.is_open;

  // ===== XỬ LÝ TÁC GIẢ =====
  const addAuthor = () => {
    setFormData({
      ...formData,
      authors: [...formData.authors, { name: "", email: "", affiliation: "", is_main: false }]
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
          affiliation: user.affiliation || "",
          is_main: false
        }
      ]
    });
    setSearchTerm("");
    setSearchResults([]);
  };

  const removeAuthor = (index) => {
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

  // ===== XỬ LÝ PDF PREVIEW =====
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setFormData({ ...formData, file });
      const url = URL.createObjectURL(file);
      setPdfPreviewUrl(url);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // CHẶN SUBMIT NẾU QUÁ HẠN
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

  if (fetchingData) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div className="max-w-[1400px] mx-auto p-4 lg:p-6 grid grid-cols-1 xl:grid-cols-5 gap-6">
      {/* CỘT TRÁI: FORM */}
      <div className="xl:col-span-3 space-y-6">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
          <div className="bg-[#1e3a8a] p-5 text-white flex justify-between items-center">
            <h1 className="flex items-center gap-2 font-bold"><Layout className="w-5 h-5" /> {isEditMode ? "Chỉnh sửa bài báo" : "Nộp bài báo mới"}</h1>
            <button onClick={() => navigate(-1)} className="text-xs flex items-center gap-1 hover:underline opacity-80"><ArrowLeft className="w-4 h-4" /> Quay lại</button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* THÔNG BÁO NẾU HỘI NGHỊ ĐÃ ĐÓNG */}
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
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Hội nghị *</label>
                <select 
                  required 
                  value={formData.conference_id} 
                  onChange={(e) => setFormData({...formData, conference_id: Number(e.target.value), track_id: ""})} 
                  className="w-full p-2.5 border rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  <option value="">-- Chọn hội nghị --</option>
                  {conferences.map((c) => {
                    const expired = new Date() > new Date(c.submission_deadline);
                    const disabled = !c.is_open || expired;
                    return (
                      <option key={c.id} value={c.id} disabled={disabled && !isEditMode}>
                        {c.name} {disabled ? "(Đã đóng)" : ""}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Track *</label>
                <select required value={formData.track_id} onChange={(e) => setFormData({...formData, track_id: Number(e.target.value)})} className="w-full p-2.5 border rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">-- Chọn track --</option>
                  {tracks.map((t) => (<option key={t.id} value={t.id}>{t.name}</option>))}
                </select>
              </div>
            </div>

            {selectedConf && (
              <div className="inline-flex items-center gap-2 text-[11px] font-bold text-blue-600 bg-blue-50 p-2 rounded-lg">
                <Clock className="w-3.5 h-3.5" />
                Hạn chót: {new Date(selectedConf.submission_deadline).toLocaleString('vi-VN')}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Tiêu đề bài báo *</label>
              <input required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nhập tiêu đề bài báo..." />
              <div className="mt-2">
                <SpellCheckComponent
                  text={formData.title}
                  onTextChange={(correctedText) => setFormData({...formData, title: correctedText})}
                  label="Kiểm tra chính tả tiêu đề"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Tóm tắt *</label>
              <textarea required rows={4} value={formData.abstract} onChange={(e) => setFormData({...formData, abstract: e.target.value})} className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nhập tóm tắt (Abstract)..." />
              <div className="mt-2 space-y-2">
                <SpellCheckComponent
                  text={formData.abstract}
                  onTextChange={(correctedText) => setFormData({...formData, abstract: correctedText})}
                  label="Kiểm tra chính tả tóm tắt"
                />
                <SummaryComponent
                  text={formData.abstract}
                  maxWords={200}
                  onSummaryGenerated={(summary) => {
                    // Optional: có thể tự động thay thế abstract bằng summary
                    // setFormData({...formData, abstract: summary});
                  }}
                />
                <KeywordsComponent
                  text={formData.abstract}
                  onKeywordsExtracted={(keywords) => {
                    // Keywords có thể được lưu hoặc hiển thị
                    console.log("Extracted keywords:", keywords);
                  }}
                />
              </div>
            </div>

            {/* PHẦN ĐỒNG TÁC GIẢ */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-blue-900 flex items-center gap-2"><UserPlus className="w-4 h-4" /> Danh sách tác giả</h3>
                <button type="button" onClick={addAuthor} className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg font-bold hover:bg-blue-100 flex items-center gap-1 transition-colors"><Plus className="w-3 h-3" /> Thêm tác giả</button>
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
                      <input required placeholder="Họ tên" value={author.name} onChange={(e) => updateAuthor(index, 'name', e.target.value)} className="p-2 border rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-400 bg-transparent focus:bg-white" />
                      <input required type="email" placeholder="Email" value={author.email} onChange={(e) => updateAuthor(index, 'email', e.target.value)} className="p-2 border rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-400 bg-transparent focus:bg-white" />
                      <input required placeholder="Đơn vị công tác" value={author.affiliation} onChange={(e) => updateAuthor(index, 'affiliation', e.target.value)} className="p-2 border rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-400 bg-transparent focus:bg-white" />
                    </div>
                    {index > 0 && (
                      <button type="button" onClick={() => removeAuthor(index)} className="absolute -top-2 -right-2 bg-white text-red-500 p-1.5 rounded-full shadow-md border border-red-100 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-3 h-3" /></button>
                    )}
                    <span className="text-[10px] font-black text-blue-900/30 mt-2 block uppercase tracking-widest">{index === 0 ? "Tác giả chính (Corresponding)" : `Đồng tác giả ${index}`}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <input ref={fileInputRef} type="file" hidden accept=".pdf" onChange={handleFileChange} />
              <div onClick={() => fileInputRef.current.click()} className="border-2 border-dashed border-blue-200 bg-blue-50/30 rounded-xl p-8 text-center cursor-pointer hover:bg-blue-50 transition-all group">
                <Upload className="mx-auto mb-2 text-blue-400 w-8 h-8 group-hover:-translate-y-1 transition-transform" />
                <p className="text-sm font-bold text-blue-800">{formData.file ? formData.file.name : "Nhấp để tải lên bài báo (PDF)"}</p>
                <p className="text-[10px] text-gray-400 mt-2">Dung lượng tối đa 10MB • Định dạng .pdf duy nhất</p>
              </div>
            </div>

            <button 
              disabled={submitLoading || isExpired || isClosed} 
              className={`w-full py-4 rounded-xl font-black text-sm tracking-widest flex justify-center gap-2 transition-all shadow-lg ${
                (isExpired || isClosed) 
                ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none" 
                : "bg-blue-600 text-white hover:bg-blue-800 active:scale-[0.98]"
              }`}
            >
              {submitLoading ? <Loader2 className="animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
              {isEditMode ? "CẬP NHẬT THAY ĐỔI" : "XÁC NHẬN NỘP BÀI BÁO"}
            </button>
          </form>
        </div>
      </div>

      {/* CỘT PHẢI: PREVIEW */}
      <div className="xl:col-span-2">
        <div className="bg-gray-800 rounded-2xl border border-gray-700 h-[calc(100vh-120px)] sticky top-6 flex flex-col shadow-2xl overflow-hidden">
          <div className="p-4 bg-gray-900 border-b border-gray-700 flex items-center justify-between">
            <span className="flex items-center gap-2 font-bold text-gray-300 text-xs"><Eye className="w-4 h-4 text-blue-500" /> BẢN XEM TRƯỚC NỘI DUNG PDF</span>
          </div>
          
          <div className="flex-1 bg-gray-700 flex items-center justify-center relative">
            {pdfPreviewUrl ? (
              <iframe src={`${pdfPreviewUrl}#toolbar=0`} className="w-full h-full bg-white" title="PDF Preview" />
            ) : (
              <div className="text-center p-10 space-y-4">
                <div className="w-16 h-16 bg-gray-600/50 rounded-full flex items-center justify-center mx-auto"><FileText className="w-8 h-8 text-gray-500" /></div>
                <div className="space-y-1">
                  <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">No PDF Selected</p>
                  <p className="text-gray-500 text-[10px] max-w-[200px] mx-auto">Vui lòng chọn tệp ở bên trái để kiểm tra định dạng trước khi nộp.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}