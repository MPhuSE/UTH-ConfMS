import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { submissionService } from '../../../services/submissionService';
import { Plus, Trash2, UserPlus, FileText, Loader2, ArrowLeft } from 'lucide-react';

export default function PaperSubmissionPage() {
  const { paperId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [tracks, setTracks] = useState([]);
  const [topics, setTopics] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    abstract: '',
    track_id: '',
    topic_id: '',
    conference_id: '1', // Thay đổi theo ID hội nghị thực tế của bạn
    file: null,
    authors: [{ name: '', email: '', affiliation: '', is_main: true }]
  });

  // 1. Tải Track khi mở trang
  useEffect(() => {
    const init = async () => {
      try {
        const tList = await submissionService.getTracksByConference(formData.conference_id);
        setTracks(tList);
        if (paperId) {
          const data = await submissionService.getById(paperId);
          setFormData({ ...data, file: null, authors: data.authors || formData.authors });
        }
      } catch (e) { console.error("Data load error", e); }
    };
    init();
  }, [paperId]);

  // 2. Tải Topic khi chọn Track
  useEffect(() => {
    if (formData.track_id) {
      submissionService.getTopicsByTrack(formData.track_id).then(setTopics).catch(() => setTopics([]));
    }
  }, [formData.track_id]);

  const addAuthor = () => setFormData({...formData, authors: [...formData.authors, { name: '', email: '', affiliation: '', is_main: false }]});
  
  const removeAuthor = (idx) => setFormData({...formData, authors: formData.authors.filter((_, i) => i !== idx)});

  const updateAuthor = (idx, field, val) => {
    const updated = [...formData.authors];
    updated[idx][field] = val;
    setFormData({...formData, authors: updated});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    data.append('title', formData.title);
    data.append('abstract', formData.abstract);
    data.append('track_id', formData.track_id);
    data.append('topic_id', formData.topic_id);
    data.append('conference_id', formData.conference_id);
    data.append('authors', JSON.stringify(formData.authors)); // Backend cần parse JSON này
    if (formData.file) data.append('file', formData.file);

    try {
      if (paperId) await submissionService.update(paperId, data);
      else await submissionService.submit(data);
      alert("Thành công!");
      navigate('/dashboard/my-submissions');
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.detail || "Không thể gửi bài"));
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-sm rounded-xl border mt-6">
      <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 mb-6 hover:text-indigo-600 transition">
        <ArrowLeft size={18} className="mr-2"/> Quay lại
      </button>

      <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center">
        <FileText className="mr-2 text-indigo-600" /> {paperId ? "Chỉnh sửa bài báo" : "Nộp bài nghiên cứu mới"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Phân loại */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-600">Track (Lĩnh vực) *</label>
            <select required className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
              value={formData.track_id} onChange={(e) => setFormData({...formData, track_id: e.target.value, topic_id: ''})}>
              <option value="">-- Chọn Track --</option>
              {tracks.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-600">Topic (Chủ đề) *</label>
            <select required disabled={!formData.track_id} className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-gray-50"
              value={formData.topic_id} onChange={(e) => setFormData({...formData, topic_id: e.target.value})}>
              <option value="">-- Chọn Topic --</option>
              {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        </div>

        {/* Nội dung */}
        <div className="space-y-4">
          <input required placeholder="Tiêu đề bài báo *" className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
          <textarea required placeholder="Tóm tắt (Abstract) *" rows={5} className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            value={formData.abstract} onChange={(e) => setFormData({...formData, abstract: e.target.value})} />
        </div>

        {/* Tác giả */}
        <div className="space-y-4 bg-gray-50 p-4 rounded-xl">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-gray-700 uppercase text-sm tracking-wider">Thông tin tác giả</h3>
            <button type="button" onClick={addAuthor} className="text-indigo-600 flex items-center text-sm font-bold">
              <UserPlus size={16} className="mr-1"/> Thêm tác giả
            </button>
          </div>
          {formData.authors.map((auth, idx) => (
            <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-white rounded-lg border relative">
              <input placeholder="Họ tên" required className="p-2 border rounded shadow-sm text-sm" value={auth.name} onChange={(e) => updateAuthor(idx, 'name', e.target.value)} />
              <input placeholder="Email" required type="email" className="p-2 border rounded shadow-sm text-sm" value={auth.email} onChange={(e) => updateAuthor(idx, 'email', e.target.value)} />
              <input placeholder="Đơn vị công tác" required className="p-2 border rounded shadow-sm text-sm" value={auth.affiliation} onChange={(e) => updateAuthor(idx, 'affiliation', e.target.value)} />
              {idx > 0 && (
                <button type="button" onClick={() => removeAuthor(idx)} className="absolute -top-2 -right-2 bg-white text-red-500 border border-red-100 rounded-full p-1 hover:bg-red-50">
                  <Trash2 size={14}/>
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Upload File */}
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-indigo-400 transition cursor-pointer bg-gray-50 relative">
          <input type="file" accept=".pdf" className="absolute inset-0 opacity-0 cursor-pointer" 
            onChange={(e) => setFormData({...formData, file: e.target.files[0]})} />
          <div className="text-indigo-600 font-bold underline">
            {formData.file ? formData.file.name : "Nhấn để chọn hoặc kéo thả file PDF bài báo vào đây"}
          </div>
          <p className="text-xs text-gray-400 mt-2 italic">Chỉ chấp nhận file định dạng PDF tối đa 15MB</p>
        </div>

        <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-indigo-700 disabled:opacity-50 flex justify-center items-center uppercase tracking-widest">
          {loading ? <Loader2 className="animate-spin mr-2"/> : null}
          {paperId ? "Lưu thay đổi" : "Nộp bài ngay"}
        </button>
      </form>
    </div>
  );
}