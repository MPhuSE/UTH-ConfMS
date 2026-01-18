import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { reviewService, submissionService } from "../../../services";
import { useAuthStore } from "../../../app/store/useAuthStore";

export default function MyReviewsPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [myReviews, allSubs] = await Promise.all([
        reviewService.getMyReviews(),
        submissionService.getAll(),
      ]);

      setReviews(myReviews || []);
      
      // Create a map of submissions
      const subMap = new Map((allSubs || []).map((s) => [s.id, s]));
      
      // Enrich reviews with submission data
      const enriched = (myReviews || []).map((r) => {
        const sub = subMap.get(r.submission_id);
        return {
          ...r,
          submission: sub,
          title: sub?.title || `Submission #${r.submission_id}`,
          conference_id: sub?.conference_id,
          track_name: sub?.track?.name || "N/A",
        };
      });
      
      setSubmissions(enriched);
    } catch (error) {
      console.error("Load reviews error:", error);
      toast.error("Không thể tải danh sách reviews");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-500">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Reviews</h1>
          <p className="mt-1 text-sm text-gray-500">
            Danh sách các bài đánh giá bạn đã gửi
          </p>
        </div>
        <button
          onClick={loadData}
          className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition"
        >
          Refresh
        </button>
      </div>

      {reviews.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có bài đánh giá nào</h3>
          <p className="text-sm text-gray-500 mb-4">Bạn sẽ thấy các bài đánh giá đã gửi ở đây.</p>
          <Link
            to="/dashboard/reviewer/assignments"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Xem assignments
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{review.title}</h3>
                    {review.best_paper_recommendation && (
                      <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                        ⭐ Best Paper
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 mb-4">
                    Submission #{review.submission_id} • Conference #{review.conference_id || "N/A"} • Track: {review.track_name}
                  </div>

                  {review.summary && (
                    <div className="mb-3">
                      <div className="text-xs font-medium text-gray-700 mb-1">Summary:</div>
                      <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded border border-gray-200">
                        {review.summary}
                      </div>
                    </div>
                  )}

                  {review.weakness && (
                    <div className="mb-3">
                      <div className="text-xs font-medium text-gray-700 mb-1">Weakness:</div>
                      <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded border border-gray-200">
                        {review.weakness}
                      </div>
                    </div>
                  )}

                  {review.answers && review.answers.length > 0 && (
                    <div className="mb-3">
                      <div className="text-xs font-medium text-gray-700 mb-1">Answers:</div>
                      <div className="space-y-1">
                        {review.answers.map((ans, idx) => (
                          <div key={idx} className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                            <span className="font-medium">Q{ans.question_id}:</span> {ans.answer}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="ml-4 flex flex-col gap-2">
                  <Link
                    to={`/dashboard/reviewer/review/${review.submission_id}`}
                    className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition"
                  >
                    Edit Review
                  </Link>
                  <Link
                    to={`/dashboard/submission/${review.submission_id}/discussion`}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition"
                  >
                    Discussion
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
