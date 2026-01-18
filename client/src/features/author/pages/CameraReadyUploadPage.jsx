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

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-3 bg-white border rounded-2xl">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-black uppercase italic">Camera-Ready Upload</h1>
          <p className="text-[10px] text-gray-400 font-black uppercase">
            Submission #{currentSubmission?.id}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8">
        <h2 className="text-xl font-black text-gray-900 mb-2">{currentSubmission?.title}</h2>
        <p className="text-sm text-gray-500 mb-6">
          Vui lòng nộp bản hoàn thiện (PDF) theo đúng template của hội nghị.
        </p>

        {!isAccepted && (
          <div className="p-4 rounded-xl bg-amber-50 text-amber-700 text-sm font-bold">
            Bài nộp chưa được chấp nhận, hiện chưa thể nộp bản camera-ready.
          </div>
        )}

        {isAccepted && isFinished && (
          <div className="p-4 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-bold flex items-center gap-2">
            <CheckCircle size={18} /> Bạn đã nộp bản camera-ready.
          </div>
        )}

        {isAccepted && !isFinished && (
          <div className="mt-6 space-y-4">
            <label className="flex items-center justify-between gap-4 border-2 border-dashed border-indigo-200 rounded-2xl p-5 cursor-pointer hover:bg-indigo-50/40 transition-all">
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <div className="flex items-center gap-3">
                <FileText className="text-indigo-500" />
                <span className="text-xs font-black uppercase text-indigo-700">
                  {file ? file.name : "Chọn file PDF bản cuối"}
                </span>
              </div>
              <UploadCloud className="text-indigo-500" />
            </label>

            <button
              onClick={handleUpload}
              disabled={!file || isLoading}
              className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-black text-xs uppercase flex items-center justify-center gap-2 disabled:opacity-50"
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
