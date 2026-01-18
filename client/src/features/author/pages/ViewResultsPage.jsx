import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  CheckCircle,
  Clock,
  FileText,
  MessageSquare,
  UploadCloud,
  Eye,
  Loader2,
  XCircle
} from "lucide-react";
import { useSubmissionStore } from "../../../app/store/useSubmissionStore";

const getDecisionBadge = (submission) => {
  const decision = submission?.decision?.toLowerCase();
  if (decision === "accepted") {
    return { label: "ACCEPTED", color: "bg-emerald-50 text-emerald-700", icon: CheckCircle };
  }
  if (decision === "rejected") {
    return { label: "REJECTED", color: "bg-rose-50 text-rose-700", icon: XCircle };
  }

  const status = submission?.status?.toLowerCase() || "";
  if (status.includes("review")) {
    return { label: "UNDER REVIEW", color: "bg-amber-50 text-amber-700", icon: Clock };
  }
  return { label: "SUBMITTED", color: "bg-blue-50 text-blue-700", icon: FileText };
};

export default function ViewResultsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectId = Number(searchParams.get("submissionId")) || null;

  const {
    submissions,
    fetchDashboardData,
    reviewsBySubmission,
    reviewsLoading,
    fetchReviewsBySubmission
  } = useSubmissionStore();

  const [expandedId, setExpandedId] = useState(preselectId);

  useEffect(() => {
    fetchDashboardData("author");
  }, [fetchDashboardData]);

  useEffect(() => {
    if (expandedId && !reviewsBySubmission[expandedId]) {
      fetchReviewsBySubmission(expandedId).catch(() => {
        toast.error("Không thể tải reviews.");
      });
    }
  }, [expandedId, fetchReviewsBySubmission, reviewsBySubmission]);

  const items = useMemo(() => submissions || [], [submissions]);

  if (!items.length) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-500">
          Bạn chưa có bài nộp nào để xem kết quả.
        </div>
      </div>
    );
  }

  const handleToggleReviews = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase italic">Kết quả & Reviews</h1>
          <p className="text-[10px] text-gray-400 font-black uppercase">
            Theo dõi quyết định và phản hồi phản biện
          </p>
        </div>
        <button
          onClick={() => navigate("/dashboard/my-submissions")}
          className="px-4 py-2 bg-white border rounded-xl text-xs font-black uppercase"
        >
          Quay lại danh sách
        </button>
      </div>

      <div className="space-y-4">
        {items.map((sub) => {
          const badge = getDecisionBadge(sub);
          const BadgeIcon = badge.icon;
          const isAccepted = sub.decision?.toLowerCase() === "accepted";
          const isFinished = Number(sub.camera_ready_submission) > 0;
          const reviews = reviewsBySubmission[sub.id] || [];
          const isOpen = expandedId === sub.id;

          return (
            <div key={sub.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={`flex items-center gap-2 text-[10px] font-black px-3 py-1 rounded-full ${badge.color}`}>
                      <BadgeIcon size={12} /> {badge.label}
                    </span>
                    <span className="text-[10px] text-gray-400 font-black uppercase">
                      #{sub.id}
                    </span>
                  </div>
                  <h2 className="text-lg font-black text-gray-900">{sub.title}</h2>
                  <p className="text-xs text-gray-500">
                    {sub.conference?.name || "N/A"} • {sub.track?.name || "Track"} •{" "}
                    {sub.submitted_at ? new Date(sub.submitted_at).toLocaleDateString() : "---"}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => navigate(`/dashboard/submission/${sub.id}`)}
                    className="px-3 py-2 bg-gray-100 rounded-lg text-xs font-bold flex items-center gap-2"
                  >
                    <Eye size={14} /> Chi tiết
                  </button>
                  <button
                    onClick={() => handleToggleReviews(sub.id)}
                    className="px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold flex items-center gap-2"
                  >
                    <MessageSquare size={14} /> {isOpen ? "Ẩn reviews" : "Xem reviews"}
                  </button>
                  {isAccepted && !isFinished && (
                    <button
                      onClick={() => navigate(`/dashboard/submission/${sub.id}/camera-ready`)}
                      className="px-3 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold flex items-center gap-2"
                    >
                      <UploadCloud size={14} /> Nộp bản cuối
                    </button>
                  )}
                </div>
              </div>

              {isOpen && (
                <div className="border-t border-gray-100 p-6 bg-gray-50/40">
                  {reviewsLoading[sub.id] ? (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Loader2 className="animate-spin w-4 h-4" /> Đang tải reviews...
                    </div>
                  ) : reviews.length === 0 ? (
                    <div className="text-sm text-gray-500">
                      Chưa có reviews được công bố.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reviews.map((rev, idx) => (
                        <div key={idx} className="bg-white border border-gray-100 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-black uppercase text-gray-400">
                              Reviewer #{idx + 1}
                            </span>
                            {rev.score !== undefined && (
                              <span className="text-xs font-black text-indigo-600">
                                Score: {rev.score}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-700 whitespace-pre-line">
                            {rev.comment || rev.summary || "Không có nhận xét."}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
