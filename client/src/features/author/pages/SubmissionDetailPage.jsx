import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Download, FileText, Clock, Award, CheckCircle, XCircle, Calendar, Shield, Edit, Eye, User, UploadCloud, Loader2, Trash2, MessageSquare, RefreshCw
} from "lucide-react";
import { useSubmissionStore } from "../../../app/store/useSubmissionStore";
import { submissionService } from "../../../services/submissionService";

const isCameraReadyDone = (submission) => {
  // Theo SUBMISSION_WORKFLOW.md: Sau khi upload camera-ready, status = "published"
  // Kiểm tra cả camera_ready_submission ID và status để biết đã upload chưa
  const hasCameraReady = Number(submission?.camera_ready_submission) > 0;
  const isPublished = submission?.status?.toLowerCase() === 'published';
  return hasCameraReady || isPublished;
};

const getFileUrl = (submission) => submission?.file_url || submission?.file_path || "";

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

const CameraReadyBox = ({ submission, onUpload, isLoading }) => {
  const [file, setFile] = useState(null);
  const isFinished = isCameraReadyDone(submission);

  if (isFinished) {
    return (
      <div className="mt-8 bg-emerald-50 border-2 border-emerald-100 rounded-4xl p-8 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-500 p-3 rounded-2xl text-white"><CheckCircle size={24} /></div>
          <div>
            <h4 className="font-black text-emerald-900 text-xs uppercase">Bản hoàn thiện (Camera-Ready)</h4>
            <p className="text-[10px] text-emerald-600 font-bold italic">ID: #{submission.camera_ready_submission}</p>
          </div>
        </div>
        <button onClick={() => window.open(getDownloadUrl(submission.file_path), '_blank')} className="px-6 py-3 bg-white border border-emerald-200 text-emerald-700 rounded-xl font-black text-[10px] uppercase hover:bg-emerald-500 hover:text-white transition-all">Mở file bản cuối</button>
      </div>
    );
  }

  // Chỉ hiển thị form upload khi:
  // 1. decision = "accepted" 
  // 2. VÀ chưa upload camera-ready (status != "published" và camera_ready_submission = null)
  const isAccepted = submission?.decision?.toLowerCase() === 'accepted';
  const isPublished = submission?.status?.toLowerCase() === 'published';
  const hasCameraReady = Number(submission?.camera_ready_submission) > 0;
  
  if (isAccepted && !isPublished && !hasCameraReady) {
    return (
      <div className="mt-8 bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-lg font-black uppercase italic mb-2 flex items-center gap-2"><UploadCloud /> Camera-Ready Submission</h3>
          <div className="flex flex-col md:flex-row gap-4 mt-6">
            <label className="flex-1 bg-white/10 border-2 border-dashed border-white/30 rounded-2xl p-4 flex items-center justify-center cursor-pointer">
              <input type="file" accept=".pdf" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
              <span className="text-[10px] font-black uppercase tracking-widest truncate max-w-[250px]">{file ? file.name : 'CHỌN FILE PDF BẢN CUỐI'}</span>
            </label>
            <button onClick={() => onUpload(submission.id, file)} disabled={!file || isLoading} className="px-8 py-4 bg-white text-indigo-600 rounded-2xl font-black text-[10px] uppercase flex items-center gap-2">
              {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : 'XÁC NHẬN NỘP BẢN CUỐI'}
            </button>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function SubmissionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    submissions, 
    currentSubmission, 
    fetchSubmissionById, 
    uploadCameraReady, 
    deleteSubmission,
    isLoading,
    reviewsBySubmission,
    reviewsLoading,
    fetchReviewsBySubmission
  } = useSubmissionStore();
  const submissionId = Number(id);
  const [reviewsOpen, setReviewsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const subData = useMemo(() => {
    const fromList = submissions.find(s => s.id === Number(id));
    return currentSubmission?.id === Number(id) ? currentSubmission : fromList;
  }, [currentSubmission, submissions, id]);

  // Fetch submission khi component mount hoặc id thay đổi
  useEffect(() => { 
    if (id) fetchSubmissionById(id); 
  }, [id, fetchSubmissionById]);

  // Auto-refresh status mỗi 30 giây để theo dõi trạng thái
  useEffect(() => {
    if (!id) return;
    
    const intervalId = setInterval(() => {
      fetchSubmissionById(id).then(() => {
        setLastRefresh(new Date());
      });
    }, 30000); // Refresh mỗi 30 giây

    return () => clearInterval(intervalId); // Cleanup khi unmount
  }, [id, fetchSubmissionById]);

  // Hàm refresh thủ công
  const handleRefresh = async () => {
    if (!id || isRefreshing) return;
    setIsRefreshing(true);
    try {
      await fetchSubmissionById(id);
      setLastRefresh(new Date());
    } catch (error) {
      console.error("Error refreshing:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // LOGIC TÁCH BIỆT DECISION
  const decisionInfo = useMemo(() => {
    const d = subData?.decision?.toLowerCase();
    if (d === 'accepted') return { label: 'ACCEPTED', color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle };
    if (d === 'rejected') return { label: 'REJECTED', color: 'text-red-600', bg: 'bg-red-50', icon: XCircle };
    return { label: 'PENDING', color: 'text-amber-600', bg: 'bg-amber-50', icon: Clock };
  }, [subData]);

  // LOGIC TÁCH BIỆT STATUS
  const statusInfo = useMemo(() => {
    const isCameraDone = isCameraReadyDone(subData);
    if (isCameraDone) return { label: 'PUBLISHED', color: 'text-purple-600', bg: 'bg-purple-50', icon: Award };
    
    const s = subData?.status?.toLowerCase();
    if (s === 'under review') return { label: 'REVIEWING', color: 'text-blue-600', bg: 'bg-blue-50', icon: Shield };
    return { label: s?.toUpperCase() || 'SUBMITTED', color: 'text-gray-500', bg: 'bg-gray-50', icon: FileText };
  }, [subData]);

  const isAccepted = subData?.decision?.toLowerCase() === 'accepted';
  const isCameraDone = isCameraReadyDone(subData);
  const submissionReviews = reviewsBySubmission[submissionId] || [];
  const fileUrl = getFileUrl(subData);

  const handleWithdraw = async () => {
    if (!subData?.id) return;
    if (!window.confirm("Bạn có chắc chắn muốn rút bài này?")) return;
    setIsDeleting(true);
    const ok = await deleteSubmission(subData.id);
    setIsDeleting(false);
    if (ok) navigate("/dashboard/my-submissions");
  };

  const handleToggleReviews = async () => {
    const nextOpen = !reviewsOpen;
    setReviewsOpen(nextOpen);
    if (nextOpen && !reviewsBySubmission[submissionId]) {
      await fetchReviewsBySubmission(submissionId);
    }
  };

  if (isLoading && !subData) return <div className="min-h-screen flex items-center justify-center font-black text-gray-400">LOADING...</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 min-h-screen bg-gray-50/20">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate(-1)} className="p-4 bg-white border rounded-3xl"><ArrowLeft size={24} /></button>
          <div>
            <h1 className="text-3xl font-black uppercase italic underline decoration-blue-500 decoration-8">SUBMISSION DETAIL</h1>
            <p className="text-[10px] text-gray-400 font-black mt-1 uppercase">ID: <span className="text-blue-600">#{subData?.id}</span></p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-xl text-[10px] font-black uppercase hover:bg-blue-200 transition-colors flex items-center gap-2 disabled:opacity-50"
            title="Làm mới trạng thái"
          >
            <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} /> 
            {isRefreshing ? "Đang tải..." : "Làm mới"}
          </button>
          <p className="text-[9px] text-gray-400 font-bold">
            Cập nhật: {lastRefresh.toLocaleTimeString('vi-VN')}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm p-10 md:p-14 relative overflow-hidden">
            <div className="h-3 bg-linear-to-r from-blue-600 to-indigo-400 absolute top-0 left-0 right-0"></div>
            
            {/* HIỂN THỊ 2 BADGE RIÊNG BIỆT */}
            <div className="flex flex-wrap gap-3 mb-8">
              <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black ${decisionInfo.bg} ${decisionInfo.color} border border-current/10`}>
                <decisionInfo.icon size={12} /> DECISION: {decisionInfo.label}
              </div>
              <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black ${statusInfo.bg} ${statusInfo.color} border border-current/10`}>
                <statusInfo.icon size={12} /> STATUS: {statusInfo.label}
              </div>
            </div>

            <h2 className="text-4xl font-black text-gray-900 leading-tight mb-8 tracking-tighter">{subData?.title}</h2>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {subData?.status?.toLowerCase() === 'submitted' && (
                <button
                  onClick={() => navigate(`/dashboard/submission/edit/${subData?.id}`)}
                  className="px-4 py-2 bg-amber-100 text-amber-700 rounded-xl text-[10px] font-black uppercase"
                >
                  Chỉnh sửa
                </button>
              )}
              {(subData?.status?.toLowerCase() === 'submitted' || subData?.status?.toLowerCase() === 'under review') && (
                <button
                  onClick={handleWithdraw}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase"
                >
                  {isDeleting ? "Đang rút..." : "Rút bài"}
                </button>
              )}
              {fileUrl && (
                <button
                  onClick={() => submissionService.downloadPdf(subData.id)}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-xl text-[10px] font-black uppercase hover:bg-blue-200 transition-colors flex items-center gap-2"
                >
                  <Download size={14} /> Tải PDF
                </button>
              )}
              {isAccepted && !isCameraDone && (
                <button
                  onClick={() => navigate(`/dashboard/submission/${subData?.id}/camera-ready`)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase"
                >
                  Nộp bản camera-ready
                </button>
              )}
            </div>

            <CameraReadyBox submission={subData} onUpload={uploadCameraReady} isLoading={isLoading} />

            <div className="mt-12 grid md:grid-cols-2 gap-8 pt-8 border-t">
              <div className="flex flex-col gap-1">
                <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Scientific Track</span>
                <span className="text-sm font-bold text-gray-800">{subData?.track?.name || '---'}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Submission Date</span>
                <span className="text-sm font-bold text-gray-800">{subData?.created_at ? new Date(subData.created_at).toLocaleDateString() : '---'}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Conference</span>
                <span className="text-sm font-bold text-gray-800">{subData?.track?.conference?.name || '---'}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Status</span>
                <span className="text-sm font-bold text-gray-800">{statusInfo.label}</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t">
              <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Abstract</span>
              <p className="mt-3 text-sm text-gray-700 whitespace-pre-line">{subData?.abstract || "---"}</p>
            </div>

            <div className="mt-6 pt-6 border-t">
              <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Authors</span>
              <div className="mt-3 flex flex-wrap gap-2">
                {(subData?.authors || []).length > 0 ? (
                  subData.authors.map((author, idx) => (
                    <span key={idx} className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-black text-gray-700">
                      {author.name || author.full_name || "N/A"}{author.email ? ` • ${author.email}` : ""}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-gray-400 font-bold">---</span>
                )}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="mt-12 pt-8 border-t">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black uppercase text-gray-400 flex items-center gap-2">
                  <MessageSquare size={14} /> Reviews (ẩn danh)
                </h3>
                <button
                  onClick={handleToggleReviews}
                  className="px-3 py-1.5 bg-gray-100 rounded-lg text-[10px] font-black uppercase"
                >
                  {reviewsOpen ? 'Ẩn reviews' : 'Xem reviews'}
                </button>
              </div>

              {reviewsOpen && (
                <div className="space-y-3">
                  {reviewsLoading[submissionId] ? (
                    <div className="text-xs text-gray-400 font-bold flex items-center gap-2">
                      <Loader2 className="animate-spin w-3 h-3" /> Đang tải reviews...
                    </div>
                  ) : submissionReviews.length === 0 ? (
                    <div className="text-xs text-gray-400 font-bold">Chưa có reviews được công bố.</div>
                  ) : (
                    submissionReviews.map((rev, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[9px] font-black uppercase text-gray-400">
                            Reviewer #{idx + 1}
                          </span>
                          {rev.score !== undefined && (
                            <span className="text-[9px] font-black text-indigo-600">
                              Score: {rev.score}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-700 whitespace-pre-line">
                          {rev.comment || rev.summary || 'Không có nhận xét.'}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* SIDEBAR */}
        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm h-fit">
          <h3 className="font-black text-gray-400 text-[10px] uppercase mb-8 flex items-center gap-2"><Clock size={16} /> Lifecycle</h3>
          <div className="space-y-10 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-1 before:bg-gray-50">
            <TimelineStep active={true} icon={CheckCircle} label="Submitted" date="Success" color="bg-green-500" />
            <TimelineStep active={decisionInfo.label !== 'PENDING'} icon={Shield} label="Review" date={decisionInfo.label} color="bg-blue-500" />
            {/* Final stage sáng khi đã có camera_ready_submission HOẶC status = "published" */}
            <TimelineStep 
              active={Number(subData?.camera_ready_submission) > 0 || subData?.status?.toLowerCase() === 'published'} 
              icon={Award} 
              label="Final" 
              date={statusInfo.label} 
              color="bg-purple-600" 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const TimelineStep = ({ active, icon: Icon, label, date, color }) => (
  <div className="relative pl-10">
    <div className={`absolute left-0 w-8 h-8 rounded-xl flex items-center justify-center ring-4 ring-white z-10 ${active ? color + ' text-white shadow-lg' : 'bg-gray-100 text-gray-300'}`}><Icon size={14} /></div>
    <p className={`font-black text-[10px] uppercase ${active ? 'text-gray-900' : 'text-gray-300'}`}>{label}</p>
    <p className="text-[9px] text-gray-400 font-bold uppercase mt-1">{date}</p>
  </div>
);