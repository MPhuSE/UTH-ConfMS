import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { reviewService, submissionService, userService, conferenceService } from "../../../services";
import { getErrorMessage } from "../../../utils/errors";
import { AlertTriangle, Search, FileText, Users, X } from "lucide-react";

export default function COIManagementPage() {
  const { conferenceId } = useParams();
  const [loading, setLoading] = useState(true);
  const [cois, setCois] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [users, setUsers] = useState([]);
  const [conferences, setConferences] = useState([]);
  const [selectedConferenceId, setSelectedConferenceId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSubmissionId, setFilterSubmissionId] = useState("");
  const [filterUserId, setFilterUserId] = useState("");

  const activeConferenceId = useMemo(() => {
    const fromParam = Number(conferenceId);
    if (!Number.isNaN(fromParam) && fromParam > 0) return fromParam;
    const fromState = Number(selectedConferenceId);
    if (!Number.isNaN(fromState) && fromState > 0) return fromState;
    return null;
  }, [conferenceId, selectedConferenceId]);

  useEffect(() => {
    loadData();
  }, [activeConferenceId]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load conferences
      const confData = await conferenceService.getAll();
      const confList = confData.conferences || confData || [];
      setConferences(confList);
      if (!conferenceId && !selectedConferenceId && confList.length > 0) {
        setSelectedConferenceId(String(confList[0].id));
      }

      if (!activeConferenceId) {
        setLoading(false);
        return;
      }

      // Load COIs for conference
      const coisData = await reviewService.getCOIsByConference(activeConferenceId);
      setCois(coisData || []);

      // Load submissions for reference (filtered by active conference)
      const subsData = await submissionService.getAll(activeConferenceId);
      setSubmissions(subsData || []);

      // Load users (reviewers) for reference
      const reviewersData = await userService.listUsersByRole("reviewer");
      // Server returns {role: {...}, users: [...]}
      const reviewersList = Array.isArray(reviewersData)
        ? reviewersData
        : (reviewersData?.users || []);
      setUsers(reviewersList || []);
    } catch (error) {
      console.error("Load COI data error:", error);
      toast.error(getErrorMessage(error, "Không thể tải dữ liệu COI"));
    } finally {
      setLoading(false);
    }
  };

  const handleDeclareCOI = async (submissionId, userId, coiType) => {
    try {
      await reviewService.declareCOI({
        submission_id: submissionId,
        user_id: userId,
        coi_type: coiType,
      });
      toast.success("Đã khai báo COI thành công");
      loadData();
    } catch (error) {
      toast.error(getErrorMessage(error, "Lỗi khi khai báo COI"));
    }
  };

  // Filter COIs
  const filteredCOIs = useMemo(() => {
    let filtered = cois;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((coi) => {
        const sub = submissions.find((s) => s.id === coi.submission_id);
        const user = Array.isArray(users) ? users.find((u) => u.id === coi.user_id) : null;
        return (
          (sub?.title || "").toLowerCase().includes(term) ||
          (user?.full_name || "").toLowerCase().includes(term) ||
          (user?.email || "").toLowerCase().includes(term) ||
          coi.coi_type?.toLowerCase().includes(term)
        );
      });
    }

    if (filterSubmissionId) {
      filtered = filtered.filter((coi) => coi.submission_id === Number(filterSubmissionId));
    }

    if (filterUserId) {
      filtered = filtered.filter((coi) => coi.user_id === Number(filterUserId));
    }

    return filtered;
  }, [cois, searchTerm, filterSubmissionId, filterUserId, submissions, users]);

  const getUserName = (userId) => {
    if (!Array.isArray(users)) return `User #${userId}`;
    const user = users.find((u) => u.id === userId);
    return user ? `${user.full_name || user.email || "N/A"} (${user.email || "N/A"})` : `User #${userId}`;
  };

  const getSubmissionTitle = (submissionId) => {
    const sub = submissions.find((s) => s.id === submissionId);
    return sub?.title || `Submission #${submissionId}`;
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Conflict of Interest (COI)</h1>
          <p className="mt-1 text-sm text-gray-500">
            Xem và quản lý các xung đột lợi ích trong hội nghị
          </p>
        </div>
        <button
          onClick={loadData}
          className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition"
        >
          Refresh
        </button>
      </div>

      {/* Conference Selector */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Chọn hội nghị
        </label>
        <select
          value={selectedConferenceId}
          onChange={(e) => setSelectedConferenceId(e.target.value)}
          className="w-full md:w-64 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">-- Chọn hội nghị --</option>
          {conferences.map((conf) => (
            <option key={conf.id} value={conf.id}>
              {conf.name} ({conf.acronym})
            </option>
          ))}
        </select>
      </div>

      {!activeConferenceId ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-800">Vui lòng chọn một hội nghị để xem COIs</p>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total COIs</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{cois.length}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Unique Submissions</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {new Set(cois.map((c) => c.submission_id)).size}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Unique Reviewers</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {new Set(cois.map((c) => c.user_id)).size}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tìm kiếm
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tìm theo title, reviewer, email..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lọc theo Submission
                </label>
                <select
                  value={filterSubmissionId}
                  onChange={(e) => setFilterSubmissionId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Tất cả</option>
                  {submissions.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      #{sub.id} - {sub.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lọc theo Reviewer
                </label>
                <select
                  value={filterUserId}
                  onChange={(e) => setFilterUserId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Tất cả</option>
                  {Array.isArray(users) && users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.full_name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {(searchTerm || filterSubmissionId || filterUserId) && (
              <div className="mt-4 flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-600">Active filters:</span>
                {searchTerm && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                    Search: {searchTerm}
                    <button
                      onClick={() => setSearchTerm("")}
                      className="hover:text-blue-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filterSubmissionId && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                    Submission: #{filterSubmissionId}
                    <button
                      onClick={() => setFilterSubmissionId("")}
                      className="hover:text-green-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filterUserId && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm">
                    Reviewer: {getUserName(Number(filterUserId))}
                    <button
                      onClick={() => setFilterUserId("")}
                      className="hover:text-purple-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* COIs Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submission
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reviewer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      COI Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Detected By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCOIs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                        {cois.length === 0
                          ? "Chưa có COI nào được khai báo cho hội nghị này"
                          : "Không tìm thấy COI nào phù hợp với bộ lọc"}
                      </td>
                    </tr>
                  ) : (
                    filteredCOIs.map((coi) => (
                      <tr key={`${coi.submission_id}-${coi.user_id}`} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            #{coi.submission_id}
                          </div>
                          <div className="text-sm text-gray-500">
                            {getSubmissionTitle(coi.submission_id)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {getUserName(coi.user_id)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            {coi.coi_type || "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {coi.detected_by_system ? (
                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              System
                            </span>
                          ) : (
                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                              Manual
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => {
                              const sub = submissions.find((s) => s.id === coi.submission_id);
                              if (sub) {
                                window.open(`/dashboard/submission/${coi.submission_id}`, "_blank");
                              }
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View Submission
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Lưu ý về COI</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>• COI được phát hiện tự động khi reviewer là tác giả của submission</p>
                  <p>• COI được khai báo thủ công bởi reviewer hoặc chair/admin</p>
                  <p>• Hệ thống sẽ tự động ngăn không cho assign reviewer có COI</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
