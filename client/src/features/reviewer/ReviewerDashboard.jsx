import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { reviewService, submissionService } from "../../services";
import { useAuthStore } from "../../app/store/useAuthStore";

export default function ReviewerDashboard() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAssignments: 0,
    completedReviews: 0,
    pendingReviews: 0,
    totalCOIs: 0,
  });
  const [recentAssignments, setRecentAssignments] = useState([]);

  const reviewerId = useMemo(() => user?.id, [user?.id]);

  useEffect(() => {
    if (!reviewerId) return;
    load();
  }, [reviewerId]);

  const load = async () => {
    try {
      setLoading(true);
      const [assigns, reviews, cois, subs] = await Promise.all([
        reviewService.getMyAssignments(),
        reviewService.getMyReviews(),
        reviewService.getMyCOIs(),
        submissionService.getAll(),
      ]);

      const subMap = new Map((subs || []).map((s) => [s.id, s]));
      
      // Calculate stats
      const totalAssignments = (assigns || []).length;
      const completedReviews = (reviews || []).length;
      const pendingReviews = totalAssignments - completedReviews;
      const totalCOIs = (cois || []).length;

      setStats({
        totalAssignments,
        completedReviews,
        pendingReviews,
        totalCOIs,
      });

      // Get recent assignments (limit to 5)
      const recent = (assigns || []).slice(0, 5).map((a) => {
        const s = subMap.get(a.submission_id);
        const hasReview = (reviews || []).some((r) => r.submission_id === a.submission_id);
        return {
          ...a,
          title: s?.title || `Submission #${a.submission_id}`,
          conference_id: s?.conference_id,
          status: s?.status,
          hasReview,
        };
      });
      setRecentAssignments(recent);
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải dữ liệu dashboard");
    } finally {
      setLoading(false);
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reviewer Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Tổng quan công việc đánh giá của bạn</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Assignments</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalAssignments}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Completed Reviews</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.completedReviews}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Pending Reviews</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pendingReviews}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">COIs Declared</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{stats.totalCOIs}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/dashboard/reviewer/assignments"
          className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900">My Assignments</p>
              <p className="text-sm text-gray-500">Xem tất cả assignments</p>
            </div>
          </div>
        </Link>

        <Link
          to="/dashboard/reviewer/reviews"
          className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900">My Reviews</p>
              <p className="text-sm text-gray-500">Xem reviews đã gửi</p>
            </div>
          </div>
        </Link>

        <Link
          to="/dashboard/reviewer/bidding"
          className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Bidding & COI</p>
              <p className="text-sm text-gray-500">Đặt bid và khai báo COI</p>
            </div>
          </div>
        </Link>

        <Link
          to="/dashboard/reviewer/check-coi"
          className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Check COI</p>
              <p className="text-sm text-gray-500">Kiểm tra xung đột lợi ích</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Assignments */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Recent Assignments</h2>
            <p className="text-sm text-gray-500">Các bài báo được phân công gần đây</p>
          </div>
          <Link
            to="/dashboard/reviewer/assignments"
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            View All →
          </Link>
        </div>

        {recentAssignments.length === 0 ? (
          <div className="p-6 text-sm text-gray-500 text-center">Chưa có bài nào được phân công.</div>
        ) : (
          <div className="divide-y">
            {recentAssignments.map((item) => (
              <div key={item.submission_id} className="p-4 flex items-start justify-between gap-4 hover:bg-gray-50">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">{item.title}</span>
                    {item.hasReview && (
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        Reviewed
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    Submission #{item.submission_id} • Conference #{item.conference_id ?? "N/A"} • Status: {item.status ?? "N/A"}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/dashboard/reviewer/review/${item.submission_id}`}
                    className="px-3 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                  >
                    {item.hasReview ? "Edit Review" : "Review"}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

