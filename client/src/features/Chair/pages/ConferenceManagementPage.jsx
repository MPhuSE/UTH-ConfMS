import { useEffect, useMemo, useState } from "react";
import { conferenceService } from "../../../services";
import { toast } from "react-hot-toast";
import Table from "../../../components/Table";
import Button from "../../../components/Button";
import Input from "../../../components/Input";
import Modal from "../../../components/Modal";
import { Plus, Edit, Trash2 } from "lucide-react";

const toDateInput = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
};

const fromDateInput = (value) => {
  if (!value || !value.trim()) return null;
  try {
    // Parse date string (YYYY-MM-DD) and convert to ISO string
    // Use UTC midnight to avoid timezone issues
    const date = new Date(`${value}T00:00:00.000Z`);
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date: ${value}`);
      return null;
    }
    // Return ISO string format that Pydantic expects
    return date.toISOString();
  } catch (error) {
    console.warn(`Error parsing date: ${value}`, error);
    return null;
  }
};

export default function ConferenceManagementPage() {
  const [loading, setLoading] = useState(true);
  const [conferences, setConferences] = useState([]);
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [form, setForm] = useState({
    name: "",
    abbreviation: "",
    description: "",
    website_url: "",
    start_date: "",
    end_date: "",
    submission_deadline: "",
    review_deadline: "",
    is_open: true,
    double_blind: true,
  });

  useEffect(() => {
    loadConferences();
  }, []);

  const loadConferences = async () => {
    try {
      setLoading(true);
      const data = await conferenceService.getAll();
      setConferences(data.conferences || data || []);
    } catch (err) {
      toast.error("Không thể tải danh sách hội nghị");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      abbreviation: "",
      description: "",
      website_url: "",
      start_date: "",
      end_date: "",
      submission_deadline: "",
      review_deadline: "",
      is_open: true,
      double_blind: true,
    });
  };

  const openEdit = (conf) => {
    setEditModal(conf);
    setForm({
      name: conf.name || "",
      abbreviation: conf.abbreviation || "",
      description: conf.description || "",
      website_url: conf.website_url || "",
      start_date: toDateInput(conf.start_date),
      end_date: toDateInput(conf.end_date),
      submission_deadline: toDateInput(conf.submission_deadline),
      review_deadline: toDateInput(conf.review_deadline),
      is_open: !!conf.is_open,
      double_blind: !!conf.double_blind,
    });
  };

  const buildPayload = () => {
    const payload = {
      name: form.name.trim(),
      abbreviation: form.abbreviation?.trim() || null,
      description: form.description?.trim() || null,
      website_url: form.website_url?.trim() || null,
      is_open: Boolean(form.is_open),
      double_blind: Boolean(form.double_blind),
    };
    
    // Add dates only if they exist (Pydantic expects Optional[datetime] or None)
    const startDate = fromDateInput(form.start_date);
    const endDate = fromDateInput(form.end_date);
    const submissionDeadline = fromDateInput(form.submission_deadline);
    const reviewDeadline = fromDateInput(form.review_deadline);
    
    if (startDate) payload.start_date = startDate;
    if (endDate) payload.end_date = endDate;
    if (submissionDeadline) payload.submission_deadline = submissionDeadline;
    if (reviewDeadline) payload.review_deadline = reviewDeadline;
    
    return payload;
  };

  const handleCreate = async () => {
    try {
      if (!form.name.trim()) {
        toast.error("Tên hội nghị không được để trống");
        return;
      }
      
      const payload = buildPayload();
      console.log("Creating conference with payload:", payload);
      
      await conferenceService.create(payload);
      toast.success("Tạo hội nghị thành công");
      setCreateModal(false);
      resetForm();
      loadConferences();
    } catch (err) {
      console.error("Create conference error:", err);
      console.error("Error response:", err?.response?.data);
      console.error("Error detail:", err?.response?.data?.detail);
      
      const detail = err?.response?.data?.detail;
      let message = "Không thể tạo hội nghị";
      
      if (typeof detail === "string") {
        message = detail;
      } else if (Array.isArray(detail)) {
        // Pydantic validation errors
        const errors = detail.map((e) => {
          const field = Array.isArray(e.loc) ? e.loc.slice(1).join(".") : "unknown";
          return `${field}: ${e.msg}`;
        }).join(", ");
        message = `Validation error: ${errors}`;
      } else if (detail && typeof detail === "object") {
        message = JSON.stringify(detail, null, 2);
      }
      
      toast.error(message);
    }
  };

  const handleUpdate = async () => {
    if (!editModal) return;
    try {
      await conferenceService.update(editModal.id, buildPayload());
      toast.success("Cập nhật hội nghị thành công");
      setEditModal(null);
      resetForm();
      loadConferences();
    } catch (err) {
      const message = err?.response?.data?.detail || "Không thể cập nhật hội nghị";
      toast.error(message);
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    try {
      await conferenceService.delete(deleteModal.id);
      toast.success("Xóa hội nghị thành công");
      setDeleteModal(null);
      loadConferences();
    } catch (err) {
      const message = err?.response?.data?.detail || "Không thể xóa hội nghị";
      toast.error(message);
      console.error(err);
    }
  };

  const columns = useMemo(
    () => [
      { header: "ID", accessor: "id" },
      { header: "Tên", accessor: "name" },
      { header: "Viết tắt", accessor: "abbreviation" },
      {
        header: "Hạn nộp",
        accessor: "submission_deadline",
        render: (row) => (row.submission_deadline ? toDateInput(row.submission_deadline) : "N/A"),
      },
      {
        header: "Trạng thái",
        accessor: "is_open",
        render: (row) => (
          <span className={`px-2 py-0.5 rounded text-xs ${row.is_open ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
            {row.is_open ? "Open" : "Closed"}
          </span>
        ),
      },
      {
        header: "Thao tác",
        accessor: "actions",
        render: (row) => (
          <div className="flex items-center gap-2">
            <button
              onClick={() => openEdit(row)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDeleteModal(row)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý hội nghị</h1>
          <p className="mt-1 text-sm text-gray-500">Tạo, chỉnh sửa và quản lý hội nghị</p>
        </div>
        <Button onClick={() => setCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Tạo hội nghị
        </Button>
      </div>

      <Table columns={columns} data={conferences} loading={loading} />

      {/* Create Modal */}
      <Modal
        isOpen={createModal}
        onClose={() => {
          setCreateModal(false);
          resetForm();
        }}
        title="Tạo hội nghị"
        size="lg"
      >
        <div className="space-y-4">
          <Input label="Tên hội nghị" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Viết tắt" value={form.abbreviation} onChange={(e) => setForm({ ...form, abbreviation: e.target.value })} />
          <Input label="Website" value={form.website_url} onChange={(e) => setForm({ ...form, website_url: e.target.value })} />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Mô tả</label>
            <textarea
              rows={4}
              className="w-full px-4 py-2 rounded-lg border text-sm border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-300"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start date" type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
            <Input label="End date" type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
            <Input
              label="Submission deadline"
              type="date"
              value={form.submission_deadline}
              onChange={(e) => setForm({ ...form, submission_deadline: e.target.value })}
            />
            <Input
              label="Review deadline"
              type="date"
              value={form.review_deadline}
              onChange={(e) => setForm({ ...form, review_deadline: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={form.is_open} onChange={(e) => setForm({ ...form, is_open: e.target.checked })} />
              Open CFP
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={form.double_blind} onChange={(e) => setForm({ ...form, double_blind: e.target.checked })} />
              Double blind
            </label>
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => { setCreateModal(false); resetForm(); }}>
              Hủy
            </Button>
            <Button onClick={handleCreate}>Tạo</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editModal}
        onClose={() => {
          setEditModal(null);
          resetForm();
        }}
        title="Cập nhật hội nghị"
        size="lg"
      >
        <div className="space-y-4">
          <Input label="Tên hội nghị" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Viết tắt" value={form.abbreviation} onChange={(e) => setForm({ ...form, abbreviation: e.target.value })} />
          <Input label="Website" value={form.website_url} onChange={(e) => setForm({ ...form, website_url: e.target.value })} />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Mô tả</label>
            <textarea
              rows={4}
              className="w-full px-4 py-2 rounded-lg border text-sm border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-300"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start date" type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
            <Input label="End date" type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
            <Input
              label="Submission deadline"
              type="date"
              value={form.submission_deadline}
              onChange={(e) => setForm({ ...form, submission_deadline: e.target.value })}
            />
            <Input
              label="Review deadline"
              type="date"
              value={form.review_deadline}
              onChange={(e) => setForm({ ...form, review_deadline: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={form.is_open} onChange={(e) => setForm({ ...form, is_open: e.target.checked })} />
              Open CFP
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={form.double_blind} onChange={(e) => setForm({ ...form, double_blind: e.target.checked })} />
              Double blind
            </label>
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => { setEditModal(null); resetForm(); }}>
              Hủy
            </Button>
            <Button onClick={handleUpdate}>Cập nhật</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Xác nhận xóa"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Bạn có chắc chắn muốn xóa hội nghị "{deleteModal?.name}"?
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setDeleteModal(null)}>
              Hủy
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Xóa
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

