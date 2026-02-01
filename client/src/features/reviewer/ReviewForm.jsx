import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { reviewService, submissionService } from "../../services";
import { toast } from "react-hot-toast";
import SummaryComponent from "../../components/AI/SummaryComponent";
import SpellCheckComponent from "../../components/AI/SpellCheckComponent";
import { FileText, Eye, Download, Info, CheckCircle, ArrowLeft, Loader2, Sparkles } from "lucide-react";

const ReviewForm = () => {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submission, setSubmission] = useState(null);
  const [subLoading, setSubLoading] = useState(false);
  const [formData, setFormData] = useState({
    score: 7,
    confidence: 5,
    summary: "",
    strengths: "",
    weaknesses: "",
    recommendation: "borderline",
    best_paper_recommendation: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.summary) {
      toast.error("Vui lòng điền Summary");
      return;
    }

    setLoading(true);
    const payload = {
      summary: formData.summary || null,
      strengths: formData.strengths || null,
      weaknesses: formData.weaknesses || null,
      confidence: formData.confidence || null,
      recommendation: formData.recommendation || "borderline",
      best_paper_recommendation: Boolean(formData.best_paper_recommendation),
      score: formData.score ? parseFloat(formData.score) : null,
    };

    try {
      await reviewService.submitReview(Number(submissionId), payload);
      toast.success("Gửi bài đánh giá thành công!");
      navigate("/dashboard/reviewer/dashboard");
    } catch (error) {
      toast.error(error?.response?.data?.detail || "Lỗi khi gửi review");
      console.error(error);
    } finally {
      setLoading(false);
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

  if (subLoading) return <div className="flex flex-col items-center justify-center h-screen gap-4">
    <Loader2 className="animate-spin text-blue-600" size={48} />
    <p className="text-gray-500 font-medium">Đang tải hồ sơ bài báo...</p>
  </div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Header Bar */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Đánh giá Bài báo #{submissionId}</h1>
            <p className="text-xs text-gray-500 truncate max-w-md">{submission?.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {fileUrl && (
            <button
              type="button"
              onClick={() => submissionService.downloadPdf(Number(submissionId))}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Tải PDF</span>
            </button>
          )}
          <button
            form="review-form"
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-all shadow-md"
          >
            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
            <span>Gửi Đánh Giá</span>
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden">
        {/* Left Panel: PDF Viewer */}
        <div className="h-[calc(100vh-73px)] border-r bg-gray-200 overflow-hidden relative group">
          {fileUrl ? (
            <iframe
              src={`${fileUrl}#toolbar=1`}
              className="w-full h-full bg-white"
              title="PDF Viewer"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 p-10 text-center">
              <FileText className="w-16 h-16 mb-4 opacity-20" />
              <p className="font-bold">KHÔNG CÓ FILE PDF</p>
              <p className="text-sm mt-2 opacity-60">Reviewer vui lòng liên hệ Ban tổ chức nếu file bị lỗi.</p>
            </div>
          )}
        </div>

        {/* Right Panel: Review Form & AI Summary */}
        <div className="h-[calc(100vh-73px)] overflow-y-auto bg-white p-6 lg:p-8 custom-scrollbar">
          <div className="max-w-2xl mx-auto space-y-8 pb-20">
            {/* AI Support Section */}
            <section className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100/50">
              <div className="flex items-center gap-2 mb-4 text-blue-800 font-bold">
                <Sparkles className="w-5 h-5" />
                <span>AI Review Assistant</span>
              </div>

              {submission?.abstract && (
                <SummaryComponent
                  text={submission.abstract}
                  maxWords={300}
                  onSummaryGenerated={(summary) => {
                    if (!formData.summary) setFormData(prev => ({ ...prev, summary }));
                  }}
                />
              )}
              <div className="mt-4 flex items-start gap-2 p-3 bg-white rounded-xl border border-blue-100 text-xs text-blue-600 italic">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <p>AI hỗ trợ tóm tắt abstract và trích xuất ý chính bài báo để giúp Reviewer nắm bắt nhanh nội dung.</p>
              </div>
            </section>

            <form id="review-form" onSubmit={handleSubmit} className="space-y-8">
              {/* Scoring Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Score (1-10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.score}
                    onChange={(e) => setFormData({ ...formData, score: Number(e.target.value) })}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all font-bold"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Confidence (1-10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.confidence}
                    onChange={(e) => setFormData({ ...formData, confidence: Number(e.target.value) })}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all font-bold"
                  />
                </div>
              </div>

              {/* Detailed Comments */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Summary of the paper <span className="text-red-500">*</span></label>
                  <textarea
                    rows="4"
                    value={formData.summary}
                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all min-h-[120px]"
                    placeholder="Tóm tắt ngắn gọn đóng góp của bài báo..."
                    required
                  />
                  <SpellCheckComponent text={formData.summary} onTextChange={(t) => setFormData({ ...formData, summary: t })} label="AI Check" />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Strengths</label>
                  <textarea
                    rows="4"
                    value={formData.strengths}
                    onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all min-h-[120px]"
                    placeholder="Các điểm mạnh của công trình này..."
                  />
                  <SpellCheckComponent text={formData.strengths} onTextChange={(t) => setFormData({ ...formData, strengths: t })} label="AI Check" />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Weaknesses & Suggestions</label>
                  <textarea
                    rows="4"
                    value={formData.weaknesses}
                    onChange={(e) => setFormData({ ...formData, weaknesses: e.target.value })}
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all min-h-[120px]"
                    placeholder="Các hạn chế và đề xuất cụ thể để tác giả cải thiện bài viết..."
                  />
                  <SpellCheckComponent text={formData.weaknesses} onTextChange={(t) => setFormData({ ...formData, weaknesses: t })} label="AI Check" />
                </div>
              </div>

              {/* Final Decision */}
              <div className="pt-6 border-t border-gray-100 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Overall Recommendation</label>
                  <select
                    value={formData.recommendation}
                    onChange={(e) => setFormData({ ...formData, recommendation: e.target.value })}
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-bold appearance-none cursor-pointer"
                  >
                    <option value="accept">Accept (Nhanh chóng chấp nhận)</option>
                    <option value="weak_accept">Weak Accept (Chấp nhận có điều kiện)</option>
                    <option value="borderline">Borderline (Đang xem xét)</option>
                    <option value="weak_reject">Weak Reject (Ưu tiên từ chối)</option>
                    <option value="reject">Reject (Từ chối thẳng)</option>
                  </select>
                </div>

                <label className="flex items-center gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded-md text-amber-600 border-amber-300 focus:ring-amber-500"
                    checked={formData.best_paper_recommendation}
                    onChange={(e) => setFormData({ ...formData, best_paper_recommendation: e.target.checked })}
                  />
                  <span className="text-sm font-bold text-amber-900">Đề cử Giải thưởng Bài báo xuất sắc nhất (Best Paper Reward)</span>
                </label>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewForm;