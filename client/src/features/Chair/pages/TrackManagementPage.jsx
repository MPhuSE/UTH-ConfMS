import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { trackService, conferenceService } from "../../../services";
import { toast } from "react-hot-toast";
import Table from "../../../components/Table";
import Button from "../../../components/Button";
import Input from "../../../components/Input";
import Modal from "../../../components/Modal";
import { Plus, Edit, Trash2, Layers } from "lucide-react";

export default function TrackManagementPage() {
    const { conferenceId } = useParams();
    const [tracks, setTracks] = useState([]);
    const [conference, setConference] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingTrack, setEditingTrack] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        max_reviewers: 3,
    });

    useEffect(() => {
        if (conferenceId) {
            loadData();
        }
    }, [conferenceId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const confData = await conferenceService.getById(conferenceId);
            setConference(confData);
            const data = await trackService.getByConference(conferenceId);
            setTracks(data || []);
        } catch (error) {
            toast.error("Lỗi khi tải danh sách tracks");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreate = () => {
        setEditingTrack(null);
        setFormData({ name: "", description: "", max_reviewers: 3 });
        setShowModal(true);
    };

    const handleOpenEdit = (track) => {
        setEditingTrack(track);
        setFormData({
            name: track.name,
            description: track.description || "",
            max_reviewers: track.max_reviewers
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingTrack) {
                await trackService.update(editingTrack.id, { ...formData, conference_id: parseInt(conferenceId) });
                toast.success("Đã cập nhật track");
            } else {
                await trackService.create({ ...formData, conference_id: parseInt(conferenceId) });
                toast.success("Đã tạo track mới");
            }
            setShowModal(false);
            loadData();
        } catch (error) {
            toast.error("Có lỗi xảy ra");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Thực sự muốn xóa track này?")) return;
        try {
            await trackService.delete(id);
            toast.success("Đã xóa");
            loadData();
        } catch (error) {
            toast.error("Lỗi khi xóa");
        }
    };

    const columns = [
        { header: "Tên Track", accessor: "name" },
        { header: "Reviewers tối đa / bài", accessor: "max_reviewers" },
        {
            header: "Thao tác",
            accessor: "id",
            render: (row) => (
                <div className="flex gap-2">
                    <button onClick={() => handleOpenEdit(row)} className="text-blue-500 hover:bg-blue-50 p-2 rounded">
                        <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(row.id)} className="text-red-500 hover:bg-red-50 p-2 rounded">
                        <Trash2 size={16} />
                    </button>
                </div>
            )
        }
    ];

    if (loading) return <div className="p-8 text-center text-gray-500">Đang tải...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-teal-100 text-teal-700 rounded-xl">
                        <Layers size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Quản lý Tracks/Chủ đề</h1>
                        <p className="text-sm text-gray-500">{conference?.name}</p>
                    </div>
                </div>
                <Button onClick={handleOpenCreate} className="flex items-center gap-2">
                    <Plus size={18} /> Thêm Track
                </Button>
            </div>

            <div className="bg-white rounded-xl border shadow-sm">
                <Table data={tracks} columns={columns} />
                {tracks.length === 0 && <div className="p-12 text-center text-gray-500">Chưa có track nào.</div>}
            </div>

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingTrack ? "Sửa Track" : "Thêm Track mới"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Tên Track/Chủ đề"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="VD: Machine Learning"
                        required
                    />
                    <Input
                        label="Mô tả"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Mô tả ngắn về track này..."
                    />
                    <Input
                        label="Số reviewers tối đa cho mỗi bài nộp"
                        type="number"
                        value={formData.max_reviewers}
                        onChange={(e) => setFormData({ ...formData, max_reviewers: e.target.value })}
                        min="1"
                        required
                    />
                    <div className="flex gap-2 pt-4">
                        <Button type="submit" className="flex-1">Lưu</Button>
                        <Button variant="secondary" onClick={() => setShowModal(false)} className="flex-1">Hủy</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
