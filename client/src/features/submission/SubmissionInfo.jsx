export default function SubmissionInfo({ submission, deadline }) {
  if (!deadline) {
    return (
      <div className="bg-yellow-50 p-6 rounded-xl">
        <p className="text-sm text-yellow-700">
          Chưa có deadline được cấu hình
        </p>
      </div>
    );
  }

  const endDate = deadline.endAt
    ? new Date(deadline.endAt).toLocaleString()
    : "—";

  return (
    <div className="bg-gray-50 p-6 rounded-xl space-y-3">
      <h3 className="font-semibold text-lg">Thông tin bài nộp</h3>

      <p>
        <b>Deadline:</b> {endDate}
      </p>

      <p>
        <b>Trạng thái:</b>{" "}
        {submission
          ? "Đã nộp"
          : "Chưa nộp"}
      </p>

      <p>
        <b>Lần chỉnh sửa cuối:</b>{" "}
        {submission?.updatedAt
          ? new Date(submission.updatedAt).toLocaleString()
          : "—"}
      </p>
  {submission && (
        <div className="border-t pt-4">
          <h3 className="font-semibold text-lg">Rebuttal</h3>

          {role === "AUTHOR" && (
            <AuthorRebuttalForm paperId={submission.id} />
          )}

          {role === "REVIEWER" && (
            <ReviewerRebuttalView paperId={submission.id} />
          )}
        </div>
      )}
    </div>
  );
}
