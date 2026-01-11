import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import useReview from "./useReview";

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white border rounded-lg p-5 flex items-center gap-4">
    <div className={`p-3 rounded ${color}`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <div>
      <p className="text-sm text-gray-600">{title}</p>
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  </div>
);

export default function ReviewerDashboard() {
  const navigate = useNavigate();
  const {
    assignedPapers,
    fetchAssignedPapers,
  } = useReview();

  useEffect(() => {
    fetchAssignedPapers();
  }, [fetchAssignedPapers]);

  const total = assignedPapers.length;
  const reviewed = assignedPapers.filter(p => p.review_submitted).length;
  const pending = total - reviewed;
  const conflicted = assignedPapers.filter(p => p.conflict_declared).length;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Reviewer Dashboard
        </h1>
        <p className="text-gray-600">
          Manage assigned papers and submit peer reviews
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Assigned Papers"
          value={total}
          icon={FileText}
          color="bg-blue-600"
        />
        <StatCard
          title="Reviewed"
          value={reviewed}
          icon={CheckCircle}
          color="bg-green-600"
        />
        <StatCard
          title="Pending"
          value={pending}
          icon={Clock}
          color="bg-yellow-500"
        />
        <StatCard
          title="Conflicts"
          value={conflicted}
          icon={AlertTriangle}
          color="bg-red-600"
        />
      </div>

      {/* Assigned papers */}
      <div className="bg-white border rounded-lg">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            Assigned Papers
          </h2>
        </div>

        {assignedPapers.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No papers assigned.
          </div>
        ) : (
          <table className="min-w-full divide-y">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left">Title</th>
                <th className="px-4 py-3 text-left">Conference</th>
                <th className="px-4 py-3">Deadline</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {assignedPapers.map(paper => (
                <tr key={paper.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium">
                    {paper.title}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {paper.conference?.acronym}
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    {paper.review_deadline || "—"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 text-xs rounded ${
                      paper.review_submitted
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {paper.review_submitted ? "Reviewed" : "Pending"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() =>
                        navigate(`/dashboard/review-form?paperId=${paper.id}`)
                      }
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}