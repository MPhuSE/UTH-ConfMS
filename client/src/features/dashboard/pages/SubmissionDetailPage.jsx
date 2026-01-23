import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft, Users, Download, FileText, Calendar,
    CheckCircle, XCircle, MessageSquare, ShieldAlert, Send
} from "lucide-react";
import api from "../../../lib/axios";
import { toast } from "react-hot-toast";
import Role from "../../../components/Role";
import AssignReviewerModal from "../../assignment/AssignReviewerModal";
import { submissionService } from "../../../services/submissionService";

const getDownloadUrl = (url) => {
  if (!url) return "#";
  try {
    const parsed = new URL(url);
    
    // Extract filename from URL path
    let filename = decodeURIComponent(parsed.pathname.split("/").pop() || "paper.pdf");
    
    // Fix: Nếu filename là "stream" hoặc không hợp lệ, dùng tên mặc định
    const invalidNames = ["stream", "blob", "file", "upload"];
    if (invalidNames.includes(filename.toLowerCase()) || !filename.toLowerCase().endsWith(".pdf")) {
      // Lấy tên từ public_id trong URL hoặc dùng tên mặc định
      const pathParts = parsed.pathname.split("/");
      const folderIndex = pathParts.findIndex(p => p === "uth_conf_papers" || p.includes("papers"));
      if (folderIndex !== -1 && folderIndex < pathParts.length - 1) {
        filename = pathParts[folderIndex + 1] || "paper.pdf";
      } else {
        filename = "paper.pdf";
      }
    }
    
    // Đảm bảo có đuôi .pdf
    if (!filename.toLowerCase().endsWith(".pdf")) {
      filename = `${filename}.pdf`;
    }
    
    // Check if it's a Cloudinary URL
    if (parsed.hostname.includes("cloudinary.com") || parsed.hostname.includes("res.cloudinary.com")) {
      // If already has fl_attachment, return as is
      if (parsed.pathname.includes("fl_attachment") || parsed.searchParams.has("fl_attachment")) {
        return url;
      }
      
      // Fix: Convert /image/upload/ to /raw/upload/ for PDF files
      if (parsed.pathname.includes("/image/upload/")) {
        parsed.pathname = parsed.pathname.replace("/image/upload/", "/raw/upload/");
      }
      
      // For raw files, Cloudinary uses /raw/upload/ path
      if (parsed.pathname.includes("/raw/upload/")) {
        // Extract the path parts
        const parts = parsed.pathname.split("/raw/upload/");
        if (parts.length === 2) {
          // Split suffix to get version and file path
          const suffixParts = parts[1].split("/");
          // Reconstruct with fl_attachment as transformation
          parsed.pathname = `${parts[0]}/raw/upload/fl_attachment:${filename}/${suffixParts.join("/")}`;
          return parsed.toString();
        }
      }
      // For regular image uploads (legacy support - but shouldn't be used for PDFs)
      if (parsed.pathname.includes("/upload/") && !parsed.pathname.includes("/raw/") && !parsed.pathname.includes("/image/")) {
        const [prefix, suffix] = parsed.pathname.split("/upload/");
        parsed.pathname = `${prefix}/upload/fl_attachment:${filename}/${suffix}`;
        return parsed.toString();
      }
    }
    
    // If not Cloudinary URL, return as is
    return url;
  } catch (err) {
    console.error("Error processing download URL:", err);
    return url;
  }
};

