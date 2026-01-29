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
  XCircle,
  Award,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Calendar,
  User
} from "lucide-react";
import { useSubmissionStore } from "../../../app/store/useSubmissionStore";

const getDecisionBadge = (submission) => {
  const decision = submission?.decision?.toLowerCase();
  if (decision === "accepted") {
    return { 
      label: "ACCEPTED", 
      color: "rgb(16,185,129)",
      bgColor: "rgba(16,185,129,0.1)",
      borderColor: "rgba(16,185,129,0.3)",
      icon: CheckCircle
    };
  }
  if (decision === "rejected") {
    return { 
      label: "REJECTED", 
      color: "rgb(244,63,94)",
      bgColor: "rgba(244,63,94,0.1)",
      borderColor: "rgba(244,63,94,0.3)",
      icon: XCircle
    };
  }

  const status = submission?.status?.toLowerCase() || "";
  if (status.includes("review")) {
    return { 
      label: "UNDER REVIEW", 
      color: "rgb(245,158,11)",
      bgColor: "rgba(245,158,11,0.1)",
      borderColor: "rgba(245,158,11,0.3)",
      icon: Clock
    };
  }
  return { 
    label: "SUBMITTED", 
    color: "rgb(0,134,137)",
    bgColor: "rgba(0,134,137,0.1)",
    borderColor: "rgba(0,134,137,0.3)",
    icon: FileText
  };
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
      <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom right, rgb(249,250,251), rgba(0,134,137,0.05))' }}>
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="bg-white rounded-2xl border-2 p-16 text-center shadow-xl" style={{ borderColor: 'rgba(0,134,137,0.15)' }}>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: 'rgba(0,134,137,0.08)' }}>
              <FileText className="w-10 h-10" style={{ color: 'rgb(0,134,137)' }} />
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">Chưa có bài nộp</h3>
            <p className="text-sm text-gray-500">Bạn chưa có bài nộp nào để xem kết quả.</p>
          </div>
        </div>
      </div>
    );
  }

  const handleToggleReviews = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom right, rgb(249,250,251), rgba(0,134,137,0.05))' }}>
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        {/* Header Section */}
        <div className="bg-white rounded-2xl border-2 shadow-xl p-6" style={{ borderColor: 'rgba(0,134,137,0.15)' }}>
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 
                className="text-3xl font-black"
                style={{ 
                  background: 'linear-gradient(to right, rgb(0,134,137), rgb(0,154,157))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                RESEARCH RESULTS & PEER REVIEWS
              </h1>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                Scientific Paper Evaluation Dashboard • {items.length} Submission{items.length !== 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={() => navigate("/dashboard/my-submissions")}
              className="px-5 py-2.5 border-2 rounded-xl text-xs font-black uppercase transition-all hover:shadow-md"
              style={{ 
                backgroundColor: 'rgba(0,134,137,0.05)', 
                borderColor: 'rgba(0,134,137,0.3)',
                color: 'rgb(0,134,137)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,134,137,0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,134,137,0.05)'}
            >
              ← Back to List
            </button>
          </div>
        </div>

        {/* Submissions List */}
        <div className="space-y-6">
          {items.map((sub) => {
            const badge = getDecisionBadge(sub);
            const BadgeIcon = badge.icon;
            const isAccepted = sub.decision?.toLowerCase() === "accepted";
            const isFinished = Number(sub.camera_ready_submission) > 0;
            const reviews = reviewsBySubmission[sub.id] || [];
            const isOpen = expandedId === sub.id;

            return (
              <div 
                key={sub.id} 
                className="bg-white rounded-2xl border-2 shadow-lg hover:shadow-xl transition-all overflow-hidden"
                style={{ borderColor: 'rgba(0,134,137,0.1)' }}
              >
                {/* Main Paper Info */}
                <div className="p-6 space-y-4">
                  {/* Status Badge & ID */}
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <span 
                        className="flex items-center gap-2 text-[10px] font-black px-4 py-2 rounded-full border-2 shadow-lg uppercase tracking-wider"
                        style={{ 
                          color: badge.color,
                          backgroundColor: badge.bgColor,
                          borderColor: badge.borderColor
                        }}
                      >
                        <BadgeIcon size={14} strokeWidth={3} /> {badge.label}
                      </span>
                      <span className="text-xs text-gray-400 font-bold bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                        ID: #{sub.id}
                      </span>
                    </div>
                    
                    {isFinished && (
                      <span 
                        className="flex items-center gap-1.5 text-[10px] font-black px-3 py-1.5 rounded-full border"
                        style={{ 
                          backgroundColor: 'rgba(0,134,137,0.08)', 
                          color: 'rgb(0,134,137)',
                          borderColor: 'rgba(0,134,137,0.3)'
                        }}
                      >
                        <CheckCircle size={12} /> CAMERA-READY SUBMITTED
                      </span>
                    )}
                  </div>

                  {/* Paper Title */}
                  <h2 className="text-xl font-bold text-gray-900 leading-tight">
                    {sub.title}
                  </h2>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    <div className="flex items-start gap-2 text-xs">
                      <FileText className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'rgb(0,134,137)' }} />
                      <div>
                        <p className="font-bold text-gray-700">{sub.conference?.name || "N/A"}</p>
                        <p className="text-gray-500">{sub.track?.name || "Track"}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2 text-xs">
                      <Calendar className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'rgb(0,134,137)' }} />
                      <div>
                        <p className="font-bold text-gray-700">Submitted</p>
                        <p className="text-gray-500">
                          {sub.submitted_at ? new Date(sub.submitted_at).toLocaleDateString('en-GB') : "---"}
                        </p>
                      </div>
                    </div>

                    {/* Scores Display */}
                    {(sub.avg_score || sub.final_score) && (
                      <div className="flex items-start gap-2 text-xs">
                        <Award className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'rgb(0,134,137)' }} />
                        <div className="space-y-1">
                          {sub.avg_score && (
                            <div className="flex items-center gap-2">
                              <span className="text-gray-700 font-bold">Avg Score:</span>
                              <span 
                                className="font-black px-2 py-0.5 rounded"
                                style={{ 
                                  color: 'rgb(0,134,137)', 
                                  backgroundColor: 'rgba(0,134,137,0.1)' 
                                }}
                              >
                                {parseFloat(sub.avg_score).toFixed(2)}
                              </span>
                            </div>
                          )}
                          {sub.final_score && (
                            <div className="flex items-center gap-2">
                              <span className="text-gray-700 font-bold">Final:</span>
                              <span 
                                className="font-black px-2 py-0.5 rounded"
                                style={{ 
                                  color: 'rgb(16,185,129)', 
                                  backgroundColor: 'rgba(16,185,129,0.1)' 
                                }}
                              >
                                {parseFloat(sub.final_score).toFixed(2)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      onClick={() => navigate(`/dashboard/submission/${sub.id}`)}
                      className="px-4 py-2.5 bg-gray-50 border-2 border-gray-200 text-gray-700 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-gray-100 hover:border-gray-300 transition-all"
                    >
                      <Eye size={14} /> View Details
                    </button>
                    
                    <button
                      onClick={() => handleToggleReviews(sub.id)}
                      className="px-4 py-2.5 border-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
                      style={{ 
                        backgroundColor: 'rgba(0,134,137,0.08)', 
                        borderColor: 'rgba(0,134,137,0.3)',
                        color: 'rgb(0,134,137)'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,134,137,0.15)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,134,137,0.08)'}
                    >
                      <MessageSquare size={14} /> 
                      {isOpen ? "Hide Reviews" : "Show Reviews"}
                      {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    
                    {isAccepted && !isFinished && (
                      <button
                        onClick={() => navigate(`/dashboard/submission/${sub.id}/camera-ready`)}
                        className="px-4 py-2.5 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md hover:shadow-lg"
                        style={{ 
                          background: 'linear-gradient(to right, rgb(16,185,129), rgb(5,150,105))'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(to right, rgb(5,150,105), rgb(4,120,87))'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(to right, rgb(16,185,129), rgb(5,150,105))'}
                      >
                        <UploadCloud size={14} /> Submit Camera-Ready
                      </button>
                    )}
                  </div>
                </div>

                {/* Reviews Section */}
                {isOpen && (
                  <div 
                    className="border-t-2"
                    style={{ 
                      borderColor: 'rgba(0,134,137,0.1)',
                      background: 'linear-gradient(to bottom right, rgb(249,250,251), rgba(0,134,137,0.03))'
                    }}
                  >
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="w-5 h-5" style={{ color: 'rgb(0,134,137)' }} />
                        <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider">
                          Peer Review Evaluations
                        </h3>
                      </div>

                      {reviewsLoading[sub.id] ? (
                        <div className="flex items-center justify-center gap-3 py-8 text-sm text-gray-500">
                          <Loader2 className="animate-spin w-5 h-5" style={{ color: 'rgb(0,134,137)' }} /> 
                          <span className="font-bold">Loading reviews...</span>
                        </div>
                      ) : reviews.length === 0 ? (
                        <div className="text-center py-8 bg-white rounded-xl border-2 border-dashed border-gray-200">
                          <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-500 font-bold">No reviews published yet.</p>
                          <p className="text-xs text-gray-400 mt-1">Reviews will appear here once they are released.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {reviews.map((rev, idx) => (
                            <div 
                              key={idx} 
                              className="bg-white border-2 rounded-xl p-5 shadow-sm hover:shadow-md transition-all"
                              style={{ borderColor: 'rgba(0,134,137,0.15)' }}
                            >
                              <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4" style={{ color: 'rgb(0,134,137)' }} />
                                  <span className="text-xs font-black uppercase tracking-wider" style={{ color: 'rgb(0,134,137)' }}>
                                    Reviewer #{idx + 1}
                                  </span>
                                </div>
                                {rev.score !== undefined && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase">Score:</span>
                                    <span 
                                      className="text-base font-black px-3 py-1 rounded-lg border"
                                      style={{ 
                                        color: 'rgb(0,134,137)', 
                                        backgroundColor: 'rgba(0,134,137,0.1)',
                                        borderColor: 'rgba(0,134,137,0.3)'
                                      }}
                                    >
                                      {rev.score}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="prose prose-sm max-w-none">
                                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                                  {rev.comment || rev.summary || "No comments provided."}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}