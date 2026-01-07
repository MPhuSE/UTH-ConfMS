// src/components/SubmissionInfo.jsx
export default function SubmissionInfo({ deadline, submission }) {
  const expired = deadline && new Date() > new Date(deadline);

  return (
    <div className="bg-gray-50 p-6 rounded-xl space-y-3">
      <h3 className="font-semibold text-lg">Thông tin bài nộp</h3>

      <p>
        <b>Deadline:</b>{" "}
        {deadline ? new Date(deadline).toLocaleString() : "Chưa cấu hình"}
      </p>

      <p>
        <b>Trạng thái:</b>{" "}
        {submission ? "Đã nộp" : "Chưa nộp"}
      </p>

      <p>
        <b>Lần chỉnh sửa cuối:</b>{" "}
        {submission?.updatedAt
          ? new Date(submission.updatedAt).toLocaleString()
          : "—"}
      </p>

      {expired && (
        <p className="text-red-600 font-semibold">
          ⛔ Đã quá hạn nộp bài
        </p>
      )}
    </div>
  );
}
