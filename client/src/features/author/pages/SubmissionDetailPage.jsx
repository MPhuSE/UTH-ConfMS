import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Download, FileText, Globe, Clock, AlertCircle,
  Award, CheckCircle, XCircle, BarChart3, Calendar,
  Shield, Edit, FileSearch, Star, Eye, User, UploadCloud
} from "lucide-react";
import { useSubmissionStore } from "../../../app/store/useSubmissionStore";

// --- Sub-component: Nộp bản Camera-Ready ---
const CameraReadySection = ({ submission, language, onUpload }) => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Nếu đã nộp rồi
  if (submission?.is_camera_ready || submission?.camera_ready_submission) {
    return (
      <div className="mt-8 bg-emerald-50 border-2 border-emerald-100 rounded-[2rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6 animate-in fade-in slide-in-from-bottom-4">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
            <CheckCircle size={28} />
          </div>
          <div>
            <h4 className="font-black text-emerald-900 uppercase text-xs tracking-wider">
              {language === 'VI' ? 'Hoàn tất bản hoàn thiện' : 'Camera-Ready Completed'}
            </h4>
            <p className="text-[10px] text-emerald-600 font-bold mt-1 uppercase">
              {language === 'VI' ? 'Hệ thống đã ghi nhận' : 'System has recorded your file'}
            </p>
          </div>
        </div>
        <button 
          onClick={() => window.open(submission.camera_ready_url, '_blank')}
          className="px-6 py-3 bg-white text-emerald-700 rounded-xl text-[10px] font-black border border-emerald-200 hover:bg-emerald-100 transition-all shadow-sm whitespace-nowrap"
        >
          {language === 'VI' ? 'XEM BẢN CUỐI' : 'VIEW FINAL PDF'}
        </button>
      </div>
    );
  }

  // Nếu bài đã Accepted nhưng chưa nộp bản cuối
  if (submission?.decision?.toLowerCase() === 'accepted') {
    return (
      <div className="mt-8 bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <UploadCloud className="text-indigo-200" size={24} />
            <h3 className="text-lg font-black uppercase italic tracking-tight">Camera-Ready Submission</h3>
          </div>
          <p className="text-xs font-bold text-indigo-100 mb-8 max-w-md leading-relaxed">
            {language === 'VI' 
              ? 'Chúc mừng! Bài báo đã được chấp nhận. Vui lòng tải lên bản PDF hoàn thiện cuối cùng để phục vụ xuất bản.' 
              : 'Congratulations! Your paper is accepted. Please upload the final camera-ready PDF for the proceedings.'}
          </p>
          <div className="flex flex-col md:flex-row gap-4">
            <label className="flex-1 bg-white/10 border-2 border-dashed border-white/30 rounded-2xl p-4 flex items-center justify-center cursor-pointer hover:bg-white/20 transition-all group">
              <input type="file" accept=".pdf" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
              <span className="text-[10px] font-black uppercase tracking-widest text-center">
                {file ? file.name : (language === 'VI' ? 'CHỌN FILE PDF HOÀN THIỆN' : 'SELECT FINAL PDF')}
              </span>
            </label>
            <button 
              onClick={async () => {
                setIsUploading(true);
                await onUpload(submission.id, file);
                setIsUploading(false);
              }}
              disabled={!file || isUploading}
              className="px-10 py-4 bg-white text-indigo-600 rounded-2xl font-black text-[10px] uppercase hover:shadow-xl transition-all disabled:opacity-50 active:scale-95"
            >
              {isUploading ? 'UPLOADING...' : (language === 'VI' ? 'NỘP BẢN CUỐI' : 'SUBMIT FINAL')}
            </button>
          </div>
        </div>
        <div className="absolute -bottom-10 -right-10 text-white/5 rotate-12"><Shield size={200} /></div>
      </div>
    );
  }

  return null;
};

