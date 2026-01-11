import React, { useState, useEffect } from 'react';
import submissionService from '../services/submissionService';
import reviewService from '../services/reviewService';

const AssignmentPage = ({ conferenceId }) => {
  const [submissions, setSubmissions] = useState([]);
  const [reviewers, setReviewers] = useState([]); // Giả định lấy từ một userService
  const [assignments, setAssignments] = useState({}); // Lưu danh sách reviewer cho mỗi bài
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, [conferenceId]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      // 1. Lấy tất cả bài báo của hội nghị
      const subData = await api.get(`/submissions/conference/${conferenceId}`);
      setSubmissions(subData.data);

      // 2. Lấy danh sách tất cả Reviewer hiện có (để chọn trong dropdown)
      const revData = await api.get('/users/roles/reviewer');
      setReviewers(revData.data);

      // 3. Lấy thông tin phân công cho từng bài báo
      const assignmentMap = {};
      for (const sub of subData.data) {
        const data = await reviewService.getAssignmentsBySubmission(sub.id);
        assignmentMap[sub.id] = data;
      }
      setAssignments(assignmentMap);
    } catch (error) {
      console.error("Lỗi tải dữ liệu phân công:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (submissionId, reviewerId) => {
    if (!reviewerId) return;
    try {
      await reviewService.assignReviewer({
        submission_id: submissionId,
        reviewer_id: reviewerId,
        auto_assigned: false
      });
      // Refresh riêng bài báo đó sau khi gán
      const updated = await reviewService.getAssignmentsBySubmission(submissionId);
      setAssignments({ ...assignments, [submissionId]: updated });
    } catch (error) {
      alert("Lỗi: Reviewer này có thể đã bị trùng hoặc có Xung đột lợi ích (COI)!");
    }
  };

  const handleUnassign = async (submissionId, reviewerId) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy phân công reviewer này?")) return;
    try {
      await reviewService.unassignReviewer(submissionId, reviewerId);
      const updated = await reviewService.getAssignmentsBySubmission(submissionId);
      setAssignments({ ...assignments, [submissionId]: updated });
    } catch (error) {
      alert("Không thể hủy phân công.");
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Đang chuẩn bị dữ liệu phân công...</div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Quản lý Phân công Review</h1>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 shadow">
            Tự động phân công (AI)
          </button>
        </div>

        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4 text-sm font-bold text-gray-600 uppercase border-b">Thông tin bài báo</th>
                <th className="p-4 text-sm font-bold text-gray-600 uppercase border-b">Reviewers đã gán</th>
                <th className="p-4 text-sm font-bold text-gray-600 uppercase border-b">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {submissions.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50 transition">
                  <td className="p-4">
                    <div className="font-bold text-gray-800">{sub.title}</div>
                    <div className="text-xs text-gray-400">Track: {sub.track_name} | ID: #{sub.id}</div>
                  </td>
                  
                  <td className="p-4">
                    <div className="flex flex-wrap gap-2">
                      {assignments[sub.id]?.length > 0 ? (
                        assignments[sub.id].map((asn) => (
                          <span key={asn.reviewer_id} className="inline-flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium border border-blue-100">
                            {asn.reviewer_name}
                            <button 
                              onClick={() => handleUnassign(sub.id, asn.reviewer_id)}
                              className="ml-2 text-blue-400 hover:text-red-500"
                            >
                              &times;
                            </button>
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400 text-sm italic">Chưa có ai</span>
                      )}
                    </div>
                  </td>

                  <td className="p-4">
                    <select
                      className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                      onChange={(e) => handleAssign(sub.id, e.target.value)}
                      value=""
                    >
                      <option value="">+ Thêm Reviewer</option>
                      {reviewers.map(rev => (
                        <option key={rev.id} value={rev.id}>
                          {rev.full_name} ({rev.specialization})
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AssignmentPage;