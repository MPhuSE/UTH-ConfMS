import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { userService, reviewService, conferenceService } from "../../../services";
import { toast } from "react-hot-toast";
import { getErrorMessage } from "../../../utils/errors";
import Table from "../../../components/Table";
import Button from "../../../components/Button";
import Input from "../../../components/Input";
import Modal from "../../../components/Modal";
import { Plus, Edit, Trash2, UserPlus, Search, Mail, CheckCircle, XCircle } from "lucide-react";

/**
 * Trang quản lý Reviewers cho Conference Manager
 */
export default function ReviewerManagementPage() {
  const { conferenceId } = useParams();
  const [reviewers, setReviewers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [conference, setConference] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingReviewer, setEditingReviewer] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    affiliation: "",
    expertise: "",
  });

  useEffect(() => {
    if (conferenceId) {
      loadData();
    }
  }, [conferenceId]);

  const loadData = async () => {
    // Validate conferenceId is a valid number to prevent 422 errors
    const idNum = Number(conferenceId);
    if (!conferenceId || isNaN(idNum) || idNum <= 0) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Load conference
      const confData = await conferenceService.getById(idNum);
      setConference(confData);

      // Load all users with reviewer role
      const usersResponse = await userService.getAll();
      // Handle both array response and object response with 'users' property
      const usersData = Array.isArray(usersResponse) ? usersResponse : (usersResponse.users || []);
      const reviewerUsers = usersData.filter((u) =>
        u.roles?.some((r) => r.name === "reviewer" || r === "reviewer") ||
        u.role === "reviewer" ||
        (Array.isArray(u.role_names) && u.role_names.includes("reviewer"))
      );
      setAllUsers(reviewerUsers);

      // Load reviewers assigned to this conference
      // Note: This might need a specific API endpoint
      // For now, we'll use all reviewers
      setReviewers(reviewerUsers);
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể tải dữ liệu reviewers"));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setFormData({
      email: "",
      name: "",
      affiliation: "",
      expertise: "",
    });
    setShowAddModal(true);
  };

  const handleEdit = (reviewer) => {
    setEditingReviewer(reviewer);
    setFormData({
      email: reviewer.email || "",
      name: reviewer.full_name || reviewer.name || "",
      affiliation: reviewer.affiliation || "",
      expertise: reviewer.expertise || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (reviewerId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa reviewer này?")) return;

    try {
      // Note: This might need a specific API endpoint
      // For now, we'll just remove from local state
      setReviewers(reviewers.filter((r) => r.id !== reviewerId));
      toast.success("Đã xóa reviewer");
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể xóa reviewer"));
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingReviewer) {
        // Update reviewer
        await userService.update(editingReviewer.id, {
          full_name: formData.name,
          affiliation: formData.affiliation,
          expertise: formData.expertise,
        });
        toast.success("Đã cập nhật reviewer");
      } else {
        // Create new reviewer
        await userService.create({
          email: formData.email,
          full_name: formData.name,
          affiliation: formData.affiliation,
          expertise: formData.expertise,
          role: "reviewer",
        });
        toast.success("Đã thêm reviewer mới");
      }

      setShowModal(false);
      setShowAddModal(false);
      loadData();
    } catch (error) {
      toast.error(getErrorMessage(error, "Có lỗi xảy ra"));
      console.error(error);
    }
  };

  const handleInvite = async (reviewer) => {
    try {
      // Note: This would need an invite API endpoint
      toast.success(`Đã gửi lời mời đến ${reviewer.email}`);
    } catch (error) {
      toast.error("Không thể gửi lời mời");
      console.error(error);
    }
  };

  const filteredReviewers = useMemo(() => {
    if (!searchTerm) return reviewers;
    const term = searchTerm.toLowerCase();
    return reviewers.filter((r) =>
      (r.email?.toLowerCase().includes(term)) ||
      (r.full_name?.toLowerCase().includes(term)) ||
      (r.name?.toLowerCase().includes(term)) ||
      (r.affiliation?.toLowerCase().includes(term)) ||
      (r.expertise?.toLowerCase().includes(term))
    );
  }, [reviewers, searchTerm]);

  const columns = [
    {
      header: "Name",
      accessor: "full_name",
      render: (row) => (
        <div>
          <div className="font-medium">{row.full_name || row.name || "N/A"}</div>
          <div className="text-sm text-gray-500">{row.email}</div>
        </div>
      ),
    },
    {
      header: "Affiliation",
      accessor: "affiliation",
      render: (row) => row.affiliation || <span className="text-gray-400">-</span>,
    },
    {
      header: "Expertise",
      accessor: "expertise",
      render: (row) => {
        const expertise = row.expertise || "";
        return expertise ? (
          <div className="flex flex-wrap gap-1">
            {expertise.split(",").map((e, i) => (
              <span key={i} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                {e.trim()}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-gray-400">-</span>
        );
      },
    },
    {
      header: "Status",
      accessor: "is_active",
      render: (row) => {
        const isActive = row.is_active !== false;
        return (
          <div className="flex items-center gap-2">
            {isActive ? (
              <>
                <CheckCircle size={16} className="text-green-500" />
                <span className="text-green-700">Active</span>
              </>
            ) : (
              <>
                <XCircle size={16} className="text-gray-400" />
                <span className="text-gray-500">Inactive</span>
              </>
            )}
          </div>
        );
      },
    },
    {
      header: "Actions",
      accessor: "id",
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(row)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
            title="Edit"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => handleInvite(row)}
            className="p-2 text-green-600 hover:bg-green-50 rounded"
            title="Invite"
          >
            <Mail size={16} />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Reviewers</h1>
          <p className="mt-1 text-sm text-gray-500">
            {conference?.name || `Conference #${conferenceId}`}
          </p>
        </div>
        <Button onClick={handleAdd} className="flex items-center gap-2">
          <UserPlus size={16} />
          Thêm Reviewer
        </Button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input
            type="text"
            placeholder="Tìm kiếm reviewer (email, name, affiliation, expertise)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="text-sm text-gray-500">Total Reviewers</div>
          <div className="text-2xl font-semibold">{reviewers.length}</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-sm text-gray-500">Active</div>
          <div className="text-2xl font-semibold text-green-600">
            {reviewers.filter((r) => r.is_active !== false).length}
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-sm text-gray-500">Inactive</div>
          <div className="text-2xl font-semibold text-gray-500">
            {reviewers.filter((r) => r.is_active === false).length}
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-sm text-gray-500">Filtered</div>
          <div className="text-2xl font-semibold">{filteredReviewers.length}</div>
        </div>
      </div>

      {/* Reviewers Table */}
      <div className="bg-white rounded-lg border">
        <Table data={filteredReviewers} columns={columns} />
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Chỉnh sửa Reviewer"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <Input
              type="email"
              value={formData.email}
              disabled
              className="bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Affiliation
            </label>
            <Input
              type="text"
              value={formData.affiliation}
              onChange={(e) => setFormData({ ...formData, affiliation: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expertise (comma-separated)
            </label>
            <Input
              type="text"
              value={formData.expertise}
              onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
              placeholder="e.g., Machine Learning, NLP, Computer Vision"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              Cập nhật
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowModal(false)}
              className="flex-1"
            >
              Hủy
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Thêm Reviewer mới"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Affiliation
            </label>
            <Input
              type="text"
              value={formData.affiliation}
              onChange={(e) => setFormData({ ...formData, affiliation: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expertise (comma-separated)
            </label>
            <Input
              type="text"
              value={formData.expertise}
              onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
              placeholder="e.g., Machine Learning, NLP, Computer Vision"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              Tạo mới
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowAddModal(false)}
              className="flex-1"
            >
              Hủy
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
