import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { reviewService, submissionService } from "../../../services";
import { useAuthStore } from "../../../app/store/useAuthStore";

export default function MyAssignmentsPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [assigns, allSubs] = await Promise.all([
        reviewService.getMyAssignments(),
        submissionService.getAll(),
      ]);

      setAssignments(assigns || []);
      
      // Create a map of submissions
      const subMap = new Map((allSubs || []).map((s) => [s.id, s]));
      
      // Enrich assignments with submission data
      const enriched = (assigns || []).map((a) => {
        const sub = subMap.get(a.submission_id);
        return {
          ...a,
          submission: sub,
          title: sub?.title || `Submission #${a.submission_id}`,
          conference_id: sub?.conference_id,
          track_name: sub?.track?.name || "N/A",
          status: sub?.status || "N/A",
        };
      });
      
      setSubmissions(enriched);
    } catch (error) {
      console.error("Load assignments error:", error);
      toast.error("Không thể tải danh sách assignments");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { label: "Chờ đánh giá", color: "bg-yellow-100 text-yellow-800" },
      reviewing: { label: "Đang đánh giá", color: "bg-blue-100 text-blue-800" },
      completed: { label: "Hoàn thành", color: "bg-green-100 text-green-800" },
      accepted: { label: "Chấp nhận", color: "bg-green-100 text-green-800" },
      rejected: { label: "Từ chối", color: "bg-red-100 text-red-800" },
    };
    const s = statusMap[status?.toLowerCase()] || { label: status || "N/A", color: "bg-gray-100 text-gray-800" };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${s.color}`}>
        {s.label}
      </span>
    );
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
          <h1 className="text-3xl font-bold text-gray-900">My Assignments</h1>
          <p className="mt-1 text-sm text-gray-500">
            Danh sách các bài báo được phân công cho bạn
          </p>
        </div>
        <button
          onClick={loadData}
          className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition"
        >
          Refresh
        </button>
      </div>

      {submissions.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có bài nào được phân công</h3>
          <p className="text-sm text-gray-500">Bạn sẽ thấy các bài báo được phân công ở đây khi có.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bài báo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conference
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Track
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {submissions.map((item) => (
                  <tr key={item.submission_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.title}</div>
                          <div className="text-sm text-gray-500">ID: #{item.submission_id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        Conference #{item.conference_id || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{item.track_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/dashboard/reviewer/review/${item.submission_id}`}
                          className="text-blue-600 hover:text-blue-900 font-medium"
                        >
                          Review
                        </Link>
                        <span className="text-gray-300">|</span>
                        <Link
                          to={`/dashboard/submission/${item.submission_id}/discussion`}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          Discussion
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Lưu ý</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>• Bạn chỉ có thể review các bài báo được phân công cho bạn</p>
              <p>• Nếu phát hiện xung đột lợi ích (COI), vui lòng báo cáo ngay</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
