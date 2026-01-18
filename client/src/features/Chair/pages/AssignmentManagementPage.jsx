import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { reviewService, submissionService, userService } from "../../../services";
import { UserPlus, Users, FileText, X } from "lucide-react";
import Modal from "../../../components/Modal";
import Button from "../../../components/Button";
import Input from "../../../components/Input";
import Table from "../../../components/Table";
import { toast } from "react-hot-toast";

/**
 * Trang quản lý phân công reviewer cho Chair
 */
export default function AssignmentManagementPage() {
  const { conferenceId } = useParams();
  const [submissions, setSubmissions] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [assignModal, setAssignModal] = useState(null);
  const [reviewers, setReviewers] = useState([]);
  const [reviewerId, setReviewerId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [conferenceId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const submissionsData = await submissionService.getAll();
      setSubmissions(submissionsData.filter((s) => s.conference_id === parseInt(conferenceId)));

      // Load reviewer pool
      try {
        const r = await userService.listUsersByRole("reviewer");
        setReviewers(r.users || []);
      } catch (e) {
        // still allow manual ID, but show warning
        setReviewers([]);
      }

      // Load assignments for each submission
      const assignmentsData = {};
      for (const submission of submissionsData) {
        try {
          const assigns = await reviewService.getAssignmentsBySubmission(submission.id);
          assignmentsData[submission.id] = assigns;
        } catch (error) {
          assignmentsData[submission.id] = [];
        }
      }
      setAssignments(assignmentsData);
    } catch (error) {
      toast.error("Không thể tải dữ liệu");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!assignModal || !reviewerId) {
      toast.error("Vui lòng chọn Reviewer");
      return;
    }

    try {
      await reviewService.assignReviewer({
        submission_id: assignModal.id,
        reviewer_id: parseInt(reviewerId),
        auto_assigned: false,
      });
      toast.success("Phân công thành công");
      setAssignModal(null);
      setReviewerId("");
      loadData();
    } catch (error) {
      const message = error?.response?.data?.detail || "Không thể phân công reviewer";
      toast.error(message);
      console.error(error);
    }
  };

  const handleUnassign = async (submissionId, reviewerId) => {
    try {
      await reviewService.unassignReviewer(submissionId, reviewerId);
      toast.success("Hủy phân công thành công");
      loadData();
    } catch (error) {
      toast.error("Không thể hủy phân công");
      console.error(error);
    }
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
      header: "Reviewers",
      accessor: "reviewers",
      render: (row) => {
        const assigns = assignments[row.id] || [];
        return (
          <div className="flex flex-wrap gap-2">
            {assigns.map((assign) => (
              <span
                key={assign.reviewer_id}
                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
              >
                Reviewer #{assign.reviewer_id}
                <button
                  onClick={() => handleUnassign(row.id, assign.reviewer_id)}
                  className="hover:text-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        );
      },
    },
    {
      header: "Thao tác",
      accessor: "actions",
      render: (row) => (
        <Button
          variant="secondary"
          onClick={() => setAssignModal(row)}
          className="!w-auto"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Phân công
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quản lý phân công Reviewer</h1>
        <p className="mt-1 text-sm text-gray-500">Phân công reviewers cho các bài nộp</p>
      </div>

      <Table columns={columns} data={submissions} loading={loading} />

      {/* Assign Modal */}
      <Modal
        isOpen={!!assignModal}
        onClose={() => {
          setAssignModal(null);
          setReviewerId("");
        }}
        title="Phân công Reviewer"
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">
              Bài nộp: <span className="font-medium">{assignModal?.title}</span>
            </p>
          </div>
          {reviewers.length > 0 ? (
            <div className="flex flex-col gap-1 w-full">
              <label className="text-sm font-medium text-gray-700">
                Reviewer <span className="text-red-500 ml-1">*</span>
              </label>
              <select
                value={reviewerId}
                onChange={(e) => setReviewerId(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border text-sm border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-300"
              >
                <option value="">-- Chọn reviewer --</option>
                {reviewers.map((r) => (
                  <option key={r.id} value={r.id}>
                    #{r.id} - {r.full_name || r.email}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <Input
              label="Reviewer ID"
              type="number"
              value={reviewerId}
              onChange={(e) => setReviewerId(e.target.value)}
              placeholder="Nhập ID của reviewer"
              required
            />
          )}
          <div className="flex gap-3 justify-end">
            <Button
              variant="secondary"
              onClick={() => {
                setAssignModal(null);
                setReviewerId("");
              }}
            >
              Hủy
            </Button>
            <Button onClick={handleAssign}>Phân công</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}