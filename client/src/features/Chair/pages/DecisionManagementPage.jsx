import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { decisionService, reviewService, submissionService } from "../../../services";
import { CheckCircle, XCircle, FileText, AlertCircle } from "lucide-react";
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
  const [submissions, setSubmissions] = useState([]);
  const [decisions, setDecisions] = useState({});
  const [decisionModal, setDecisionModal] = useState(null);
  const [decision, setDecision] = useState("accept");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [conferenceId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const submissionsData = await submissionService.getAll();
      const filtered = submissionsData.filter(
        (s) => s.conference_id === parseInt(conferenceId) && s.status === "under_review"
      );
      setSubmissions(filtered);

      // Load decisions
      try {
        const decisionsData = await decisionService.getDecisionsByConference(conferenceId);
        const decisionsMap = {};
        decisionsData.forEach((d) => {
          decisionsMap[d.submission_id] = d;
        });
        setDecisions(decisionsMap);
      } catch (error) {
        console.error("Error loading decisions:", error);
      }
    } catch (error) {
      toast.error("Không thể tải dữ liệu");
      console.error(error);
    } finally {
      setLoading(false);
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
      setDecision("accept");
      setNotes("");
      loadData();
    } catch (error) {
      toast.error("Không thể ghi nhận quyết định");
      console.error(error);
    }
  };

  const getDecisionBadge = (submissionId) => {
    const decision = decisions[submissionId];
    if (!decision) return null;

    const isAccept = decision.decision === "accept";
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
          isAccept
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
        }`}
      >
        {isAccept ? (
          <CheckCircle className="w-3 h-3" />
        ) : (
          <XCircle className="w-3 h-3" />
        )}
        {isAccept ? "Chấp nhận" : "Từ chối"}
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
          onClick={() => setDecisionModal(row)}
          className="!w-auto"
        >
          Quyết định
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quản lý quyết định</h1>
        <p className="mt-1 text-sm text-gray-500">Đưa ra quyết định cho các bài nộp</p>
      </div>

      <Table columns={columns} data={submissions} loading={loading} />

      {/* Decision Modal */}
      <Modal
        isOpen={!!decisionModal}
        onClose={() => {
          setDecisionModal(null);
          setDecision("accept");
          setNotes("");
        }}
        title="Quyết định bài nộp"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">
              Bài nộp: <span className="font-medium">{decisionModal?.title}</span>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quyết định
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="accept"
                  checked={decision === "accept"}
                  onChange={(e) => setDecision(e.target.value)}
                  className="mr-2"
                />
                <span className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  Chấp nhận
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="reject"
                  checked={decision === "reject"}
                  onChange={(e) => setDecision(e.target.value)}
                  className="mr-2"
                />
                <span className="flex items-center gap-1 text-red-600">
                  <XCircle className="w-4 h-4" />
                  Từ chối
                </span>
              </label>
            </div>
          </div>

          <Input
            label="Ghi chú"
            type="textarea"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Nhập ghi chú (tùy chọn)"
            className="min-h-[100px]"
          />

          <div className="flex gap-3 justify-end">
            <Button
              variant="secondary"
              onClick={() => {
                setDecisionModal(null);
                setDecision("accept");
                setNotes("");
              }}
            >
              Hủy
            </Button>
            <Button onClick={handleMakeDecision}>Xác nhận</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}