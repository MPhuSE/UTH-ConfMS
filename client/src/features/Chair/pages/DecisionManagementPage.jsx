import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { decisionService, reviewService, submissionService, conferenceService } from "../../../services";
import { CheckCircle, XCircle, FileText, AlertCircle, Edit, Star, Users } from "lucide-react";
import Modal from "../../../components/Modal";
import Button from "../../../components/Button";
import Input from "../../../components/Input";
import Table from "../../../components/Table";
import { toast } from "react-hot-toast";

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
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState({});
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [conferences, setConferences] = useState([]);
  const [selectedConferenceId, setSelectedConferenceId] = useState(
    conferenceId ? parseInt(conferenceId, 10) : null
  );
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
    if (!confId) {
      setLoading(false);
      return;
    }

    try {
      if (!isMountedRef.current) return;
      setLoading(true);
      
      const submissionsResponse = await submissionService.getAll();
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
      
      // Enhanced function to get conference ID from submission
      const getConferenceId = (s) => {
        // Try multiple possible paths
        if (s.conference_id) return s.conference_id;
        if (s.track?.conference_id) return s.track.conference_id;
        if (s.track?.conference?.id) return s.track.conference.id;
        if (s.conference?.id) return s.conference.id;
        return null;
      };
      
      // Debug logging
      console.log("[DecisionManagement] Conference ID:", confId, typeof confId);
      console.log("[DecisionManagement] Total submissions:", submissionsData.length);
      
      // Filter by conference first
      const conferenceSubmissions = submissionsData.filter((s) => {
        const sConfId = getConferenceId(s);
        const matches = sConfId !== null && parseInt(sConfId) === parseInt(confId);
        if (!matches && sConfId) {
          console.log("[DecisionManagement] Mismatch:", {
            submissionId: s.id,
            submissionConfId: sConfId,
            expectedConfId: confId,
            submission: s
          });
        }
        return matches;
      });
      
      console.log("[DecisionManagement] Submissions for conference:", conferenceSubmissions.length);
      if (conferenceSubmissions.length > 0) {
        console.log("[DecisionManagement] Submission statuses:", conferenceSubmissions.map(s => ({ 
          id: s.id, 
          status: s.status, 
          title: s.title?.substring(0, 50) 
        })));
      } else {
        console.warn("[DecisionManagement] No submissions found for conference", confId);
        console.log("[DecisionManagement] Sample submission structure:", submissionsData[0]);
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
      
      console.log("[DecisionManagement] Filtered submissions (after status filter):", filtered.length);
      
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
        toast.error("Không thể tải dữ liệu");
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
      await decisionService.makeDecision({
        submission_id: decisionModal.id,
        decision,
        decision_notes: notes,
      });
      toast.success("Quyết định đã được ghi nhận");
      setDecisionModal(null);
      setDecision("accepted");
      setNotes("");
      loadData();
    } catch (error) {
      toast.error(error?.response?.data?.detail || "Không thể ghi nhận quyết định");
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
      header: "Tiêu đề",
      accessor: "title",
      render: (row) => (
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-gray-400" />
          <span className="font-medium">{row.title}</span>
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
          className="!w-auto"
        >
          {decisions[row.id] ? "Sửa quyết định" : "Quyết định"}
        </Button>
      ),
    },
  ];

  // Calculate statistics
  const totalSubmissions = submissions.length;
  const decidedCount = Object.keys(decisions).length;
  const pendingCount = Math.max(0, totalSubmissions - decidedCount); // Prevent negative values
  
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
          <p className="text-xs text-gray-400 mt-2">
            Mở Console (F12) để xem chi tiết debug.
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
              <p className="text-sm text-gray-600">
                <span className="font-medium">Track:</span> {decisionModal.track.name}
              </p>
            )}
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
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          review.recommendation.toLowerCase() === 'accept' 
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
              <label className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                decision === "accepted" 
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

              <label className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                decision === "rejected" 
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

              <label className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                decision === "minor_revision" 
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

              <label className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                decision === "major_revision" 
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
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button
              variant="secondary"
              onClick={() => {
                setDecisionModal(null);
                setDecision("accepted");
                setNotes("");
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
      </Modal>
    </div>
  );
}