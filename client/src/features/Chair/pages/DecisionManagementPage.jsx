import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { decisionService, reviewService, submissionService, conferenceService } from "../../../services";
import { CheckCircle, XCircle, FileText, AlertCircle, Edit, Star, Users, Loader2, ExternalLink } from "lucide-react";
import Modal from "../../../components/Modal";
import Button from "../../../components/Button";
import Input from "../../../components/Input";
import Table from "../../../components/Table";
import { toast } from "react-hot-toast";
import { getErrorMessage } from "../../../utils/errors";

/**
 * Trang quản lý quyết định cho Chair
 */
export default function DecisionManagementPage() {
  const { conferenceId } = useParams();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [decisions, setDecisions] = useState({});
  const [decisionModal, setDecisionModal] = useState(null);
  const [decision, setDecision] = useState("accepted");
  const [notes, setNotes] = useState("");
  const [finalScore, setFinalScore] = useState("");
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState({});
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [conferences, setConferences] = useState([]);
  const [selectedConferenceId, setSelectedConferenceId] = useState(
    conferenceId ? parseInt(conferenceId, 10) : null
  );

  // Bulk actions state
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkDecisionModal, setBulkDecisionModal] = useState(false);
  const [emailPreview, setEmailPreview] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const isMountedRef = useRef(true);

  // Update selectedConferenceId when conferenceId from URL changes
  useEffect(() => {
    if (conferenceId) {
      const parsedId = parseInt(conferenceId, 10);
      if (!isNaN(parsedId) && parsedId !== selectedConferenceId) {
        setSelectedConferenceId(parsedId);
      }
    }
  }, [conferenceId]);

  useEffect(() => {
    isMountedRef.current = true;
    loadConferences();

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const confId = selectedConferenceId || conferenceId;
    if (confId) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [conferenceId, selectedConferenceId]);

  const loadConferences = async () => {
    try {
      const data = await conferenceService.getAll();
      const conferencesList = Array.isArray(data) ? data : (data.conferences || []);
      setConferences(conferencesList);

      // Auto-select first conference if no conferenceId provided
      if (!conferenceId && conferencesList.length > 0 && !selectedConferenceId) {
        setSelectedConferenceId(conferencesList[0].id);
        navigate(`/dashboard/chair/decisions/${conferencesList[0].id}`, { replace: true });
      }
    } catch (error) {
      console.error("Error loading conferences:", error);
    }
  };

  const loadData = async () => {
    const confId = selectedConferenceId || conferenceId;
    const idNum = Number(confId);
    if (!confId || isNaN(idNum) || idNum <= 0) {
      setLoading(false);
      return;
    }

    try {
      if (!isMountedRef.current) return;
      setLoading(true);

      const submissionsResponse = await submissionService.getAll(idNum);
      if (!isMountedRef.current) return;

      // Handle both array response and object response
      const submissionsData = Array.isArray(submissionsResponse)
        ? submissionsResponse
        : (submissionsResponse.submissions || submissionsResponse.data || []);

      if (!Array.isArray(submissionsData)) {
        console.error("Submissions data is not an array:", submissionsData);
        if (isMountedRef.current) {
          setSubmissions([]);
        }
        return;
      }

      // Backend now returns only conference submissions, but we keep the status filter
      const conferenceSubmissions = submissionsData;

      if (conferenceSubmissions.length > 0) {
        // console.log("[DecisionManagement] Submission statuses:", conferenceSubmissions.map(s => ({
        //   id: s.id,
        //   status: s.status,
        //   title: s.title?.substring(0, 50)
        // })));
      } else {
        console.warn("[DecisionManagement] No submissions found for conference", confId);
      }

      // Show submissions that are submitted, under_review, accepted, or rejected (can make/update decisions)
      // Include "submitted" status so Chair can make decisions even before reviewers are assigned
      const filtered = conferenceSubmissions.filter(
        (s) => {
          const status = (s.status || "").toLowerCase();
          const allowedStatuses = ["submitted", "under_review", "accepted", "rejected"];
          return allowedStatuses.includes(status);
        }
      );

      if (isMountedRef.current) {
        setSubmissions(filtered);
      }

      // Load decisions
      try {
        const decisionsData = await decisionService.getDecisionsByConference(confId);
        if (!isMountedRef.current) return;

        // Handle both array response and object response
        const decisionsArray = Array.isArray(decisionsData)
          ? decisionsData
          : (decisionsData.decisions || decisionsData.data || []);

        const decisionsMap = {};
        if (Array.isArray(decisionsArray)) {
          decisionsArray.forEach((d) => {
            decisionsMap[d.submission_id] = d;
          });
        }
        if (isMountedRef.current) {
          setDecisions(decisionsMap);
        }
      } catch (error) {
        // Ignore abort errors
        if (error.code === 'ECONNABORTED' || error.name === 'AbortError' || error.message === 'Request aborted') {
          return;
        }
        console.error("Error loading decisions:", error);
        // Set empty decisions map on error
        if (isMountedRef.current) {
          setDecisions({});
        }
      }
    } catch (error) {
      // Ignore abort errors
      if (error.code === 'ECONNABORTED' || error.name === 'AbortError' || error.message === 'Request aborted') {
        return;
      }
      if (isMountedRef.current) {
        toast.error(getErrorMessage(error, "Không thể tải dữ liệu"));
        setSubmissions([]);
        setDecisions({});
      }
      console.error(error);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const handleMakeDecision = async () => {
    if (!decisionModal) return;

    try {
      const payload = {
        submission_id: decisionModal.id,
        decision,
        decision_notes: notes,
      };

      // Only include final_score if it's provided and different from avg_score
      // or if decision is accepted/rejected (to set final score)
      const avgScore = decisions[decisionModal.id]?.avg_score || decisionModal.avg_score;
      if (finalScore && finalScore.trim() !== "") {
        const parsedFinalScore = parseFloat(finalScore);
        if (!isNaN(parsedFinalScore)) {
          payload.final_score = parsedFinalScore;
        }
      }

      await decisionService.makeDecision(payload);
      toast.success("Quyết định đã được ghi nhận");
      setDecisionModal(null);
      setDecision("accepted");
      setNotes("");
      setFinalScore("");
      loadData();
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể ghi nhận quyết định"));
      console.error(error);
    }
  };

  const openDecisionModal = async (submission) => {
    setDecisionModal(submission);

    // Get current decision from decisions map or submission
    const currentDecision = decisions[submission.id];
    const decisionValue = currentDecision?.decision || submission.decision || "accepted";
    // Normalize decision value to match backend format
    const normalizedDecision = decisionValue.toLowerCase().replace(" ", "_");
    setDecision(normalizedDecision);
    setNotes(currentDecision?.decision_notes || submission.decision_notes || "");

    // Set final_score: use existing final_score, or avg_score if available
    const existingFinalScore = currentDecision?.final_score || submission.final_score;
    const avgScore = currentDecision?.avg_score || submission.avg_score;
    setFinalScore(existingFinalScore ? existingFinalScore.toString() : (avgScore ? avgScore.toString() : ""));

    // Load reviews for this submission
    try {
      setLoadingReviews(true);
      const reviewsData = await reviewService.getReviewsBySubmission(submission.id);
      setReviews(prev => ({ ...prev, [submission.id]: reviewsData }));
    } catch (error) {
      // Ignore abort errors
      if (error.code === 'ECONNABORTED' || error.name === 'AbortError' || error.message === 'Request aborted') {
        return;
      }
      console.error("Error loading reviews:", error);
      setReviews(prev => ({ ...prev, [submission.id]: [] }));
    } finally {
      setLoadingReviews(false);
    }
  };

  // --- Bulk Decision Logic ---
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(submissions.map((s) => s.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkSubmit = async () => {
    if (!selectedIds.length) return;
    try {
      if (typeof decisionService.makeDecisionsBulk !== 'function') {
        toast.error("Tính năng duyệt hàng loạt chưa được cập nhật trên trình duyệt. Vui lòng tải lại trang.");
        return;
      }

      await decisionService.makeDecisionsBulk({
        submission_ids: selectedIds,
        decision: decision, // reusing the 'decision' state
        decision_notes: notes, // reusing the 'notes' state
      });
      toast.success(`Đã cập nhật quyết định cho ${selectedIds.length} bài nộp`);
      setBulkDecisionModal(false);
      setSelectedIds([]);
      setDecision("accepted");
      setNotes("");
      loadData();
    } catch (error) {
      toast.error(getErrorMessage(error, "Lỗi khi duyệt hàng loạt"));
      console.error(error);
    }
  };

  const handlePreviewEmail = async () => {
    if (!decisionModal) return;
    try {
      const res = await decisionService.previewDecisionEmail({
        submission_id: decisionModal.id,
        decision,
        decision_notes: notes,
      });
      setEmailPreview(res);
      setShowPreviewModal(true);
    } catch (error) {
      // Ignore abort errors
      if (error.code === 'ECONNABORTED' || error.name === 'AbortError' || error.message === 'Request aborted') {
        return;
      }
      toast.error("Không thể tạo xem trước email");
    }
  };
  // -------------------------

  const getDecisionBadge = (submissionId) => {
    const decisionData = decisions[submissionId];
    if (!decisionData || !decisionData.decision) return null;

    const decisionValue = decisionData.decision.toLowerCase();
    const config = {
      accepted: { label: "Chấp nhận", icon: CheckCircle, className: "bg-green-100 text-green-800" },
      rejected: { label: "Từ chối", icon: XCircle, className: "bg-red-100 text-red-800" },
      minor_revision: { label: "Sửa nhỏ", icon: Edit, className: "bg-yellow-100 text-yellow-800" },
      major_revision: { label: "Sửa lớn", icon: AlertCircle, className: "bg-orange-100 text-orange-800" },
    };

    const decisionConfig = config[decisionValue] || config.accepted;
    const Icon = decisionConfig.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${decisionConfig.className}`}
      >
        <Icon className="w-3 h-3" />
        {decisionConfig.label}
      </span>
    );
  };

  const columns = [
    {
      header: (
        <input
          type="checkbox"
          onChange={handleSelectAll}
          checked={submissions.length > 0 && selectedIds.length === submissions.length}
          className="rounded border-gray-300 text-teal-600 focus:ring-teal-500 w-4 h-4 cursor-pointer"
        />
      ),
      accessor: "id",
      render: (row) => (
        <input
          type="checkbox"
          checked={selectedIds.includes(row.id)}
          onChange={() => handleSelectRow(row.id)}
          className="rounded border-gray-300 text-teal-600 focus:ring-teal-500 w-4 h-4 cursor-pointer"
        />
      ),
    },
    {
      header: "Tiêu đề",
      accessor: "title",
      render: (row) => (
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-gray-400" />
          <span className="font-medium" title={row.title}>{row.title.length > 40 ? row.title.substring(0, 40) + "..." : row.title}</span>
        </div>
      ),
    },
    {
      header: "Track",
      accessor: "track",
      render: (row) => row.track?.name || "N/A",
    },
    {
      header: "Điểm TB",
      accessor: "avg_score",
      render: (row) => {
        const decisionData = decisions[row.id];
        const score = decisionData?.avg_score || row.avg_score;
        return score ? (
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="font-medium">{parseFloat(score).toFixed(2)}</span>
          </div>
        ) : (
          <span className="text-gray-400 text-sm">-</span>
        );
      },
    },
    {
      header: "Điểm cuối",
      accessor: "final_score",
      render: (row) => {
        const decisionData = decisions[row.id];
        const finalScore = decisionData?.final_score || row.final_score;
        const avgScore = decisionData?.avg_score || row.avg_score;

        if (finalScore) {
          const isAdjusted = avgScore && Math.abs(parseFloat(finalScore) - parseFloat(avgScore)) > 0.01;
          return (
            <div className="flex items-center gap-1">
              <Star className={`w-4 h-4 ${isAdjusted ? 'text-blue-500 fill-blue-500' : 'text-green-500 fill-green-500'}`} />
              <span className={`font-medium ${isAdjusted ? 'text-blue-600' : 'text-green-600'}`}>
                {parseFloat(finalScore).toFixed(2)}
              </span>
              {isAdjusted && (
                <span className="text-xs text-blue-500" title="Đã điều chỉnh thủ công">*</span>
              )}
            </div>
          );
        }
        return <span className="text-gray-400 text-sm">-</span>;
      },
    },
    {
      header: "Quyết định",
      accessor: "decision",
      render: (row) => getDecisionBadge(row.id) || (
        <span className="text-gray-400 text-sm">Chưa quyết định</span>
      ),
    },
    {
      header: "Thao tác",
      accessor: "actions",
      render: (row) => (
        <Button
          variant="secondary"
          onClick={() => openDecisionModal(row)}
          className="!w-auto text-xs px-2 py-1"
        >
          {decisions[row.id] ? "Sửa" : "Quyết định"}
        </Button>
      ),
    },
  ];

  // Calculate statistics
  const totalSubmissions = submissions.length;
  const decidedCount = Object.keys(decisions).length;
  const pendingCount = Math.max(0, totalSubmissions - decidedCount);

  const stats = {
    total: totalSubmissions,
    decided: decidedCount,
    pending: pendingCount,
    accepted: Object.values(decisions).filter(d => d.decision?.toLowerCase() === "accepted").length,
    rejected: Object.values(decisions).filter(d => d.decision?.toLowerCase() === "rejected").length,
    revisions: Object.values(decisions).filter(d =>
      d.decision?.toLowerCase() === "minor_revision" || d.decision?.toLowerCase() === "major_revision"
    ).length,
  };

  const handleConferenceChange = (e) => {
    const newConferenceId = parseInt(e.target.value);
    setSelectedConferenceId(newConferenceId);
    navigate(`/dashboard/chair/decisions/${newConferenceId}`);
  };

  const currentConferenceId = selectedConferenceId || conferenceId;

  // Show conference selector if no conference selected or multiple conferences available
  if (!currentConferenceId && conferences.length > 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý quyết định</h1>
          <p className="mt-1 text-sm text-gray-500">Chọn hội nghị để quản lý quyết định</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chọn hội nghị
          </label>
          <select
            value={selectedConferenceId || ""}
            onChange={handleConferenceChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="">-- Chọn hội nghị --</option>
            {conferences.map((conf) => (
              <option key={conf.id} value={conf.id}>
                {conf.name} {conf.abbreviation ? `(${conf.abbreviation})` : ""}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý quyết định</h1>
          <p className="mt-1 text-sm text-gray-500">Đưa ra quyết định cho các bài nộp</p>
          {currentConferenceId && (
            <a
              href={`/conferences/${currentConferenceId}/accepted-papers`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-600 hover:text-teal-800 text-sm flex items-center gap-1 mt-2 inline-flex"
            >
              <ExternalLink className="w-4 h-4" />
              Xem danh sách bài được chấp nhận (Public)
            </a>
          )}
        </div>
        {conferences.length > 1 && (
          <div className="w-64">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hội nghị
            </label>
            <select
              value={currentConferenceId || ""}
              onChange={handleConferenceChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              {conferences.map((conf) => (
                <option key={conf.id} value={conf.id}>
                  {conf.name} {conf.abbreviation ? `(${conf.abbreviation})` : ""}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Tổng số bài</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Chưa quyết định</div>
          <div className="text-2xl font-bold text-orange-600 mt-1">{stats.pending}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Đã chấp nhận</div>
          <div className="text-2xl font-bold text-green-600 mt-1">{stats.accepted}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Đã từ chối</div>
          <div className="text-2xl font-bold text-red-600 mt-1">{stats.rejected}</div>
        </div>
      </div>

      {/* Bulk Actions Toolbar */}
      {selectedIds.length > 0 && (
        <div className="bg-teal-50 border border-teal-200 p-4 rounded-lg flex items-center justify-between animate-fadeIn transition-all duration-300">
          <div className="flex items-center gap-2">
            <span className="font-medium text-teal-800">Đã chọn {selectedIds.length} bài nộp</span>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => {
                setDecision("accepted");
                setNotes("");
                setBulkDecisionModal(true);
              }}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle className="w-4 h-4 mr-1" /> Chấp nhận tất cả
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setDecision("rejected");
                setNotes("");
                setBulkDecisionModal(true);
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <XCircle className="w-4 h-4 mr-1" /> Từ chối tất cả
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setSelectedIds([])}
            >
              Hủy chọn
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <div className="text-gray-500">Đang tải dữ liệu...</div>
        </div>
      ) : submissions.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-medium mb-2">Không có bài nộp nào</p>
          <p className="text-sm text-gray-500">
            {currentConferenceId
              ? "Chưa có bài nộp nào với status 'submitted', 'under_review', 'accepted', hoặc 'rejected' cho hội nghị này."
              : "Vui lòng chọn hội nghị để xem bài nộp."
            }
          </p>
        </div>
      ) : (
        <Table columns={columns} data={submissions} loading={false} />
      )}

      {/* Decision Modal */}
      <Modal
        isOpen={!!decisionModal}
        onClose={() => {
          setDecisionModal(null);
          setDecision("accepted");
          setNotes("");
          setFinalScore("");
          setReviews(prev => {
            const newReviews = { ...prev };
            delete newReviews[decisionModal?.id];
            return newReviews;
          });
        }}
        title="Quyết định bài nộp"
        size="lg"
      >
        <div className="space-y-6">
          {/* Submission Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-medium">Bài nộp:</span> {decisionModal?.title}
            </p>
            {decisionModal?.track && (
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium">Track:</span> {decisionModal.track.name}
              </p>
            )}
            {/* Scores Display */}
            <div className="mt-3 pt-3 border-t border-gray-200 flex gap-4">
              <div>
                <span className="text-xs text-gray-500">Điểm TB:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {(() => {
                    const avgScore = decisions[decisionModal?.id]?.avg_score || decisionModal?.avg_score;
                    return avgScore ? parseFloat(avgScore).toFixed(2) : "-";
                  })()}
                </span>
              </div>
              {(() => {
                const finalScore = decisions[decisionModal?.id]?.final_score || decisionModal?.final_score;
                return finalScore ? (
                  <div>
                    <span className="text-xs text-gray-500">Điểm cuối:</span>
                    <span className="ml-2 font-medium text-green-600">
                      {parseFloat(finalScore).toFixed(2)}
                    </span>
                  </div>
                ) : null;
              })()}
            </div>
          </div>

          {/* Reviews Summary */}
          {loadingReviews ? (
            <div className="text-center py-4 text-gray-500">Đang tải reviews...</div>
          ) : reviews[decisionModal?.id]?.length > 0 ? (
            <div className="border rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Reviews ({reviews[decisionModal?.id]?.length})
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {reviews[decisionModal?.id]?.map((review, idx) => (
                  <div key={idx} className="text-sm text-gray-600 border-b pb-2 last:border-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">Reviewer {idx + 1}</span>
                      {review.recommendation && (
                        <span className={`text-xs px-2 py-0.5 rounded ${review.recommendation.toLowerCase() === 'accept'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                          }`}>
                          {review.recommendation}
                        </span>
                      )}
                    </div>
                    {review.summary && (
                      <p className="text-xs text-gray-500 line-clamp-2">{review.summary}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="border rounded-lg p-4 text-center text-gray-500 text-sm">
              Chưa có reviews nào
            </div>
          )}

          {/* Decision Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Quyết định
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${decision === "accepted"
                ? "border-green-500 bg-green-50"
                : "border-gray-200 hover:border-gray-300"
                }`}>
                <input
                  type="radio"
                  value="accepted"
                  checked={decision === "accepted"}
                  onChange={(e) => setDecision(e.target.value)}
                  className="mr-2"
                />
                <span className="flex items-center gap-2 text-green-700 font-medium">
                  <CheckCircle className="w-5 h-5" />
                  Chấp nhận
                </span>
              </label>

              <label className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${decision === "rejected"
                ? "border-red-500 bg-red-50"
                : "border-gray-200 hover:border-gray-300"
                }`}>
                <input
                  type="radio"
                  value="rejected"
                  checked={decision === "rejected"}
                  onChange={(e) => setDecision(e.target.value)}
                  className="mr-2"
                />
                <span className="flex items-center gap-2 text-red-700 font-medium">
                  <XCircle className="w-5 h-5" />
                  Từ chối
                </span>
              </label>

              <label className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${decision === "minor_revision"
                ? "border-yellow-500 bg-yellow-50"
                : "border-gray-200 hover:border-gray-300"
                }`}>
                <input
                  type="radio"
                  value="minor_revision"
                  checked={decision === "minor_revision"}
                  onChange={(e) => setDecision(e.target.value)}
                  className="mr-2"
                />
                <span className="flex items-center gap-2 text-yellow-700 font-medium">
                  <Edit className="w-5 h-5" />
                  Sửa nhỏ
                </span>
              </label>

              <label className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${decision === "major_revision"
                ? "border-orange-500 bg-orange-50"
                : "border-gray-200 hover:border-gray-300"
                }`}>
                <input
                  type="radio"
                  value="major_revision"
                  checked={decision === "major_revision"}
                  onChange={(e) => setDecision(e.target.value)}
                  className="mr-2"
                />
                <span className="flex items-center gap-2 text-orange-700 font-medium">
                  <AlertCircle className="w-5 h-5" />
                  Sửa lớn
                </span>
              </label>
            </div>
          </div>

          {/* Final Score Input (only for accepted/rejected) */}
          {(decision === "accepted" || decision === "rejected") && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Điểm cuối cùng (tùy chọn)
              </label>
              <div className="space-y-2">
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={finalScore}
                  onChange={(e) => setFinalScore(e.target.value)}
                  placeholder="Để trống để dùng điểm TB"
                  className="w-full"
                />
                <p className="text-xs text-gray-500">
                  {(() => {
                    const avgScore = decisions[decisionModal?.id]?.avg_score || decisionModal?.avg_score;
                    return avgScore
                      ? `Điểm TB hiện tại: ${parseFloat(avgScore).toFixed(2)}. Để trống để dùng điểm này.`
                      : "Nhập điểm cuối cùng hoặc để trống nếu chưa có.";
                  })()}
                </p>
              </div>
            </div>
          )}

          {/* Notes */}
          <Input
            label="Ghi chú quyết định"
            type="textarea"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Nhập ghi chú cho tác giả (tùy chọn)"
            className="min-h-[100px]"
          />

          {/* Actions */}
          <div className="flex gap-3 justify-between pt-4 border-t">
            <Button
              variant="secondary"
              onClick={handlePreviewEmail}
              className="text-gray-700"
            >
              Xem trước Email
            </Button>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setDecisionModal(null);
                  setDecision("accepted");
                  setNotes("");
                  setFinalScore("");
                  setReviews(prev => {
                    const newReviews = { ...prev };
                    delete newReviews[decisionModal?.id];
                    return newReviews;
                  });
                }}
              >
                Hủy
              </Button>
              <Button onClick={handleMakeDecision}>
                {decisions[decisionModal?.id] ? "Cập nhật quyết định" : "Xác nhận quyết định"}
              </Button>
            </div>

          </div>
        </div>
      </Modal>

      {/* Bulk Decision Modal */}
      <Modal
        isOpen={bulkDecisionModal}
        onClose={() => setBulkDecisionModal(false)}
        title={`Xác nhận quyết định hàng loạt (${selectedIds.length} bài)`}
      >
        <div className="space-y-4">
          <p>
            Bạn đang thực hiện quyết định <strong>{decision === 'accepted' ? 'Chấp nhận' : (decision === 'rejected' ? 'Từ chối' : decision)}</strong> cho <strong>{selectedIds.length}</strong> bài nộp đã chọn.
          </p>
          <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200 text-sm text-yellow-800">
            <p>Email thông báo sẽ được gửi tự động đến tất cả tác giả (và đồng tác giả).</p>
          </div>
          <Input
            label="Ghi chú chung (tùy chọn)"
            type="textarea"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ghi chú này sẽ được gửi kèm trong email..."
            className="min-h-[100px]"
          />
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="secondary" onClick={() => setBulkDecisionModal(false)}>Hủy</Button>
            <Button onClick={handleBulkSubmit}>Xác nhận & Gửi</Button>
          </div>
        </div>
      </Modal>

      {/* Email Preview Modal */}
      <Modal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        title="Xem trước Email thông báo"
        size="lg"
      >
        {emailPreview ? (
          <div className="space-y-4">
            <div className="border-b pb-2">
              <p className="text-sm text-gray-500">Tiêu đề:</p>
              <p className="font-medium text-gray-900">{emailPreview.subject}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-[60vh] overflow-y-auto">
              <div dangerouslySetInnerHTML={{ __html: emailPreview.html_content }} />
            </div>
            <div className="flex justify-end pt-4">
              <Button onClick={() => setShowPreviewModal(false)}>Đóng</Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600 mx-auto" />
            <p className="mt-2 text-gray-500">Đang tạo bản xem trước...</p>
          </div>
        )}
      </Modal>
    </div>
  );
}