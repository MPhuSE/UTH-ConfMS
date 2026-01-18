import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { emailTemplateService, conferenceService } from "../../../services";
import { toast } from "react-hot-toast";
import Table from "../../../components/Table";
import Button from "../../../components/Button";
import Input from "../../../components/Input";
import Modal from "../../../components/Modal";
import AIEmailTemplateAssistant from "./AIEmailTemplateAssistant";
import { Plus, Edit, Trash2, Mail, Eye } from "lucide-react";

/**
 * Trang quản lý Email Templates cho Conference Manager
 */
export default function EmailTemplatesPage() {
  const { conferenceId } = useParams();
  const [templates, setTemplates] = useState([]);
  const [conference, setConference] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    body: "",
    template_type: "notification",
  });

  useEffect(() => {
    if (conferenceId) {
      loadData();
    }
  }, [conferenceId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load conference
      const confData = await conferenceService.getById(conferenceId);
      setConference(confData);

      // Load email templates by conference
      const templatesData = await emailTemplateService.getByConference(conferenceId);
      setTemplates(templatesData || []);
    } catch (error) {
      toast.error("Không thể tải dữ liệu email templates");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingTemplate(null);
    setFormData({
      name: "",
      subject: "",
      body: "",
      template_type: "notification",
    });
    setShowModal(true);
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name || "",
      subject: template.subject || "",
      body: template.body || "",
      template_type: template.template_type || "notification",
    });
    setShowModal(true);
  };

  const handlePreview = (template) => {
    setPreviewTemplate(template);
    setShowPreviewModal(true);
  };

  const handleDelete = async (templateId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa template này?")) return;

    try {
      await emailTemplateService.delete(templateId);
      toast.success("Đã xóa email template");
      loadData();
    } catch (error) {
      toast.error("Không thể xóa email template");
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const payload = {
        ...formData,
        conference_id: parseInt(conferenceId),
      };

      if (editingTemplate) {
        await emailTemplateService.update(editingTemplate.id, payload);
        toast.success("Đã cập nhật email template");
      } else {
        await emailTemplateService.create(payload);
        toast.success("Đã tạo email template mới");
      }

      setShowModal(false);
      loadData();
    } catch (error) {
      toast.error(error?.response?.data?.detail || "Có lỗi xảy ra");
      console.error(error);
    }
  };

  const columns = [
    {
      header: "Name",
      accessor: "name",
      render: (row) => (
        <div>
          <div className="font-medium">{row.name}</div>
          <div className="text-sm text-gray-500">{row.template_type}</div>
        </div>
      ),
    },
    {
      header: "Subject",
      accessor: "subject",
      render: (row) => (
        <div className="max-w-md truncate">{row.subject || "-"}</div>
      ),
    },
    {
      header: "Type",
      accessor: "template_type",
      render: (row) => {
        const types = {
          notification: "Notification",
          acceptance: "Acceptance",
          rejection: "Rejection",
          reminder: "Reminder",
          invitation: "Invitation",
        };
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
            {types[row.template_type] || row.template_type}
          </span>
        );
      },
    },
    {
      header: "Actions",
      accessor: "id",
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handlePreview(row)}
            className="p-2 text-green-600 hover:bg-green-50 rounded"
            title="Preview"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => handleEdit(row)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
            title="Edit"
          >
            <Edit size={16} />
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
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Email Templates</h1>
          <p className="mt-1 text-sm text-gray-500">
            {conference?.name || `Conference #${conferenceId}`}
          </p>
        </div>
        <div className="flex gap-3">
          <AIEmailTemplateAssistant onTemplateGenerated={loadData} />
          <Button onClick={handleCreate} className="flex items-center gap-2">
            <Plus size={16} />
            Thêm Template
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="text-sm text-gray-500">Total Templates</div>
          <div className="text-2xl font-semibold">{templates.length}</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-sm text-gray-500">Notifications</div>
          <div className="text-2xl font-semibold text-blue-600">
            {templates.filter((t) => t.template_type === "notification").length}
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-sm text-gray-500">Acceptance</div>
          <div className="text-2xl font-semibold text-green-600">
            {templates.filter((t) => t.template_type === "acceptance").length}
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-sm text-gray-500">Rejection</div>
          <div className="text-2xl font-semibold text-red-600">
            {templates.filter((t) => t.template_type === "rejection").length}
          </div>
        </div>
      </div>

      {/* Templates Table */}
      <div className="bg-white rounded-lg border">
        <Table data={templates} columns={columns} />
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingTemplate ? "Chỉnh sửa Email Template" : "Thêm Email Template mới"}
        size="large"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Template Name *
            </label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="e.g., Acceptance Notification"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Template Type *
            </label>
            <select
              value={formData.template_type}
              onChange={(e) => setFormData({ ...formData, template_type: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              required
            >
              <option value="notification">Notification</option>
              <option value="acceptance">Acceptance</option>
              <option value="rejection">Rejection</option>
              <option value="reminder">Reminder</option>
              <option value="invitation">Invitation</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject *
            </label>
            <Input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              required
              placeholder="Email subject line"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Body *
            </label>
            <textarea
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              required
              rows={10}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="Email body (supports variables like {{author_name}}, {{paper_title}}, etc.)"
            />
            <p className="mt-1 text-xs text-gray-500">
              Available variables: {"{{author_name}}"}, {"{{paper_title}}"}, {"{{conference_name}}"}, {"{{decision}}"}
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              {editingTemplate ? "Cập nhật" : "Tạo mới"}
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

      {/* Preview Modal */}
      <Modal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        title="Preview Email Template"
        size="large"
      >
        {previewTemplate && (
          <div className="space-y-4">
            <div>
              <div className="text-sm font-medium text-gray-700 mb-1">Subject:</div>
              <div className="p-3 bg-gray-50 rounded-lg">{previewTemplate.subject}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700 mb-1">Body:</div>
              <div className="p-3 bg-gray-50 rounded-lg whitespace-pre-wrap">
                {previewTemplate.body}
              </div>
            </div>
            <div className="pt-4">
              <Button onClick={() => setShowPreviewModal(false)} className="w-full">
                Đóng
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
