import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { reviewService, submissionService } from "../../services";
import { toast } from "react-hot-toast";

const ReviewForm = () => {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submission, setSubmission] = useState(null);
  const [subLoading, setSubLoading] = useState(false);
  const [formData, setFormData] = useState({
    score: 7,
    summary: "",
    weakness: "",
    best_paper_recommendation: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        summary: formData.summary,
        weakness: formData.weakness,
        best_paper_recommendation: Boolean(formData.best_paper_recommendation),
        answers: [
          // question_id=1 is used by server DecisionService as "score"
          { question_id: 1, answer: String(formData.score) },
        ],
      };
      await reviewService.submitReview(Number(submissionId), payload);
      toast.success("Gửi bài đánh giá thành công!");
      navigate("/dashboard/reviewer/dashboard");
    } catch (error) {
      const message = error?.response?.data?.detail || "Lỗi khi gửi review";
      toast.error(message);
      console.error("Submit review error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDownloadUrl = (url) => {
    if (!url) return "#";
    try {
      const parsed = new URL(url);
      let filename = decodeURIComponent(parsed.pathname.split("/").pop() || "paper.pdf");
      if (!filename.toLowerCase().endsWith(".pdf")) {
        filename = `${filename}.pdf`;
      }
      if (!parsed.pathname.includes("/upload/")) return url;
      if (parsed.pathname.includes("fl_attachment")) return url;
      const [prefix, suffix] = parsed.pathname.split("/upload/");
      parsed.pathname = `${prefix}/upload/fl_attachment:${filename}/${suffix}`;
      return parsed.toString();
    } catch (err) {
      return url;
    }
  };

  const fileUrl = submission?.file_url || submission?.file_path || "";

  useEffect(() => {
    const fetchSubmission = async () => {
      if (!submissionId) return;
      try {
        setSubLoading(true);
        const data = await submissionService.getById(Number(submissionId));
        setSubmission(data);
      } catch (error) {
        console.error("Load submission error:", error);
        toast.error("Không thể tải thông tin bài nộp");
      } finally {
        setSubLoading(false);
      }
    };
    fetchSubmission();
  }, [submissionId]);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Phiếu Đánh Giá Bài Báo #{submissionId}</h2>

      {submission && (
        <div className="mb-6 border rounded-lg p-4 bg-gray-50">
          <div className="text-sm text-gray-600">Tiêu đề:</div>
          <div className="font-semibold text-gray-900 mb-2">{submission.title}</div>
          {fileUrl ? (
            <a
              href={getDownloadUrl(fileUrl)}
              download
              className="inline-flex items-center gap-2 text-sm text-blue-700 hover:underline"
            >
              Tải PDF
            </a>
          ) : (
            <div className="text-sm text-gray-500">Không có file PDF</div>
          )}
        </div>
      )}
      {subLoading && <div className="text-sm text-gray-500 mb-4">Đang tải thông tin bài nộp...</div>}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Score (1-10)</label>
          <input
            type="number"
            min="1"
            max="10"
            value={formData.score}
            onChange={(e) => setFormData({ ...formData, score: Number(e.target.value) })}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Summary</label>
          <textarea
            rows="4"
            value={formData.summary}
            onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            placeholder="Tóm tắt nhận xét..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Weakness</label>
          <textarea
            rows="4"
            value={formData.weakness}
            onChange={(e) => setFormData({ ...formData, weakness: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            placeholder="Điểm yếu / góp ý cải thiện..."
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={formData.best_paper_recommendation}
            onChange={(e) =>
              setFormData({ ...formData, best_paper_recommendation: e.target.checked })
            }
          />
          Recommend as best paper
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Đang gửi...' : 'Gửi Đánh Giá'}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;