import { useEffect, useMemo, useState } from "react";
import { conferenceService, trackService } from "../../../services";
import { toast } from "react-hot-toast";
import Table from "../../../components/Table";
import Button from "../../../components/Button";
import Input from "../../../components/Input";
import Modal from "../../../components/Modal";
import { Plus, Edit, Trash2, X, Settings } from "lucide-react";

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
  const [workflowModal, setWorkflowModal] = useState(null);
  const [workflowForm, setWorkflowForm] = useState({
    camera_ready_open: false,
    camera_ready_deadline: "",
    rebuttal_open: false,
    rebuttal_deadline: "",
  });
  const [form, setForm] = useState({
    name: "",
    abbreviation: "",
    description: "",
    website: "",
    location: "",
    start_date: "",
    end_date: "",
    submission_deadline: "",
    review_deadline: "",
    is_open: true,
    blind_mode: "double",
    tracks: [], // Danh sách tracks: existing (có id) và new (không có id)
  });
  const [deletedTracks, setDeletedTracks] = useState([]); // Track các tracks đã bị xóa

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
      website: "",
      location: "",
      start_date: "",
      end_date: "",
      submission_deadline: "",
      review_deadline: "",
      is_open: true,
      blind_mode: "double",
      tracks: [],
    });
    setDeletedTracks([]);
  };

  const addTrack = () => {
    setForm({
      ...form,
      tracks: [...(form.tracks || []), { name: "", max_reviewers: 3 }],
    });
  };

  const removeTrack = (index) => {
    const trackToRemove = form.tracks[index];
    const newTracks = (form.tracks || []).filter((_, i) => i !== index);
    
    // Nếu track có id (existing track), thêm vào deletedTracks để xóa sau
    if (trackToRemove && trackToRemove.id) {
      setDeletedTracks([...deletedTracks, trackToRemove.id]);
    }
    
    setForm({
      ...form,
      tracks: newTracks,
    });
  };

  const updateTrack = (index, field, value) => {
    const currentTracks = form.tracks || [];
    const newTracks = [...currentTracks];
    if (field === "max_reviewers") {
      const numValue = value === "" ? 3 : (parseInt(value) || 3);
      newTracks[index] = { ...newTracks[index], [field]: numValue };
    } else {
      newTracks[index] = { ...newTracks[index], [field]: value };
    }
    setForm({ ...form, tracks: newTracks });
  };

  const openEdit = async (conf) => {
    setEditModal(conf);
    
    // Load existing tracks
    let existingTracks = [];
    try {
      existingTracks = await trackService.getByConference(conf.id);
      console.log("[FRONTEND] Loaded existing tracks:", existingTracks);
    } catch (err) {
      console.warn("[FRONTEND] Could not load existing tracks:", err);
    }
    
    setForm({
      name: conf.name || "",
      abbreviation: conf.abbreviation || "",
      description: conf.description || "",
      website: conf.website || "",
      location: conf.location || "",
      start_date: toDateInput(conf.start_date),
      end_date: toDateInput(conf.end_date),
      submission_deadline: toDateInput(conf.submission_deadline),
      review_deadline: toDateInput(conf.review_deadline),
      is_open: !!conf.is_open,
      blind_mode: conf.blind_mode || "double",
      tracks: existingTracks.map(t => ({
        id: t.id,
        name: t.name || "",
        max_reviewers: t.max_reviewers || 3,
      })),
    });
    setDeletedTracks([]);
  };

  const buildPayload = () => {
    const payload = {
      name: form.name.trim(),
      abbreviation: form.abbreviation?.trim() || null,
      description: form.description?.trim() || null,
      website: form.website?.trim() || null,
      location: form.location?.trim() || null,
      is_open: Boolean(form.is_open),
      blind_mode: form.blind_mode || "double",
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
    
    // NOTE: Tracks sẽ được tạo riêng bằng API /tracks sau khi tạo conference
    // Không thêm tracks vào payload nữa
    console.log("[FRONTEND DEBUG] Tracks will be created separately via /tracks API");
    console.log("[FRONTEND DEBUG] Form tracks:", form.tracks);
    
    return payload;
  };

  const handleCreate = async () => {
    try {
      if (!form.name.trim()) {
        toast.error("Tên hội nghị không được để trống");
        return;
      }
      
      // Validate tracks before creating
      const tracksToCreate = form.tracks && form.tracks.length > 0 
        ? form.tracks.filter(t => t && t.name && t.name.trim())
        : [];
      
      if (form.tracks && form.tracks.length > 0 && tracksToCreate.length !== form.tracks.length) {
        toast.error("Vui lòng điền tên cho tất cả các tracks");
        return;
      }
      
      // Build payload WITHOUT tracks (tạo conference trước)
      const payload = buildPayload();
      // Remove tracks from payload - sẽ tạo bằng API riêng
      delete payload.tracks;
      
      console.log("[FRONTEND] Creating conference (without tracks):", JSON.stringify(payload, null, 2));
      console.log("[FRONTEND] Tracks to create separately:", tracksToCreate);
      
      // Step 1: Tạo conference
      const response = await conferenceService.create(payload);
      console.log("[FRONTEND] Conference created response:", response);
      
      // Get conference ID từ response
      const conferenceId = response.data?.id || response.data?.id || response.id;
      if (!conferenceId) {
        console.error("[FRONTEND] No conference ID in response:", response);
        toast.error("Tạo hội nghị thành công nhưng không lấy được ID. Vui lòng kiểm tra lại.");
        setCreateModal(false);
        resetForm();
        loadConferences();
        return;
      }
      
      console.log("[FRONTEND] Conference ID:", conferenceId);
      
      // Step 2: Tạo tracks bằng API riêng
      const createdTracks = [];
      const trackErrors = [];
      
      if (tracksToCreate.length > 0) {
        console.log(`[FRONTEND] Creating ${tracksToCreate.length} tracks via API...`);
        
        for (const track of tracksToCreate) {
          try {
            const trackPayload = {
              conference_id: conferenceId,
              name: track.name.trim(),
              max_reviewers: parseInt(track.max_reviewers) || 3,
            };
            
            console.log(`[FRONTEND] Creating track:`, trackPayload);
            const trackResponse = await trackService.create(trackPayload);
            createdTracks.push(trackResponse);
            console.log(`[FRONTEND] ✅ Track created:`, trackResponse);
          } catch (trackErr) {
            console.error(`[FRONTEND] ❌ Error creating track "${track.name}":`, trackErr);
            trackErrors.push(`Track "${track.name}": ${trackErr?.response?.data?.detail || trackErr.message}`);
          }
        }
        
        console.log(`[FRONTEND] Created ${createdTracks.length}/${tracksToCreate.length} tracks`);
      }
      
      // Show success/error messages
      if (trackErrors.length > 0) {
        toast.error(`Hội nghị đã được tạo nhưng có lỗi khi tạo ${trackErrors.length} track(s): ${trackErrors.join(", ")}`);
      } else if (createdTracks.length > 0) {
        toast.success(`Tạo hội nghị thành công với ${createdTracks.length} track(s)`);
      } else if (tracksToCreate.length > 0) {
        toast.error("Hội nghị đã được tạo nhưng không có tracks nào được tạo. Vui lòng kiểm tra lại.");
      } else {
        toast.success("Tạo hội nghị thành công");
      }
      
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
      // Step 1: Update conference
      const payload = buildPayload();
      await conferenceService.update(editModal.id, payload);
      console.log("[FRONTEND] Conference updated successfully");
      
      // Step 2: Xử lý tracks
      const existingTracks = (form.tracks || []).filter(t => t && t.id); // Tracks có id (existing)
      const newTracks = (form.tracks || []).filter(t => t && !t.id && t.name && t.name.trim()); // Tracks mới
      
      const createdTracks = [];
      const updatedTracks = [];
      const trackErrors = [];
      
      // Step 2a: Xóa tracks đã bị xóa
      if (deletedTracks.length > 0) {
        console.log(`[FRONTEND] Deleting ${deletedTracks.length} tracks...`);
        for (const trackId of deletedTracks) {
          try {
            await trackService.delete(trackId);
            console.log(`[FRONTEND] ✅ Track deleted: ${trackId}`);
          } catch (trackErr) {
            console.error(`[FRONTEND] ❌ Error deleting track ${trackId}:`, trackErr);
            trackErrors.push(`Xóa track #${trackId}: ${trackErr?.response?.data?.detail || trackErr.message}`);
          }
        }
      }
      
      // Step 2b: Cập nhật existing tracks (nếu có thay đổi)
      if (existingTracks.length > 0) {
        console.log(`[FRONTEND] Updating ${existingTracks.length} existing tracks...`);
        for (const track of existingTracks) {
          try {
            const trackPayload = {
              name: track.name.trim(),
              max_reviewers: parseInt(track.max_reviewers) || 3,
            };
            
            console.log(`[FRONTEND] Updating track ${track.id}:`, trackPayload);
            const trackResponse = await trackService.update(track.id, trackPayload);
            updatedTracks.push(trackResponse);
            console.log(`[FRONTEND] ✅ Track updated:`, trackResponse);
          } catch (trackErr) {
            console.error(`[FRONTEND] ❌ Error updating track "${track.name}":`, trackErr);
            trackErrors.push(`Cập nhật track "${track.name}": ${trackErr?.response?.data?.detail || trackErr.message}`);
          }
        }
      }
      
      // Step 2c: Tạo tracks mới
      if (newTracks.length > 0) {
        console.log(`[FRONTEND] Creating ${newTracks.length} new tracks...`);
        for (const track of newTracks) {
          try {
            const trackPayload = {
              conference_id: editModal.id,
              name: track.name.trim(),
              max_reviewers: parseInt(track.max_reviewers) || 3,
            };
            
            console.log(`[FRONTEND] Creating track:`, trackPayload);
            const trackResponse = await trackService.create(trackPayload);
            createdTracks.push(trackResponse);
            console.log(`[FRONTEND] ✅ Track created:`, trackResponse);
          } catch (trackErr) {
            console.error(`[FRONTEND] ❌ Error creating track "${track.name}":`, trackErr);
            trackErrors.push(`Tạo track "${track.name}": ${trackErr?.response?.data?.detail || trackErr.message}`);
          }
        }
      }
      
      // Show success/error messages
      const actions = [];
      if (deletedTracks.length > 0) actions.push(`xóa ${deletedTracks.length}`);
      if (updatedTracks.length > 0) actions.push(`cập nhật ${updatedTracks.length}`);
      if (createdTracks.length > 0) actions.push(`thêm ${createdTracks.length}`);
      
      if (trackErrors.length > 0) {
        toast.error(`Hội nghị đã được cập nhật nhưng có lỗi: ${trackErrors.join(", ")}`);
      } else if (actions.length > 0) {
        toast.success(`Cập nhật hội nghị thành công (${actions.join(", ")} track(s))`);
      } else {
        toast.success("Cập nhật hội nghị thành công");
      }
      
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

  const openWorkflowModal = async (conf) => {
    try {
      // Load current workflow settings
      const fullConf = await conferenceService.getById(conf.id);
      setWorkflowModal(conf);
      setWorkflowForm({
        camera_ready_open: fullConf.camera_ready_open || false,
        camera_ready_deadline: toDateInput(fullConf.camera_ready_deadline),
        rebuttal_open: fullConf.rebuttal_open || false,
        rebuttal_deadline: toDateInput(fullConf.rebuttal_deadline),
      });
    } catch (err) {
      toast.error("Không thể tải thông tin workflow");
      console.error(err);
    }
  };

  const handleUpdateWorkflow = async () => {
    if (!workflowModal) return;
    try {
      const payload = {
        camera_ready_open: workflowForm.camera_ready_open,
        rebuttal_open: workflowForm.rebuttal_open,
      };
      
      const cameraReadyDeadline = fromDateInput(workflowForm.camera_ready_deadline);
      const rebuttalDeadline = fromDateInput(workflowForm.rebuttal_deadline);
      
      if (cameraReadyDeadline) payload.camera_ready_deadline = cameraReadyDeadline;
      if (rebuttalDeadline) payload.rebuttal_deadline = rebuttalDeadline;
      
      await conferenceService.updateWorkflow(workflowModal.id, payload);
      toast.success("Cập nhật workflow thành công");
      setWorkflowModal(null);
      loadConferences();
    } catch (err) {
      const message = err?.response?.data?.detail || "Không thể cập nhật workflow";
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
        header: "Camera-Ready",
        accessor: "camera_ready",
        render: (row) => (
          <span className={`px-2 py-0.5 rounded text-xs ${row.camera_ready_open ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-600"}`}>
            {row.camera_ready_open ? "Mở" : "Đóng"}
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
              title="Chỉnh sửa"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => openWorkflowModal(row)}
              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              title="Quản lý Workflow"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDeleteModal(row)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Xóa"
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
          <Input label="Website" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
          <Input label="Địa điểm" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
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
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Chế độ ẩn danh:</label>
              <select
                value={form.blind_mode}
                onChange={(e) => setForm({ ...form, blind_mode: e.target.value })}
                className="px-3 py-1.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-300 text-sm"
              >
                <option value="single">Single Blind</option>
                <option value="double">Double Blind</option>
                <option value="open">Open</option>
              </select>
            </div>
          </div>

          {/* Tracks Section - Only show in Create Modal */}
          {!editModal && (
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700">Tracks/Chuyên đề (Tùy chọn)</label>
                <button
                  type="button"
                  onClick={addTrack}
                  className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Thêm Track
                </button>
              </div>
              {(!form.tracks || form.tracks.length === 0) ? (
                <p className="text-xs text-gray-500 mb-2">
                  Bạn có thể tạo tracks sau khi tạo hội nghị, hoặc thêm ngay bây giờ.
                </p>
              ) : (
                <div className="space-y-2">
                  {(form.tracks || []).map((track, index) => (
                    <div key={index} className="flex gap-2 items-start p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <div>
                          <Input
                            label="Tên track"
                            value={track?.name || ""}
                            onChange={(e) => updateTrack(index, "name", e.target.value)}
                            placeholder="VD: Machine Learning"
                          />
                        </div>
                        <div>
                          <Input
                            label="Số reviewers tối đa"
                            type="number"
                            value={track?.max_reviewers || 3}
                            onChange={(e) => updateTrack(index, "max_reviewers", e.target.value)}
                            min="1"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeTrack(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-6 flex-shrink-0"
                        title="Xóa track"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

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
          <Input label="Website" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
          <Input label="Địa điểm" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
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
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Chế độ ẩn danh:</label>
              <select
                value={form.blind_mode}
                onChange={(e) => setForm({ ...form, blind_mode: e.target.value })}
                className="px-3 py-1.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-300 text-sm"
              >
                <option value="single">Single Blind</option>
                <option value="double">Double Blind</option>
                <option value="open">Open</option>
              </select>
            </div>
          </div>

          {/* Tracks Section - Edit existing and add new tracks */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700">Quản lý Tracks/Chuyên đề</label>
              <button
                type="button"
                onClick={addTrack}
                className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Thêm Track
              </button>
            </div>
            {(!form.tracks || form.tracks.length === 0) ? (
              <p className="text-xs text-gray-500 mb-2">
                Chưa có tracks nào. Bạn có thể thêm tracks mới vào hội nghị này.
              </p>
            ) : (
              <div className="space-y-2">
                {(form.tracks || []).map((track, index) => {
                  const isExisting = track && track.id;
                  return (
                    <div 
                      key={isExisting ? track.id : `new-${index}`} 
                      className={`flex gap-2 items-start p-3 rounded-lg ${
                        isExisting ? "bg-blue-50 border border-blue-200" : "bg-gray-50"
                      }`}
                    >
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <div className="relative">
                          <Input
                            label="Tên track"
                            value={track?.name || ""}
                            onChange={(e) => updateTrack(index, "name", e.target.value)}
                            placeholder="VD: Machine Learning"
                          />
                          {isExisting && (
                            <span className="absolute top-0 right-0 text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded whitespace-nowrap">
                              Có sẵn
                            </span>
                          )}
                          {!isExisting && (
                            <span className="absolute top-0 right-0 text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded whitespace-nowrap">
                              Mới
                            </span>
                          )}
                        </div>
                        <div>
                          <Input
                            label="Số reviewers tối đa"
                            type="number"
                            value={track?.max_reviewers || 3}
                            onChange={(e) => updateTrack(index, "max_reviewers", e.target.value)}
                            min="1"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeTrack(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-6 flex-shrink-0"
                        title={isExisting ? "Xóa track (sẽ bị xóa khỏi database)" : "Xóa track"}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
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

      {/* Workflow Settings Modal */}
      <Modal
        isOpen={!!workflowModal}
        onClose={() => setWorkflowModal(null)}
        title={`Quản lý Workflow - ${workflowModal?.name || ""}`}
        size="lg"
      >
        <div className="space-y-6">
          {/* Camera-Ready Section */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Camera-Ready</h3>
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={workflowForm.camera_ready_open}
                  onChange={(e) => setWorkflowForm({ ...workflowForm, camera_ready_open: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="font-medium">Mở Camera-Ready</span>
              </label>
              <Input
                label="Hạn chót Camera-Ready"
                type="date"
                value={workflowForm.camera_ready_deadline}
                onChange={(e) => setWorkflowForm({ ...workflowForm, camera_ready_deadline: e.target.value })}
              />
            </div>
          </div>

          {/* Rebuttal Section */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Rebuttal</h3>
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={workflowForm.rebuttal_open}
                  onChange={(e) => setWorkflowForm({ ...workflowForm, rebuttal_open: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="font-medium">Mở Rebuttal</span>
              </label>
              <Input
                label="Hạn chót Rebuttal"
                type="date"
                value={workflowForm.rebuttal_deadline}
                onChange={(e) => setWorkflowForm({ ...workflowForm, rebuttal_deadline: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button variant="secondary" onClick={() => setWorkflowModal(null)}>
              Hủy
            </Button>
            <Button onClick={handleUpdateWorkflow}>Lưu</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