// --- Component Chính ---
export default function SubmissionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentSubmission, fetchSubmissionById, submitCameraReady, isLoading, error } = useSubmissionStore();
  
  const [language, setLanguage] = useState('VI');
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    if (id) fetchSubmissionById(id);
  }, [id, fetchSubmissionById]);

  // Logic trạng thái
  const getStatusInfo = (paper) => {
    if (paper?.withdrawn) return { label: 'WITHDRAWN', color: 'text-gray-500', bg: 'bg-gray-100', icon: XCircle };
    const decision = paper?.decision?.toLowerCase();
    if (paper?.is_camera_ready || paper?.camera_ready_submission) return { label: 'PUBLISHED', color: 'text-purple-600', bg: 'bg-purple-50', icon: Award };
    if (decision === 'accepted') return { label: 'ACCEPTED', color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle };
    if (decision === 'rejected') return { label: 'REJECTED', color: 'text-red-600', bg: 'bg-red-50', icon: XCircle };
    return { label: 'UNDER REVIEW', color: 'text-blue-600', bg: 'bg-blue-50', icon: Clock };
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <p className="font-black text-gray-400 uppercase tracking-widest text-xs">Loading Submission...</p>
    </div>
  );

  if (error) return (
    <div className="p-10 text-center bg-red-50 rounded-[2.5rem] m-10 border border-red-100 max-w-2xl mx-auto shadow-xl shadow-red-50">
      <AlertCircle className="mx-auto text-red-500 mb-4 w-12 h-12" />
      <h3 className="text-lg font-black text-red-900 mb-2 uppercase italic">{language === 'VI' ? 'Lỗi Hệ Thống' : 'System Error'}</h3>
      <p className="text-red-600 text-sm font-medium">{error}</p>
      <button onClick={() => navigate(-1)} className="mt-8 px-8 py-3 bg-red-600 text-white rounded-xl font-black text-xs uppercase tracking-widest">Back to List</button>
    </div>
  );

  if (!currentSubmission) return null;

  const statusInfo = getStatusInfo(currentSubmission);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 bg-gray-50/30 min-h-screen">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-5">
          <button onClick={() => navigate(-1)} className="p-3 bg-white border rounded-2xl hover:bg-gray-50 transition-all shadow-sm group">
            <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase italic italic">
              {language === 'VI' ? 'Chi tiết bài báo' : 'Submission Dossier'}
            </h1>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">
              DOI Reference: <span className="text-blue-600">#CONF-{currentSubmission.id}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setLanguage(l => l === 'VI' ? 'EN' : 'VI')} className="px-4 py-3 bg-white border rounded-2xl font-black text-[10px] flex items-center gap-2 hover:border-blue-500 transition-all shadow-sm">
            <Globe className="w-3.5 h-3.5 text-blue-500" /> {language}
          </button>
          <button 
            onClick={() => window.open(currentSubmission.file_url, '_blank')}
            className="px-6 py-3 bg-gray-900 text-white rounded-2xl font-black text-[10px] flex items-center gap-2 hover:bg-black shadow-xl shadow-gray-200 transition-all active:scale-95"
          >
            <Download className="w-3.5 h-3.5" /> PDF MANUSCRIPT
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* LEFT COLUMN: CONTENT */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden relative">
            <div className="h-2 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-400"></div>
            <div className="p-8 md:p-12">
              <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                <div className="flex-1 space-y-6">
                  <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${statusInfo.bg} ${statusInfo.color} border border-current/10`}>
                    <StatusIcon size={14} /> {statusInfo.label}
                  </div>
                  <h2 className="text-3xl font-black text-gray-900 leading-[1.1] tracking-tight">{currentSubmission.title}</h2>
                  <div className="flex flex-wrap gap-x-8 gap-y-4 text-[10px] text-gray-400 font-black uppercase tracking-widest">
                    <span className="flex items-center gap-2 text-blue-600/80"><Award size={14} /> {currentSubmission.conference?.name}</span>
                    <span className="flex items-center gap-2 text-indigo-600/80"><BarChart3 size={14} /> Track: {currentSubmission.track?.name}</span>
                    <span className="flex items-center gap-2"><Calendar size={14} /> {new Date(currentSubmission.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                
                {currentSubmission.avg_score > 0 && (
                  <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 text-center min-w-[150px] shadow-inner">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Review Score</p>
                    <div className="flex items-center justify-center gap-1 text-3xl font-black text-blue-900">
                      <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
                      {currentSubmission.avg_score}
                    </div>
                  </div>
                )}
              </div>

              {/* TABS */}
              <div className="flex gap-10 border-b border-gray-50 mt-12">
                {['details', 'abstract', 'authors'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-5 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${
                      activeTab === tab ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {language === 'VI' ? (tab === 'details' ? 'Thông tin' : tab === 'abstract' ? 'Tóm tắt' : 'Tác giả') : tab}
                    {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-full"></div>}
                  </button>
                ))}
              </div>

              {/* TAB CONTENT */}
              <div className="mt-10 min-h-[300px]">
                {activeTab === 'details' && (
                  <div className="animate-in fade-in duration-500">
                    <div className="grid md:grid-cols-2 gap-16">
                      <div className="space-y-8">
                        <div className="flex flex-col gap-1 border-b border-gray-50 pb-4">
                          <span className="text-[10px] text-gray-400 font-black uppercase">Submission ID</span>
                          <span className="text-sm font-bold text-gray-800">#{currentSubmission.id}</span>
                        </div>
                        <div className="flex flex-col gap-1 border-b border-gray-50 pb-4">
                          <span className="text-[10px] text-gray-400 font-black uppercase">Scientific Track</span>
                          <span className="text-sm font-bold text-gray-800">{currentSubmission.track?.name}</span>
                        </div>
                        <div className="flex flex-col gap-1 border-b border-gray-50 pb-4">
                          <span className="text-[10px] text-gray-400 font-black uppercase">Decision Status</span>
                          <span className="text-sm font-bold text-gray-800 italic uppercase">{currentSubmission.decision || 'Pending Decision'}</span>
                        </div>
                      </div>
                      <div className="bg-blue-50/50 p-8 rounded-[2rem] border border-blue-100 flex flex-col items-center justify-center text-center">
                        <FileText className="w-12 h-12 text-blue-200 mb-4" />
                        <h4 className="text-[10px] font-black text-blue-900 uppercase tracking-widest mb-6">Submitted Manuscript</h4>
                        <div className="flex gap-2 w-full">
                          <button onClick={() => window.open(currentSubmission.file_url)} className="flex-1 py-3 bg-white border border-blue-200 rounded-xl text-blue-600 font-black text-[10px] uppercase hover:bg-blue-50 transition-all flex items-center justify-center gap-2">
                            <Eye size={14} /> Preview
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Tích hợp Camera Ready Section */}
                    <CameraReadySection 
                      submission={currentSubmission} 
                      language={language} 
                      onUpload={async (subId, file) => {
                        const success = await submitCameraReady(subId, file);
                        if (success) fetchSubmissionById(subId); // Refresh data
                      }}
                    />
                  </div>
                )}

                {activeTab === 'abstract' && (
                  <div className="max-w-4xl animate-in fade-in duration-500">
                    <p className="text-gray-600 leading-[1.8] text-lg font-medium italic">"{currentSubmission.abstract}"</p>
                  </div>
                )}

                {activeTab === 'authors' && (
                  <div className="grid md:grid-cols-2 gap-4 animate-in fade-in duration-500">
                    {currentSubmission.authors?.map((a, i) => (
                      <div key={i} className="flex items-center gap-4 p-5 bg-gray-50/50 border border-gray-100 rounded-2xl">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-black ${a.is_main ? 'bg-blue-600' : 'bg-slate-400'}`}>
                          <User size={20} />
                        </div>
                        <div>
                          <h4 className="font-black text-gray-900 text-sm">
                            {a.name} {a.is_main && <span className="ml-2 text-[8px] bg-blue-100 text-blue-600 px-2 py-1 rounded-md uppercase">Primary</span>}
                          </h4>
                          <p className="text-[10px] text-blue-500 font-bold tracking-tight uppercase">{a.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SIDEBAR TIMELINE */}
        <div className="space-y-6">
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
            <h3 className="font-black text-gray-400 mb-10 flex items-center gap-2 uppercase text-[10px] tracking-[0.2em]"><Clock size={14} /> workflow timeline</h3>
            <div className="space-y-12 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-50">
              
              <TimelineItem 
                active={true} 
                icon={CheckCircle} 
                label={language === 'VI' ? 'Nộp bài' : 'Submission'} 
                date={new Date(currentSubmission.created_at).toLocaleDateString()} 
                color="bg-green-500" 
              />
              
              <TimelineItem 
                active={statusInfo.label !== 'UNDER REVIEW'} 
                icon={FileSearch} 
                label={language === 'VI' ? 'Đang phản biện' : 'Peer Review'} 
                date={statusInfo.label === 'UNDER REVIEW' ? 'In Progress...' : 'Completed'} 
                color="bg-blue-500" 
              />

              <TimelineItem 
                active={!!currentSubmission.decision} 
                icon={Shield} 
                label={language === 'VI' ? 'Kết luận' : 'Decision'} 
                date={currentSubmission.decision || 'Pending'} 
                color="bg-gray-900" 
              />

              <TimelineItem 
                active={currentSubmission.is_camera_ready || currentSubmission.camera_ready_submission} 
                icon={Award} 
                label={language === 'VI' ? 'Xuất bản' : 'Publication'} 
                date={currentSubmission.is_camera_ready ? 'Finished' : 'Waiting'} 
                color="bg-purple-600" 
              />
            </div>
          </div>
          
          {!currentSubmission.withdrawn && currentSubmission.decision?.toLowerCase() !== 'rejected' && (
             <button 
              onClick={() => navigate(`/dashboard/submission/edit/${currentSubmission.id}`)}
              className="w-full py-4 bg-amber-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-amber-600 transition-all shadow-lg shadow-amber-100"
             >
               <Edit size={16} /> Edit Submission
             </button>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Helper: Timeline Item Component ---
const TimelineItem = ({ active, icon: Icon, label, date, color }) => (
  <div className="relative pl-10">
    <div className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center ring-4 ring-white shadow-md z-10 ${active ? color + ' text-white' : 'bg-gray-100 text-gray-300'}`}>
      <Icon size={14} />
    </div>
    <p className={`font-black text-[10px] uppercase tracking-tight ${active ? 'text-gray-900' : 'text-gray-300'}`}>{label}</p>
    <p className="text-[10px] text-gray-400 font-bold mt-1">{date}</p>
  </div>
);