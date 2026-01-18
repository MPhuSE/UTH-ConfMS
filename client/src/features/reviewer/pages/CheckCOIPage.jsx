import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { reviewService, submissionService } from "../../../services";
import { useAuthStore } from "../../../app/store/useAuthStore";

export default function CheckCOIPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState([]);
  const [coiStatus, setCoiStatus] = useState({}); // { submission_id: { has_coi, checked } }
  const [myCOIs, setMyCOIs] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [allSubs, cois] = await Promise.all([
        submissionService.getAll(),
        reviewService.getMyCOIs(),
      ]);

      setSubmissions(allSubs || []);
      
      // Create COI map
      const coiMap = {};
      (cois || []).forEach((coi) => {
        coiMap[coi.submission_id] = { has_coi: true, checked: true, coi_type: coi.coi_type };
      });
      setCoiStatus(coiMap);
      setMyCOIs(cois || []);
    } catch (error) {
      console.error("Load data error:", error);
      toast.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const checkCOI = async (submissionId) => {
    try {
      const result = await reviewService.checkCOI(submissionId);
      setCoiStatus((prev) => ({
        ...prev,
        [submissionId]: {
          has_coi: result.has_coi,
          checked: true,
        },
      }));
      
      if (result.has_coi) {
        toast.error(`Xung đột lợi ích (COI) được phát hiện với Submission #${submissionId}`);
      } else {
        toast.success(`Không có xung đột lợi ích với Submission #${submissionId}`);
      }
    } catch (error) {
      console.error("Check COI error:", error);
      toast.error("Không thể kiểm tra COI");
    }
  };

  const declareCOI = async (submissionId) => {
    const reason = prompt("Nhập lý do xung đột lợi ích (ví dụ: Đồng tác giả, cùng cơ quan...):");
    if (!reason || !reason.trim()) return;

    try {
      await reviewService.declareCOI({
        submission_id: submissionId,
        user_id: user.id,
        coi_type: reason.trim(),
      });
      
      setCoiStatus((prev) => ({
        ...prev,
        [submissionId]: {
          has_coi: true,
          checked: true,
          coi_type: reason.trim(),
        },
      }));
      
      toast.success("Đã khai báo xung đột lợi ích thành công");
      loadData(); // Reload to get updated COI list
    } catch (error) {
      console.error("Declare COI error:", error);
      const message = error?.response?.data?.detail || "Lỗi khi khai báo COI";
      toast.error(message);
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
          <h1 className="text-3xl font-bold text-gray-900">Check Conflict of Interest</h1>
          <p className="mt-1 text-sm text-gray-500">
            Kiểm tra và khai báo xung đột lợi ích với các bài báo
          </p>
        </div>
        <button
          onClick={loadData}
          className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition"
        >
          Refresh
        </button>
      </div>

      {/* COI Summary */}
      {myCOIs.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <h3 className="text-sm font-medium text-red-800">
              Bạn đã khai báo {myCOIs.length} xung đột lợi ích
            </h3>
          </div>
          <div className="text-sm text-red-700">
            {myCOIs.map((coi) => (
              <div key={`${coi.submission_id}-${coi.user_id}`} className="mt-1">
                • Submission #{coi.submission_id}: {coi.coi_type}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submissions List */}
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
                  COI Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {submissions.map((sub) => {
                const status = coiStatus[sub.id];
                const hasCOI = status?.has_coi || false;
                const checked = status?.checked || false;

                return (
                  <tr key={sub.id} className={hasCOI ? "bg-red-50" : "hover:bg-gray-50"}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{sub.title}</div>
                      <div className="text-sm text-gray-500">ID: #{sub.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        Conference #{sub.conference_id || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {checked ? (
                        hasCOI ? (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            ⚠️ COI Detected
                            {status.coi_type && ` (${status.coi_type})`}
                          </span>
                        ) : (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            ✓ No COI
                          </span>
                        )
                      ) : (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          Not checked
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        {!hasCOI && (
                          <>
                            <button
                              onClick={() => checkCOI(sub.id)}
                              className="text-blue-600 hover:text-blue-900 font-medium"
                            >
                              Check COI
                            </button>
                            <span className="text-gray-300">|</span>
                          </>
                        )}
                        <button
                          onClick={() => declareCOI(sub.id)}
                          className="text-red-600 hover:text-red-900 font-medium"
                        >
                          Declare COI
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Lưu ý về COI</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>• Xung đột lợi ích (COI) bao gồm: đồng tác giả, cùng cơ quan, quan hệ cá nhân, v.v.</p>
              <p>• Nếu bạn là tác giả của bài báo, hệ thống sẽ tự động phát hiện COI</p>
              <p>• Vui lòng khai báo COI ngay khi phát hiện để tránh vi phạm quy định</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