export default function SubmissionDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const scrollRef = useRef(null);

    const [paper, setPaper] = useState(null);
    const [loading, setLoading] = useState(true);
    const [allReviewers, setAllReviewers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");

    useEffect(() => {
        fetchPaperDetail();
        fetchAllReviewers();
        fetchComments();

        const interval = setInterval(() => {
            fetchComments(true);
        }, 5000);

        return () => clearInterval(interval);
    }, [id]);

    const fetchPaperDetail = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/submissions/${id}`);
            setPaper(res.data);
        } catch (err) {
            toast.error("Lỗi tải dữ liệu bài viết");
        } finally {
            setLoading(false);
        }
    };

    const fetchAllReviewers = async () => {
        try {
            const res = await api.get("/admin/users?role=REVIEWER");
            setAllReviewers(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchComments = async (silent = false) => {
        try {
            const res = await api.get(`/submissions/${id}/comments`);
            setComments(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSendComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        try {
            const res = await api.post(`/submissions/${id}/comments`, { content: newComment });
            setComments([...comments, res.data]);
            setNewComment("");
            scrollRef.current?.scrollIntoView({ behavior: "smooth" });
        } catch (err) {
            toast.error("Lỗi gửi bình luận");
        }
    };

    const handleSelectReviewer = async (reviewer) => {
        try {
            await api.post(`/admin/submissions/${id}/assign`, { reviewer_id: reviewer.id });
            toast.success(`Đã phân công ${reviewer.name}`);
            setIsModalOpen(false);
            fetchPaperDetail();
        } catch (err) {
            toast.error("Lỗi phân công");
        }
    };

    const handleDecision = async (status) => {
        if (!window.confirm(`Xác nhận quyết định: ${status}?`)) return;
        try {
            await api.post(`/admin/submissions/${id}/decision`, { status });
            toast.success("Đã cập nhật quyết định");
            fetchPaperDetail();
        } catch (err) {
            toast.error("Thao tác thất bại");
        }
    };

    if (loading) return <div className="p-20 text-center text-teal-600 font-bold">ĐANG TẢI...</div>;

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">
            {/* HEADER ACTION BAR */}
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-teal-600 font-medium transition">
                    <ArrowLeft size={18} /> Quay lại
                </button>

                <Role roles={["ADMIN", "CHAIR"]}>
                    {paper.status === "Pending" && (
                        <div className="flex gap-3">
                            <button onClick={() => handleDecision("Accepted")} className="flex items-center gap-2 bg-green-600 text-white px-5 py-2 rounded-xl font-bold hover:bg-green-700 transition shadow-md">
                                <CheckCircle size={18} /> Chấp nhận
                            </button>
                            <button onClick={() => handleDecision("Rejected")} className="flex items-center gap-2 bg-red-600 text-white px-5 py-2 rounded-xl font-bold hover:bg-red-700 transition shadow-md">
                                <XCircle size={18} /> Từ chối
                            </button>
                        </div>
                    )}
                </Role>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* THÔNG TIN BÀI BÁO */}
                    <section className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8">
                        <div className="flex gap-2 mb-6">
                            <span className="bg-teal-50 text-teal-700 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-teal-100">
                                {paper.track_name || "General"}
                            </span>
                            <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${paper.status === 'Accepted' ? 'bg-green-100 text-green-700' :
                                paper.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'
                                }`}>
                                {paper.status}
                            </span>
                        </div>

                        <h1 className="text-3xl font-black text-gray-900 leading-tight mb-6">{paper.title}</h1>

                        <div className="grid grid-cols-2 gap-4 pb-8 border-b border-dashed border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400"><Calendar size={20} /></div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-gray-400">Ngày nộp</p>
                                    <p className="font-semibold text-gray-700">{new Date(paper.created_at).toLocaleDateString("vi-VN")}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400"><Users size={20} /></div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-gray-400">Tác giả</p>
                                    <p className="font-semibold text-gray-700">{paper.author_names?.join(", ") || "N/A"}</p>
                                </div>
                            </div>
                        </div>

                        <div className="py-8">
                            <h3 className="flex items-center gap-2 font-black text-gray-800 uppercase text-xs tracking-widest mb-4">
                                <FileText size={16} className="text-teal-600" /> Tóm tắt
                            </h3>
                            <p className="text-gray-600 leading-relaxed text-sm bg-gray-50/50 p-6 rounded-2xl border border-gray-50">
                                {paper.abstract}
                            </p>
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={() => submissionService.downloadPdf(paper.id)}
                                className="flex items-center gap-3 bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-black transition shadow-xl"
                            >
                                <Download size={20} /> Tải PDF
                            </button>
                        </div>
                    </section>

                    {/* COMMENT REALTIME (Chặn Tác giả xem) */}
                    <Role roles={["ADMIN", "CHAIR", "REVIEWER"]}>
                        <section className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b bg-gray-50/30 flex justify-between items-center">
                                <h3 className="font-black text-gray-800 uppercase text-xs tracking-widest">Bình luận nội bộ</h3>
                                <span className="text-[10px] font-bold text-teal-600 animate-pulse uppercase">● Real-time</span>
                            </div>
                            <div className="max-h-[400px] overflow-y-auto p-8 space-y-6 bg-white">
                                {comments.map((c) => (
                                    <div key={c.id} className="flex gap-4">
                                        <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold shrink-0 border-4 border-teal-50 shadow-sm">{c.user_name?.charAt(0)}</div>
                                        <div className="flex-1 bg-gray-50 p-5 rounded-2xl rounded-tl-none border border-gray-100">
                                            <div className="flex justify-between mb-2">
                                                <span className="font-bold text-xs text-teal-700">{c.user_name}</span>
                                                <span className="text-[10px] text-gray-400">{new Date(c.created_at).toLocaleTimeString()}</span>
                                            </div>
                                            <p className="text-sm text-gray-700">{c.content}</p>
                                        </div>
                                    </div>
                                ))}
                                <div ref={scrollRef} />
                            </div>
                            <form onSubmit={handleSendComment} className="p-6 border-t flex gap-3">
                                <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Nhập bình luận nhanh..." className="flex-1 bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
                                <button type="submit" className="bg-teal-600 text-white p-4 rounded-2xl hover:bg-teal-700 transition"><Send size={24} /></button>
                            </form>
                        </section>
                    </Role>
                </div>

                {/* SIDEBAR */}
                <div className="lg:col-span-1 space-y-6">
                    <section className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-black text-gray-800 uppercase text-xs tracking-widest">Reviewers</h3>
                            <Role roles={["ADMIN", "CHAIR"]}>
                                <button onClick={() => setIsModalOpen(true)} className="w-8 h-8 flex items-center justify-center bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition">
                                    <Users size={16} />
                                </button>
                            </Role>
                        </div>

                        <div className="space-y-4">
                            {paper.assignments?.length > 0 ? (
                                paper.assignments.map((asgn) => (
                                    <div key={asgn.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-bold text-sm text-gray-900">{asgn.reviewer_name}</p>
                                                <p className="text-[10px] text-gray-400">{asgn.reviewer_email}</p>
                                            </div>
                                            <span className={`text-[9px] font-black px-2 py-1 rounded-lg uppercase ${asgn.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                                }`}>
                                                {asgn.status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-400 italic text-xs text-center py-4 underline decoration-gray-200">Chưa có người thẩm định</p>
                            )}
                        </div>
                    </section>

                    <Role roles={["ADMIN", "CHAIR", "REVIEWER"]}>
                        <button onClick={() => navigate("discussion")} className="w-full flex items-center justify-between bg-blue-600 text-white p-6 rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 transition active:scale-95">
                            <div className="flex items-center gap-3"><ShieldAlert size={20} /> Thảo luận kín</div>
                            <ArrowLeft size={18} className="rotate-180" />
                        </button>
                    </Role>
                </div>
            </div>

            {isModalOpen && (
                <AssignReviewerModal paper={paper} reviewers={allReviewers} onSelect={handleSelectReviewer} onClose={() => setIsModalOpen(false)} />
            )}
        </div>
    );
}