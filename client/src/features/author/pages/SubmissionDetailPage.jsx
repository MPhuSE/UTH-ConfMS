import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Download, FileText, Clock, Award, CheckCircle, XCircle, Calendar, Shield, Edit, User, UploadCloud, Loader2, MessageSquare, RefreshCw, Hash, MapPin, Layers
} from "lucide-react";
import { useSubmissionStore } from "../../../app/store/useSubmissionStore";
import { submissionService } from "../../../services/submissionService";

// Helper để xác định trạng thái Camera Ready
const isCameraReadyDone = (submission) => {
  const hasCameraReady = Number(submission?.camera_ready_submission) > 0;
  const isPublished = submission?.status?.toLowerCase() === 'published';
  return hasCameraReady || isPublished;
};

// Helper lấy URL file
const getFileUrl = (submission) => submission?.file_url || submission?.file_path || "";

// Component hiển thị Box Upload Camera Ready
const CameraReadyBox = ({ submission, onUpload, isLoading }) => {
  const [file, setFile] = useState(null);
  const isFinished = isCameraReadyDone(submission);

  if (isFinished) {
    return (
      <div className="mt-6 bg-emerald-50 border border-emerald-100 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-100 p-3 rounded-full text-emerald-600"><CheckCircle size={24} /></div>
          <div>
            <h4 className="font-bold text-emerald-900 text-sm uppercase">Đã nộp bản hoàn thiện (Camera-Ready)</h4>
            <p className="text-xs text-emerald-700 mt-1">ID bản nộp: <span className="font-mono font-bold">#{submission.camera_ready_submission}</span></p>
          </div>
        </div>
        <button
          onClick={() => submissionService.downloadPdf(submission.camera_ready_submission)}
          className="px-5 py-2.5 bg-white border border-emerald-200 text-emerald-700 rounded-lg text-xs font-bold uppercase hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
        >
          Tải bản hoàn thiện
        </button>
      </div>
    );
  }

  // Điều kiện hiển thị upload form
  const isAccepted = submission?.decision?.toLowerCase() === 'accepted';
  const isPublished = submission?.status?.toLowerCase() === 'published';
  const hasCameraReady = Number(submission?.camera_ready_submission) > 0;

  if (isAccepted && !isPublished && !hasCameraReady) {
    return (
      <div className="mt-8 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <UploadCloud size={100} />
        </div>
        <div className="relative z-10">
          <h3 className="text-lg font-bold flex items-center gap-2 mb-2">
            <UploadCloud className="w-6 h-6" /> Nộp bản hoàn thiện (Camera-Ready)
          </h3>
          <p className="text-indigo-100 text-sm mb-6 max-w-xl">
            Bài báo của bạn đã được chấp nhận. Vui lòng nộp phiên bản cuối cùng (Camera-Ready) để hoàn tất quy trình xuất bản.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <label className="flex-1 bg-white/10 hover:bg-white/20 border-2 border-dashed border-white/40 rounded-xl p-4 flex items-center justify-center cursor-pointer transition-colors group">
              <input type="file" accept=".pdf" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
              <div className="text-center">
                <p className="text-xs font-bold uppercase tracking-wider group-hover:text-white transition-colors">
                  {file ? file.name : 'Chọn file PDF bản cuối'}
                </p>
              </div>
            </label>
            <button
              onClick={() => onUpload(submission.id, file)}
              disabled={!file || isLoading}
              className="px-8 py-4 bg-white text-indigo-700 rounded-xl font-bold text-xs uppercase hover:bg-indigo-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isLoading ? (
                <span className="flex items-center gap-2"><Loader2 className="animate-spin w-4 h-4" /> Đang xử lý...</span>
              ) : 'Xác nhận nộp'}
            </button>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function SubmissionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    submissions,
    currentSubmission,
    fetchSubmissionById,
    uploadCameraReady,
    deleteSubmission,
    isLoading,
    reviewsBySubmission,
    reviewsLoading,
    fetchReviewsBySubmission
  } = useSubmissionStore();

  const submissionId = Number(id);
  const [reviewsOpen, setReviewsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Dữ liệu hiển thị
  const subData = useMemo(() => {
    return currentSubmission?.id === Number(id) ? currentSubmission : submissions.find(s => s.id === Number(id));
  }, [currentSubmission, submissions, id]);

  useEffect(() => {
    if (id) fetchSubmissionById(id);
  }, [id, fetchSubmissionById]);

  const handleRefresh = async () => {
    if (!id || isRefreshing) return;
    setIsRefreshing(true);
    try {
      await fetchSubmissionById(id);
      if (reviewsOpen) {
        await fetchReviewsBySubmission(id);
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  const statusInfo = useMemo(() => {
    const isCameraDone = isCameraReadyDone(subData);
    if (isCameraDone) return { label: 'Đã Xuất Bản', color: 'text-purple-700', bg: 'bg-purple-100', border: 'border-purple-200', icon: Award };

    const s = subData?.status?.toLowerCase();
    switch (s) {
      case 'under review': return { label: 'Đang Đánh Giá', color: 'text-blue-700', bg: 'bg-blue-100', border: 'border-blue-200', icon: Shield };
      case 'submitted': return { label: 'Đã Nộp', color: 'text-green-700', bg: 'bg-green-100', border: 'border-green-200', icon: CheckCircle };
      case 'rejected': return { label: 'Bị Từ Chối', color: 'text-red-700', bg: 'bg-red-100', border: 'border-red-200', icon: XCircle };
      case 'accepted': return { label: 'Được Chấp Nhận', color: 'text-emerald-700', bg: 'bg-emerald-100', border: 'border-emerald-200', icon: Award };
      default: return { label: 'Chưa Rõ', color: 'text-gray-700', bg: 'bg-gray-100', border: 'border-gray-200', icon: FileText };
    }
  }, [subData]);

  const decisionInfo = useMemo(() => {
    const d = subData?.decision?.toLowerCase();
    switch (d) {
      case 'accepted': return { label: 'Chấp Nhận', color: 'text-emerald-700', bg: 'bg-emerald-50', icon: CheckCircle };
      case 'rejected': return { label: 'Từ Chối', color: 'text-red-700', bg: 'bg-red-50', icon: XCircle };
      default: return { label: 'Chờ Quyết Định', color: 'text-amber-700', bg: 'bg-amber-50', icon: Clock };
    }
  }, [subData]);

  const handleWithdraw = async () => {
    if (!window.confirm("Hành động này không thể hoàn tác. Bạn có chắc chắn muốn rút bài báo này?")) return;
    setIsDeleting(true);
    const ok = await deleteSubmission(subData.id);
    setIsDeleting(false);
    if (ok) navigate("/dashboard/my-submissions");
  };

  const handleToggleReviews = async () => {
    const nextOpen = !reviewsOpen;
    setReviewsOpen(nextOpen);
    if (nextOpen) {
      await fetchReviewsBySubmission(submissionId);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Chưa cập nhật";
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return "Ngày không hợp lệ";
    }
  };

  if (isLoading && !subData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-gray-500 font-medium">Đang tải thông tin bài báo...</p>
      </div>
    );
  }

  if (!subData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
        <XCircle className="text-red-500" size={48} />
        <p className="text-gray-800 font-bold text-lg">Không tìm thấy bài báo</p>
        <button onClick={() => navigate('/dashboard/my-submissions')} className="text-blue-600 hover:underline">Quay lại danh sách</button>
      </div>
    );
  }

  const fileUrl = getFileUrl(subData);
  const submissionReviews = reviewsBySubmission[submissionId] || [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 min-h-screen">
      {/* Header Navigation */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate('/dashboard/my-submissions')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-medium text-sm"
        >
          <ArrowLeft size={18} /> Quay lại danh sách
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all shadow-sm"
          >
            <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
            {isRefreshing ? "Đang cập nhật..." : "Làm mới dữ liệu"}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">

          {/* Paper Title Card */}
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>

            <div className="flex flex-wrap gap-3 mb-6">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusInfo.bg} ${statusInfo.color} ${statusInfo.border}`}>
                <statusInfo.icon size={12} /> {statusInfo.label}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${decisionInfo.bg} ${decisionInfo.color}`}>
                <decisionInfo.icon size={12} /> {decisionInfo.label}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-6">
              {subData.title}
            </h1>

            <div className="flex flex-wrap gap-3">
              {subData.status === 'submitted' && (
                <button onClick={() => navigate(`/dashboard/submission/edit/${subData.id}`)} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors">
                  <Edit size={16} /> Chỉnh sửa
                </button>
              )}

              {fileUrl && (
                <button onClick={() => submissionService.downloadPdf(subData.id)} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-semibold hover:bg-blue-100 transition-colors">
                  <Download size={16} /> Tải PDF
                </button>
              )}

              {(subData.status === 'submitted' || subData.status === 'under review') && (
                <button onClick={handleWithdraw} className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-50 transition-colors ml-auto">
                  <XCircle size={16} /> Rút bài
                </button>
              )}
            </div>

            <CameraReadyBox submission={subData} onUpload={uploadCameraReady} isLoading={isLoading} />
          </div>

          {/* Abstract */}
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 border-b border-gray-100 pb-2">Tóm tắt (Abstract)</h3>
            <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-line text-justify">
              {subData.abstract || <span className="text-gray-400 italic">Chưa có nội dung tóm tắt.</span>}
            </p>
          </div>

          {/* Reviews Section */}
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                <MessageSquare size={16} className="text-blue-500" /> Đánh giá từ Reviewer
              </h3>
              <button
                onClick={handleToggleReviews}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
              >
                {reviewsOpen ? "Ẩn đánh giá" : "Xem đánh giá chi tiết"}
              </button>
            </div>

            {reviewsOpen && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                {reviewsLoading[submissionId] ? (
                  <div className="flex items-center gap-2 text-sm text-gray-500 py-4">
                    <Loader2 className="animate-spin" size={16} /> Đang tải dữ liệu đánh giá...
                  </div>
                ) : submissionReviews.length > 0 ? (
                  submissionReviews.map((review, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-gray-500 uppercase">Reviewer #{idx + 1}</span>
                        {review.score && (
                          <span className="px-2 py-1 bg-white rounded-md border border-gray-200 text-xs font-bold text-indigo-600">
                            Điểm: {review.score}/10
                          </span>
                        )}
                      </div>

                      {/* Summary */}
                      {review.summary && (
                        <div className="mb-3">
                          <p className="text-xs font-semibold text-gray-700 mb-1">Tóm tắt:</p>
                          <p className="text-sm text-gray-600">{review.summary}</p>
                        </div>
                      )}

                      {/* Strengths */}
                      {review.strengths && (
                        <div className="mb-3">
                          <p className="text-xs font-semibold text-green-700 mb-1">Điểm mạnh:</p>
                          <p className="text-sm text-gray-600">{review.strengths}</p>
                        </div>
                      )}

                      {/* Weaknesses */}
                      {review.weaknesses && (
                        <div className="mb-3">
                          <p className="text-xs font-semibold text-red-700 mb-1">Điểm yếu:</p>
                          <p className="text-sm text-gray-600">{review.weaknesses}</p>
                        </div>
                      )}

                      {/* Comments */}
                      {review.comment && (
                        <p className="text-sm text-gray-600 italic border-l-2 border-gray-300 pl-3 py-1">
                          "{review.comment}"
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <p className="text-sm text-gray-500">Chưa có đánh giá nào được công bố cho bài báo này.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Meta Info Card */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Thông tin chi tiết</h3>

            <div className="flex gap-4">
              <div className="bg-blue-50 p-2.5 rounded-lg text-blue-600 h-fit"><Hash size={18} /></div>
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase">Submission ID</p>
                <p className="text-sm font-bold text-gray-900">#{subData.id}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-purple-50 p-2.5 rounded-lg text-purple-600 h-fit"><Layers size={18} /></div>
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase">Hội nghị (Conference)</p>
                <p className="text-sm font-bold text-gray-900">{subData?.track?.conference?.name || '---'}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-indigo-50 p-2.5 rounded-lg text-indigo-600 h-fit"><MapPin size={18} /></div>
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase">Track (Lĩnh vực)</p>
                <p className="text-sm font-bold text-gray-900">{subData?.track?.name || '---'}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-amber-50 p-2.5 rounded-lg text-amber-600 h-fit"><Clock size={18} /></div>
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase">Ngày nộp</p>
                <p className="text-sm font-bold text-gray-900">{formatDate(subData.created_at)}</p>
              </div>
            </div>

            {/* Scores */}
            <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase mb-1">Điểm TB</p>
                <p className="text-xl font-black text-gray-900">
                  {subData.avg_score != null ? Number(subData.avg_score).toFixed(1) : "--"}
                  <span className="text-xs text-gray-400 font-normal ml-0.5">/10</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase mb-1">Quyết định</p>
                <p className={`text-sm font-black ${decisionInfo.color}`}>
                  {decisionInfo.label.toUpperCase()}
                </p>
              </div>
            </div>
          </div>

          {/* Authors Card */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <User size={14} /> Tác giả
            </h3>
            <div className="space-y-4">
              {subData.authors && subData.authors.length > 0 ? (
                subData.authors.map((author, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 shrink-0">
                      {index + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">
                        {author.name || author.full_name}
                        {author.is_corresponding && <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded ml-2 align-middle">Liên hệ</span>}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{author.email}</p>
                      {author.affiliation && <p className="text-xs text-gray-400 truncate mt-0.5">{author.affiliation}</p>}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 italic">Chưa có thông tin tác giả.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
