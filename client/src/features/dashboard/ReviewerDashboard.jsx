import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, CheckCircle, Clock, AlertTriangle, ArrowRight } from "lucide-react";
import useReview from "./useReview";

const StatCard = ({ title, value, icon: Icon, color, bgColor }) => (
  <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-2">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
      <div className={`p-3 rounded-xl ${bgColor}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
    <div className="mt-4 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
      <div 
        className="h-full rounded-full transition-all duration-500"
        style={{ 
          width: title === "Assigned Papers" ? "100%" : 
                 title === "Reviewed" ? `${(value/(value + (title === "Pending" ? 0 : value)))*100}%` : 
                 title === "Pending" ? `${(value/(value + reviewedValue))*100}%` : "100%",
          backgroundColor: color 
        }}
      />
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

  // Màu chính và các biến thể
  const primaryColor = "rgb(0, 134, 137)";
  const primaryLight = "rgba(0, 134, 137, 0.1)";
  const primaryLighter = "rgba(0, 134, 137, 0.05)";
  const primaryDark = "rgb(0, 100, 102)";
  
  // Màu cho các stat card
  const statColors = {
    assigned: { bg: "rgba(0, 134, 137, 0.15)", color: primaryColor },
    reviewed: { bg: "rgba(16, 185, 129, 0.15)", color: "rgb(6, 95, 70)" },
    pending: { bg: "rgba(245, 158, 11, 0.15)", color: "rgb(180, 83, 9)" },
    conflicted: { bg: "rgba(239, 68, 68, 0.15)", color: "rgb(185, 28, 28)" }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-gray-900 uppercase italic" style={{ color: primaryColor }}>
              Reviewer Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Manage assigned papers and submit peer reviews
            </p>
          </div>
          <div className="text-xs font-black uppercase text-gray-400">
            Papers Review
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Assigned Papers"
          value={total}
          icon={FileText}
          color={statColors.assigned.color}
          bgColor="bg-[rgb(0,134,137)]"
        />
        <StatCard
          title="Reviewed"
          value={reviewed}
          icon={CheckCircle}
          color={statColors.reviewed.color}
          bgColor="bg-emerald-600"
        />
        <StatCard
          title="Pending"
          value={pending}
          icon={Clock}
          color={statColors.pending.color}
          bgColor="bg-amber-500"
        />
        <StatCard
          title="Conflicts"
          value={conflicted}
          icon={AlertTriangle}
          color={statColors.conflicted.color}
          bgColor="bg-red-600"
        />
      </div>

      {/* Assigned Papers Table */}
      <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-gray-900 uppercase italic" style={{ color: primaryColor }}>
                Assigned Papers
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Click "Review" to submit your evaluation
              </p>
            </div>
            <div className="px-4 py-2 rounded-full text-xs font-bold uppercase" style={{ 
              backgroundColor: primaryLighter,
              color: primaryColor
            }}>
              {assignedPapers.length} Papers
            </div>
          </div>
        </div>

        {assignedPapers.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ 
              backgroundColor: primaryLighter 
            }}>
              <FileText className="w-8 h-8" style={{ color: primaryColor }} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No papers assigned</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Papers will appear here once the conference chair assigns them to you.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-8 py-4 text-left text-xs font-black uppercase text-gray-500 tracking-wider">
                    Title
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-black uppercase text-gray-500 tracking-wider">
                    Conference
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-black uppercase text-gray-500 tracking-wider">
                    Deadline
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-black uppercase text-gray-500 tracking-wider">
                    Status
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-black uppercase text-gray-500 tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {assignedPapers.map(paper => (
                  <tr 
                    key={paper.id} 
                    className="hover:bg-gray-50/30 transition-colors duration-200 group"
                  >
                    <td className="px-8 py-4">
                      <div className="max-w-xs">
                        <p className="text-sm font-semibold text-gray-900 group-hover:text-gray-700">
                          {paper.title}
                        </p>
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <span className="text-sm text-gray-600 font-medium">
                        {paper.conference?.acronym || "—"}
                      </span>
                    </td>
                    <td className="px-8 py-4">
                      <span className="text-sm text-gray-600">
                        {paper.review_deadline || "—"}
                      </span>
                    </td>
                    <td className="px-8 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                        paper.review_submitted
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}>
                        {paper.review_submitted ? "Reviewed" : "Pending"}
                      </span>
                    </td>
                    <td className="px-8 py-4">
                      <button
                        onClick={() =>
                          navigate(`/dashboard/review-form?paperId=${paper.id}`)
                        }
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 hover:gap-3 hover:shadow-md"
                        style={{ 
                          backgroundColor: primaryColor,
                          color: "white"
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = primaryDark;
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = primaryColor;
                        }}
                      >
                        Review
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer Note */}
      <div className="text-center text-sm text-gray-500 pt-4">
        <p>
          Need help? Contact the conference chair for review guidelines and support.
        </p>
      </div>
    </div>
  );
}