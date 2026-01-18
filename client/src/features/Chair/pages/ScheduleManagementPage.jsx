import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { scheduleService, conferenceService, submissionService } from "../../../services";
import { toast } from "react-hot-toast";
import Table from "../../../components/Table";
import Button from "../../../components/Button";
import Input from "../../../components/Input";
import Modal from "../../../components/Modal";
import { Plus, Edit, Trash2, Calendar, Clock, FileText } from "lucide-react";

/**
 * Trang quản lý Schedule và Sessions cho Conference
 */
export default function ScheduleManagementPage() {
  const { conferenceId } = useParams();
  const navigate = useNavigate();
  const [scheduleItems, setScheduleItems] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [conference, setConference] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    session_id: "",
    submission_id: "",
    start_time: "",
    end_time: "",
    order_index: 0,
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

      // Load schedule items
      const scheduleData = await scheduleService.getByConference(conferenceId);
      setScheduleItems(scheduleData || []);

      // Load sessions (if available via conference)
      if (confData.sessions) {
        setSessions(confData.sessions || []);
      }

      // Load accepted submissions for scheduling
      const subsData = await submissionService.getAll();
      const acceptedSubs = subsData.filter(
        (s) => s.conference_id === parseInt(conferenceId) && s.decision === "accepted"
      );
      setSubmissions(acceptedSubs);
    } catch (error) {
      toast.error("Không thể tải dữ liệu schedule");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingItem(null);
    setFormData({
      session_id: "",
      submission_id: "",
      start_time: "",
      end_time: "",
      order_index: scheduleItems.length,
    });
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      session_id: item.session_id || "",
      submission_id: item.submission_id || "",
      start_time: item.start_time ? new Date(item.start_time).toISOString().slice(0, 16) : "",
      end_time: item.end_time ? new Date(item.end_time).toISOString().slice(0, 16) : "",
      order_index: item.order_index || 0,
    });
    setShowModal(true);
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa schedule item này?")) return;

    try {
      await scheduleService.delete(itemId);
      toast.success("Đã xóa schedule item");
      loadData();
    } catch (error) {
      toast.error("Không thể xóa schedule item");
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const payload = {
        conference_id: parseInt(conferenceId),
        session_id: parseInt(formData.session_id),
        submission_id: formData.submission_id ? parseInt(formData.submission_id) : null,
        start_time: new Date(formData.start_time).toISOString(),
        end_time: new Date(formData.end_time).toISOString(),
        order_index: parseInt(formData.order_index),
      };

      if (editingItem) {
        await scheduleService.update(editingItem.id, payload);
        toast.success("Đã cập nhật schedule item");
      } else {
        await scheduleService.create(payload);
        toast.success("Đã tạo schedule item");
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
      header: "Order",
      accessor: "order_index",
      render: (row) => <span className="font-semibold">#{row.order_index}</span>,
    },
    {
      header: "Session",
      accessor: "session_id",
      render: (row) => {
        const session = sessions.find((s) => s.id === row.session_id);
        return session ? (
          <div>
            <div className="font-medium">{session.title || `Session #${row.session_id}`}</div>
            {session.room && <div className="text-sm text-gray-500">Room: {session.room}</div>}
          </div>
        ) : (
          `Session #${row.session_id}`
        );
      },
    },
    {
      header: "Submission",
      accessor: "submission_id",
      render: (row) => {
        if (!row.submission_id) return <span className="text-gray-400">-</span>;
        const sub = submissions.find((s) => s.id === row.submission_id);
        return sub ? (
          <div className="max-w-xs">
            <div className="font-medium truncate">{sub.title || `Paper #${row.submission_id}`}</div>
            <div className="text-sm text-gray-500">ID: {row.submission_id}</div>
          </div>
        ) : (
          `Paper #${row.submission_id}`
        );
      },
    },
    {
      header: "Start Time",
      accessor: "start_time",
      render: (row) => {
        if (!row.start_time) return "-";
        const date = new Date(row.start_time);
        return (
          <div>
            <div className="font-medium">{date.toLocaleDateString()}</div>
            <div className="text-sm text-gray-500">{date.toLocaleTimeString()}</div>
          </div>
        );
      },
    },
    {
      header: "End Time",
      accessor: "end_time",
      render: (row) => {
        if (!row.end_time) return "-";
        const date = new Date(row.end_time);
        return (
          <div>
            <div className="font-medium">{date.toLocaleDateString()}</div>
            <div className="text-sm text-gray-500">{date.toLocaleTimeString()}</div>
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
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Schedule</h1>
          <p className="mt-1 text-sm text-gray-500">
            {conference?.name || `Conference #${conferenceId}`}
          </p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus size={16} />
          Thêm Schedule Item
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="text-blue-600" size={20} />
            </div>
            <div>
              <div className="text-sm text-gray-500">Total Items</div>
              <div className="text-xl font-semibold">{scheduleItems.length}</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <FileText className="text-green-600" size={20} />
            </div>
            <div>
              <div className="text-sm text-gray-500">Scheduled Papers</div>
              <div className="text-xl font-semibold">
                {scheduleItems.filter((item) => item.submission_id).length}
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="text-purple-600" size={20} />
            </div>
            <div>
              <div className="text-sm text-gray-500">Sessions</div>
              <div className="text-xl font-semibold">{sessions.length}</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <FileText className="text-orange-600" size={20} />
            </div>
            <div>
              <div className="text-sm text-gray-500">Available Papers</div>
              <div className="text-xl font-semibold">{submissions.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Table */}
      <div className="bg-white rounded-lg border">
        <Table data={scheduleItems} columns={columns} />
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingItem ? "Chỉnh sửa Schedule Item" : "Thêm Schedule Item mới"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Session ID *
            </label>
            <Input
              type="number"
              value={formData.session_id}
              onChange={(e) => setFormData({ ...formData, session_id: e.target.value })}
              required
              placeholder="Session ID"
            />
            {sessions.length > 0 && (
              <select
                value={formData.session_id}
                onChange={(e) => setFormData({ ...formData, session_id: e.target.value })}
                className="mt-2 w-full px-4 py-2 border rounded-lg"
              >
                <option value="">Chọn Session</option>
                {sessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title || `Session #${s.id}`} {s.room && `- ${s.room}`}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Submission (Optional)
            </label>
            <select
              value={formData.submission_id}
              onChange={(e) => setFormData({ ...formData, submission_id: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="">Không có submission</option>
              {submissions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title || `Paper #${s.id}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Time *
            </label>
            <Input
              type="datetime-local"
              value={formData.start_time}
              onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Time *
            </label>
            <Input
              type="datetime-local"
              value={formData.end_time}
              onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Order Index *
            </label>
            <Input
              type="number"
              value={formData.order_index}
              onChange={(e) => setFormData({ ...formData, order_index: e.target.value })}
              required
              min="0"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              {editingItem ? "Cập nhật" : "Tạo mới"}
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
    </div>
  );
}
