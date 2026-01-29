import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { UploadCloud, ArrowLeft, CheckCircle, FileText, Loader2 } from "lucide-react";
import { useSubmissionStore } from "../../../app/store/useSubmissionStore";

export default function CameraReadyUploadPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const submissionId = Number(id);
  const [file, setFile] = useState(null);

  const { currentSubmission, fetchSubmissionById, uploadCameraReady, isLoading } = useSubmissionStore();

  useEffect(() => {
    if (id) fetchSubmissionById(id);
  }, [id, fetchSubmissionById]);

  const isAccepted = useMemo(
    () => currentSubmission?.decision?.toLowerCase() === "accepted",
    [currentSubmission]
  );
  const isFinished = useMemo(
    () => Number(currentSubmission?.camera_ready_submission) > 0,
    [currentSubmission]
  );

  const handleUpload = async () => {
    if (!file) {
      toast.error("Vui lòng chọn file PDF trước khi tải lên.");
      return;
    }
    const res = await uploadCameraReady(submissionId, file);
    if (res?.success) {
      toast.success("Đã nộp bản camera-ready thành công.");
      setFile(null);
    } else {
      toast.error(res?.error || "Không thể tải lên bản camera-ready.");
    }
  };

  if (isLoading && !currentSubmission) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        <Loader2 className="animate-spin w-6 h-6 mr-2" /> Đang tải...
      </div>
    );
  }

  if (!currentSubmission) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Không tìm thấy bài nộp.
      </div>
    );
  }

  const primaryColor = "rgb(0, 134, 137)";
  const primaryLight = "rgba(0, 134, 137, 0.1)";
  const primaryLighter = "rgba(0, 134, 137, 0.05)";
  const primaryDark = "rgb(0, 100, 102)";

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate(-1)} 
          className="p-3 bg-white border rounded-2xl hover:bg-gray-50 transition-colors"
          style={{ borderColor: primaryLight }}
        >
          <ArrowLeft size={20} style={{ color: primaryColor }} />
        </button>
        <div>
          <h1 className="text-2xl font-black uppercase italic" style={{ color: primaryColor }}>
            Camera-Ready Upload
          </h1>
          <p className="text-[10px] text-gray-400 font-black uppercase">
            Submission #{currentSubmission?.id}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-4xl border border-gray-100 shadow-sm p-8">
        <h2 className="text-xl font-black text-gray-900 mb-2">{currentSubmission?.title}</h2>
        <p className="text-sm text-gray-500 mb-6">
          Vui lòng nộp bản hoàn thiện (PDF) theo đúng template của hội nghị.
        </p>

        {!isAccepted && (
          <div 
            className="p-4 rounded-xl text-sm font-bold"
            style={{ 
              backgroundColor: "rgba(245, 158, 11, 0.1)", 
              color: "rgb(180, 83, 9)" 
            }}
          >
            Bài nộp chưa được chấp nhận, hiện chưa thể nộp bản camera-ready.
          </div>
        )}

        {isAccepted && isFinished && (
          <div 
            className="p-4 rounded-xl text-sm font-bold flex items-center gap-2"
            style={{ 
              backgroundColor: "rgba(16, 185, 129, 0.1)", 
              color: "rgb(6, 95, 70)" 
            }}
          >
            <CheckCircle size={18} /> Bạn đã nộp bản camera-ready.
          </div>
        )}

        {isAccepted && !isFinished && (
          <div className="mt-6 space-y-4">
            <label 
              className="flex items-center justify-between gap-4 border-2 border-dashed rounded-2xl p-5 cursor-pointer transition-all hover:scale-[1.01]"
              style={{ 
                borderColor: primaryLight,
                backgroundColor: file ? primaryLighter : "transparent"
              }}
            >
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <div className="flex items-center gap-3">
                <FileText style={{ color: primaryColor }} />
                <span className="text-xs font-black uppercase" style={{ color: primaryColor }}>
                  {file ? file.name : "Chọn file PDF bản cuối"}
                </span>
              </div>
              <UploadCloud style={{ color: primaryColor }} />
            </label>

            <button
              onClick={handleUpload}
              disabled={!file || isLoading}
              className="w-full py-4 rounded-2xl text-white font-black text-xs uppercase flex items-center justify-center gap-2 disabled:opacity-50 hover:shadow-lg transition-all duration-200"
              style={{ 
                backgroundColor: primaryColor,
                opacity: !file || isLoading ? 0.5 : 1
              }}
              onMouseOver={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.backgroundColor = primaryDark;
                }
              }}
              onMouseOut={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.backgroundColor = primaryColor;
                }
              }}
            >
              {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : <UploadCloud size={16} />}
              Xác nhận nộp bản cuối
            </button>
          </div>
        )}
      </div>
    </div>
  );
}