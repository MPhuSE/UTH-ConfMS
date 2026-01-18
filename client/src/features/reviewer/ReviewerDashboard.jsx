import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { submissionService, reviewService } from "../../services";
import { useAuthStore } from "../../app/store/useAuthStore";

export default function ReviewerDashboard() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);

  const reviewerId = useMemo(() => user?.id, [user?.id]);

  useEffect(() => {
    if (!reviewerId) return;
    load();
  }, [reviewerId]);

  const load = async () => {
    try {
      setLoading(true);
      const [assigns, subs] = await Promise.all([
        reviewService.getAssignmentsByReviewer(reviewerId),
        submissionService.getAll(),
      ]);
      const subMap = new Map((subs || []).map((s) => [s.id, s]));
      const rows = (assigns || []).map((a) => {
        const s = subMap.get(a.submission_id);
        return {
          submission_id: a.submission_id,
          title: s?.title || `Submission #${a.submission_id}`,
          conference_id: s?.conference_id,
          status: s?.status,
        };
      });
      setItems(rows);
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải assignments của reviewer");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Đang tải...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reviewer Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Danh sách bài được phân công</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="font-semibold text-gray-800">Assignments</div>
          <button
            onClick={load}
            className="text-sm text-teal-700 hover:underline"
          >
            Refresh
          </button>
        </div>

        {items.length === 0 ? (
          <div className="p-6 text-sm text-gray-500">Chưa có bài nào được phân công.</div>
        ) : (
          <div className="divide-y">
            {items.map((it) => (
              <div key={it.submission_id} className="p-4 flex items-start justify-between gap-4">
                <div>
                  <div className="font-medium text-gray-900">{it.title}</div>
                  <div className="text-xs text-gray-500">
                    Submission #{it.submission_id} • Conference #{it.conference_id ?? "N/A"} • Status:{" "}
                    {it.status ?? "N/A"}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/dashboard/reviewer/review/${it.submission_id}`}
                    className="px-3 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Review
                  </Link>
                  <Link
                    to={`/dashboard/submission/${it.submission_id}/discussion`}
                    className="px-3 py-2 text-sm rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200"
                  >
                    Discussion
                  </Link>
                  <Link
                    to={`/dashboard/reviewer/rebuttal/${it.submission_id}`}
                    className="px-3 py-2 text-sm rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200"
                  >
                    Rebuttal
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

