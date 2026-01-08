import { useEffect, useState } from "react";
import useSubmission from "./useSubmission";
import { useAuthStore } from "../../app/store/useAuthStore";
import { useNavigate } from "react-router-dom";

/**
 * Trang nộp bài cho Author
 * - Chọn hội nghị, track
 * - Nhập tiêu đề, abstract
 * - Upload file PDF
 * - Xem danh sách bài đã nộp của tôi, upload camera-ready khi được accept
 */
export default function PaperSubmissionPage() {
  const { role } = useAuthStore();
  const navigate = useNavigate();

  const {
    loading,
    error,
    conferences,
    mySubmissions,
    tracks,
    setTracks,
    fetchTracksByConference,
    fetchMySubmissions,
    submitPaper,
    uploadCameraReady,
  } = useSubmission();

  const [conferenceId, setConferenceId] = useState("");
  const [trackId, setTrackId] = useState("");
  const [title, setTitle] = useState("");
  const [abstract, setAbstract] = useState("");
  const [file, setFile] = useState(null);
  const [cameraReadyUploading, setCameraReadyUploading] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // load tracks when conference changes
  useEffect(() => {
    const loadTracks = async () => {
      if (!conferenceId) {
        setTracks([]);
        return;
      }
      const data = await fetchTracksByConference(conferenceId);
      setTracks(data);
    };
    loadTracks();
  }, [conferenceId, fetchTracksByConference, setTracks]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (role !== "author") return;
    if (!conferenceId || !trackId || !title || !file) {
      alert("Vui lòng nhập đủ thông tin và chọn file PDF.");
      return;
    }
    setSubmitting(true);
    try {
      await submitPaper({
        title,
        abstract,
        trackId,
        conferenceId,
        file,
      });
      await fetchMySubmissions();
      setTitle("");
      setAbstract("");
      setFile(null);
      alert("Nộp bài thành công!");
    } catch (err) {
      alert(err?.response?.data?.detail || "Nộp bài thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCameraReady = async (submissionId, fileInput) => {
    const f = fileInput?.files?.[0];
    if (!f) return;
    setCameraReadyUploading(submissionId);
    try {
      await uploadCameraReady({ submissionId, file: f });
      await fetchMySubmissions();
      alert("Upload camera-ready thành công!");
    } catch (err) {
      alert(err?.response?.data?.detail || "Upload camera-ready thất bại");
    } finally {
      setCameraReadyUploading(null);
      fileInput.value = "";
    }
  };

  if (role !== "author") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-2">
        <p className="text-lg font-semibold text-gray-800">Không có quyền truy cập</p>
        <p className="text-gray-600">Trang này chỉ dành cho tác giả.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-10">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">Nộp bài mới</h1>
        <p className="text-gray-600">Chọn hội nghị và track, sau đó upload file PDF.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white border rounded-lg p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hội nghị</label>
            <select
              value={conferenceId}
              onChange={(e) => setConferenceId(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">-- Chọn hội nghị --</option>
              {conferences.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Track</label>
            <select
              value={trackId}
              onChange={(e) => setTrackId(e.target.value)}
              className="w-full border rounded px-3 py-2"
              disabled={!conferenceId}
            >
              <option value="">-- Chọn track --</option>
              {tracks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tóm tắt</label>
          <textarea
            className="w-full border rounded px-3 py-2"
            rows={4}
            value={abstract}
            onChange={(e) => setAbstract(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">File PDF</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full"
            required
          />
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="submit"
            disabled={submitting || loading}
            className="px-5 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 disabled:opacity-60"
          >
            {submitting ? "Đang nộp..." : "Nộp bài"}
          </button>
          {loading && <span className="text-sm text-gray-500">Đang tải dữ liệu...</span>}
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
      </form>

      {/* Danh sách bài của tôi */}
      <div className="bg-white border rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Bài nộp của tôi</h2>
            <p className="text-sm text-gray-600">Xem trạng thái và upload camera-ready.</p>
          </div>
          <button
            onClick={() => fetchMySubmissions()}
            className="text-sm px-3 py-2 border rounded hover:bg-gray-50"
          >
            Làm mới
          </button>
        </div>

        {loading ? (
          <div className="py-6 text-center text-gray-500">Đang tải...</div>
        ) : mySubmissions.length === 0 ? (
          <div className="py-6 text-center text-gray-500">Chưa có bài nộp nào</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tiêu đề</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Conference</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Camera-ready</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mySubmissions.map((paper) => (
                  <tr key={paper.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{paper.title}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {paper.track?.conference?.name || paper.conference?.name || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-700">
                        {paper.status || "Submitted"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {paper.camera_ready_file ? "Đã có" : "Chưa có"}
                    </td>
                    <td className="px-4 py-3">
                      {paper.status?.toLowerCase().includes("accept") && (
                        <label className="text-sm text-teal-700 hover:text-teal-900 cursor-pointer">
                          <input
                            type="file"
                            accept="application/pdf"
                            className="hidden"
                            onChange={(e) => handleCameraReady(paper.id, e.target)}
                            disabled={cameraReadyUploading === paper.id}
                          />
                          {cameraReadyUploading === paper.id ? "Đang upload..." : "Upload camera-ready"}
                        </label>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
