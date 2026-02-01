import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { reviewQuestionService, conferenceService } from "../../../services";
import { toast } from "react-hot-toast";
import Table from "../../../components/Table";
import Button from "../../../components/Button";
import Input from "../../../components/Input";
import Modal from "../../../components/Modal";
import { Plus, Trash2, ListChecks, Settings2 } from "lucide-react";

/**
 * Trang cấu hình Form đánh giá cho Chair
 */
export default function ReviewFormConfigPage() {
    const { conferenceId } = useParams();
    const [questions, setQuestions] = useState([]);
    const [conference, setConference] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        question: "",
        type: "score",
        required: true,
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

            const qs = await reviewQuestionService.getByConference(conferenceId);
            setQuestions(qs || []);
        } catch (error) {
            toast.error("Không thể tải cấu hình form đánh giá");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await reviewQuestionService.create({
                ...formData,
                conference_id: parseInt(conferenceId),
            });
            toast.success("Đã thêm câu hỏi mới");
            setShowModal(false);
            setFormData({ question: "", type: "score", required: true });
            loadData();
        } catch (error) {
            toast.error("Không thể lưu câu hỏi");
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Xóa câu hỏi này?")) return;
        try {
            await reviewQuestionService.delete(id);
            toast.success("Đã xóa câu hỏi");
            loadData();
        } catch (error) {
            toast.error("Lỗi khi xóa");
        }
    };

    const columns = [
        {
            header: "Câu hỏi",
            accessor: "question",
            render: (row) => <span className="font-medium text-gray-900">{row.question}</span>
        },
        {
            header: "Loại",
            accessor: "type",
            render: (row) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.type === 'score' ? 'bg-blue-100 text-blue-700' :
                        row.type === 'text' ? 'bg-orange-100 text-orange-700' :
                            'bg-gray-100 text-gray-700'
                    }`}>
                    {row.type === 'score' ? 'Thang điểm' : row.type === 'text' ? 'Văn bản' : 'Đúng/Sai'}
                </span>
            )
        },
        {
            header: "Bắt buộc",
            accessor: "required",
            render: (row) => row.required ? "Có" : "Không"
        },
        {
            header: "Thao tác",
            accessor: "id",
            render: (row) => (
                <button onClick={() => handleDelete(row.id)} className="text-red-500 hover:text-red-700 p-2">
                    <Trash2 size={16} />
                </button>
            )
        }
    ];

    if (loading) return <div className="p-8 text-center">Đang tải...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <ListChecks className="text-teal-600" />
                        Cấu hình Form Đánh giá
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">{conference?.name}</p>
                </div>
                <Button onClick={() => setShowModal(true)} className="flex items-center gap-2">
                    <Plus size={18} />
                    Thêm câu hỏi
                </Button>
            </div>

            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <Table data={questions} columns={columns} />
                {questions.length === 0 && (
                    <div className="p-12 text-center text-gray-500">
                        Chưa có câu hỏi tùy chỉnh nào. Reviewer sẽ sử dụng form mặc định.
                    </div>
                )}
            </div>

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Thêm câu hỏi đánh giá">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Nội dung câu hỏi</label>
                        <Input
                            value={formData.question}
                            onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                            placeholder="VD: Chất lượng học thuật của bài báo?"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Loại câu trả lời</label>
                            <select
                                className="w-full border rounded-lg p-2"
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option value="score">Thang điểm (1-10)</option>
                                <option value="text">Văn bản (Textarea)</option>
                                <option value="boolean">Đúng / Sai</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <label className="flex items-center gap-2 cursor-pointer mb-2">
                                <input
                                    type="checkbox"
                                    checked={formData.required}
                                    onChange={(e) => setFormData({ ...formData, required: e.target.checked })}
                                />
                                <span className="text-sm font-medium">Bắt buộc trả lời</span>
                            </label>
                        </div>
                    </div>
                    <div className="flex gap-2 pt-4">
                        <Button type="submit" className="flex-1">Lưu</Button>
                        <Button variant="secondary" onClick={() => setShowModal(false)} className="flex-1">Hủy</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
