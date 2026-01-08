import { useEffect, useState } from "react";
import useSubmission from "./useSubmission";
import { useAuthStore } from "../../app/store/useAuthStore";

import SubmissionInfo from "./SubmissionInfo";
import SubmissionForm from "./SubmissionForm";
import FileUploadArea from "./FileUploadArea";
import AuthorRebuttalForm from "../rebuttal/AuthorRebuttalForm";
import ReviewerRebuttalView from "../rebuttal/ReviewerRebuttalView";

export default function PaperSubmissionPage() {
  const { user } = useAuthStore();
  const role = user?.role; // AUTHOR | REVIEWER | ADMIN

  const {
    deadline,
    submission,
    expired,
    loading,
    submitPaper,
    updatePaper,
  } = useSubmission();

  const [form, setForm] = useState({
    title: "",
    abstract: "",
    keywords: "",
  });

  const [files, setFiles] = useState([]);

  /* ================= SYNC DATA ================= */
  useEffect(() => {
    if (submission) {
      setForm({
        title: submission.title || "",
        abstract: submission.abstract || "",
        keywords: submission.keywords || "",
      });
    }
  }, [submission]);

  /* ================= PERMISSION ================= */
  const canEditMetadata = role === "ADMIN";
  const canUpload = role === "AUTHOR" && !expired;
  const canSubmit = role === "AUTHOR" && !expired;

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    if (!canSubmit) return;

    const payload = { ...form, files };

    submission
      ? await updatePaper(payload)
      : await submitPaper(payload);
  };

  if (loading) {
    return <p className="text-center py-10">Đang tải...</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">

      {/* ===== SUBMISSION INFO ===== */}
      <SubmissionInfo
        deadline={deadline}
        submission={submission}
      />
            {/* ===== REBUTTAL ===== */}
        {submission && (
      <>
        {role === "AUTHOR" && (
          <AuthorRebuttalForm paperId={submission.id} />
        )}

        {role === "REVIEWER" && (
          <ReviewerRebuttalView paperId={submission.id} />
        )}
      </>
      )}

      {/* ===== METADATA ===== */}
      <SubmissionForm
        data={form}
        setData={setForm}
        disabled={!canEditMetadata}
        readOnly={!canEditMetadata}
      />

      {/* ===== FILE UPLOAD (AUTHOR ONLY) ===== */}
      {canUpload && (
        <FileUploadArea
          files={files}
          setFiles={setFiles}
        />
      )}

      {/* ===== SUBMIT BUTTON (AUTHOR ONLY) ===== */}
      {canSubmit && (
        <button
          onClick={handleSubmit}
          className="px-6 py-3 rounded font-semibold text-white bg-teal-600 hover:bg-teal-700"
        >
          {submission ? "Cập nhật bài nộp" : "Nộp bài"}
        </button>
      )}

      {/* ===== REVIEWER / ADMIN NOTICE ===== */}
      {!canSubmit && (
        <div className="text-sm text-gray-500 italic">
          Bạn không có quyền nộp hoặc chỉnh sửa bài.
        </div>
      )}
    </div>
  );
}
