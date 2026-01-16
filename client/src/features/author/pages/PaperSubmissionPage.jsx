import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { submissionService } from "../../../services/submissionService";
import { trackService } from "../../../services/trackService";
import { useConferenceStore } from "../../../app/store/useConferenceStore";
import {
  Loader2,
  Layout,
  CheckCircle2,
  Upload,
  ArrowLeft,
} from "lucide-react";

export default function PaperSubmissionPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // ===== ZUSTAND STORE =====
  const { conferences, fetchConferences, loading } = useConferenceStore();

  const [tracks, setTracks] = useState([]);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [formData, setFormData] = useState({
    conference_id: "",
    track_id: "",
    title: "",
    abstract: "",
    file: null,
    authors: [
      {
        name: "",
        email: "",
        affiliation: "",
        is_main: true,
      },
    ],
  });

  // ===== LOAD CONFERENCES =====
  useEffect(() => {
    fetchConferences();
  }, []);

  // ===== LOAD TRACKS KHI CHỌN CONFERENCE =====
  useEffect(() => {
    if (!formData.conference_id) {
      setTracks([]);
      return;
    }

    const loadTracks = async () => {
      try {
        const res = await trackService.getByConference(
          formData.conference_id
        );

        const data = Array.isArray(res)
          ? res
          : res?.items || res?.data || [];

        setTracks(data);
      } catch (err) {
        console.error("Load tracks error:", err);
        setTracks([]);
      }
    };

    loadTracks();
  }, [formData.conference_id]);

  // ===== SUBMIT =====
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.conference_id) return alert("Vui lòng chọn hội nghị");
    if (!formData.track_id) return alert("Vui lòng chọn track");
    if (!formData.file) return alert("Vui lòng upload file PDF");

    setSubmitLoading(true);

    const data = new FormData();
    data.append("conference_id", formData.conference_id);
    data.append("track_id", formData.track_id);
    data.append("title", formData.title);
    data.append("abstract", formData.abstract);
    data.append("file", formData.file);
    data.append("authors", JSON.stringify(formData.authors));

    try {
      await submissionService.submit(data);
      alert("Nộp bài thành công!");
      navigate("/dashboard/my-submissions");
    } catch (err) {
      alert(err.response?.data?.detail || "Nộp bài thất bại");
    } finally {
      setSubmitLoading(false);
    }
  };

  // ===== UI =====
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white shadow-2xl rounded-3xl overflow-hidden">
        <div className="bg-[#1e3a8a] p-6 text-white flex justify-between items-center">
          <h1 className="flex items-center gap-2 font-bold text-lg">
            <Layout /> Nộp bài mới
          </h1>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-sm hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* ===== CONFERENCE ===== */}
          <div>
            <label className="font-bold text-sm">Hội nghị *</label>
            <select
              required
              value={formData.conference_id}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  conference_id: Number(e.target.value),
                  track_id: "",
                })
              }
              className="w-full p-3 border rounded-xl"
            >
              <option value="">-- Chọn hội nghị --</option>

              {loading && <option disabled>Đang tải...</option>}

              {!loading && conferences.length === 0 && (
                <option disabled>Không có hội nghị</option>
              )}

              {!loading &&
                conferences.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
          </div>

          {/* ===== TRACK ===== */}
          <div>
            <label className="font-bold text-sm">Track *</label>
            <select
              required
              disabled={!formData.conference_id}
              value={formData.track_id}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  track_id: Number(e.target.value),
                })
              }
              className="w-full p-3 border rounded-xl disabled:opacity-50"
            >
              <option value="">-- Chọn track --</option>
              {tracks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* ===== TITLE ===== */}
          <div>
            <label className="font-bold text-sm">Tiêu đề *</label>
            <input
              required
              className="w-full p-3 border rounded-xl"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>

          {/* ===== ABSTRACT ===== */}
          <div>
            <label className="font-bold text-sm">Tóm tắt *</label>
            <textarea
              required
              rows={4}
              className="w-full p-3 border rounded-xl"
              value={formData.abstract}
              onChange={(e) =>
                setFormData({ ...formData, abstract: e.target.value })
              }
            />
          </div>

          {/* ===== FILE ===== */}
          <div
            onClick={() => fileInputRef.current.click()}
            className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:bg-gray-50"
          >
            <input
              ref={fileInputRef}
              type="file"
              hidden
              accept=".pdf"
              onChange={(e) =>
                setFormData({
                  ...formData,
                  file: e.target.files?.[0] || null,
                })
              }
            />
            <Upload className="mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-600">
              {formData.file ? formData.file.name : "Upload file PDF"}
            </p>
          </div>

          {/* ===== SUBMIT ===== */}
          <button
            disabled={submitLoading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold flex justify-center gap-2 hover:bg-blue-700 disabled:opacity-70"
          >
            {submitLoading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <CheckCircle2 />
            )}
            NỘP BÀI
          </button>
        </form>
      </div>
    </div>
  );
}
