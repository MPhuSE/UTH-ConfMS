// features/dashboard/AuthorDashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../app/store/useAuthStore";
import { useSubmissionStore } from "../../app/store/useSubmissionStore";
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  XCircle,
  Calendar,
  Plus,
  RefreshCw,
  Download,
  Eye,
  Edit,
  ArrowRight,
  BarChart3,
  Users,
  BookOpen,
  TrendingUp,
  AlertCircle,
  Search,
  Filter
} from "lucide-react";


const StatCard = ({ title, value, icon: Icon, subtitle, trend }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-5 hover:border-gray-300 transition-colors">
    <div className="flex items-start justify-between mb-3">
      <div className="p-2 bg-gray-50 rounded">
        <Icon className="w-5 h-5 text-gray-700" />
      </div>
      {trend && (
        <span className={`text-xs font-medium px-2 py-1 rounded ${
          trend > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <div>
      <p className="text-2xl font-semibold text-gray-900 mb-1">{value}</p>
      <p className="text-sm text-gray-600 font-medium">{title}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  </div>
);

const ConferenceCard = ({ conference, onClick }) => (
  <div 
    onClick={onClick}
    className="bg-white border border-gray-200 rounded-lg p-5 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
  >
    <div className="flex items-start justify-between mb-3">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <h4 className="font-semibold text-gray-900 text-base">{conference.acronym}</h4>
          {conference.scopus && (
            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded">
              Scopus
            </span>
          )}
          <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded">
            {conference.impact}
          </span>
        </div>
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{conference.name}</p>
      </div>
    </div>
    
    <div className="space-y-2 text-sm text-gray-600 mb-4">
      <div className="flex items-center">
        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
        <span>{new Date(conference.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        <span className="mx-2">—</span>
        <span>{new Date(conference.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
      </div>
      <div className="flex items-center">
        <Users className="w-4 h-4 mr-2 text-gray-400" />
        <span>{conference.location}</span>
      </div>
      <div className="flex items-center">
        <Clock className="w-4 h-4 mr-2 text-gray-400" />
        <span className="font-medium">Deadline: {new Date(conference.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
      </div>
    </div>
    
    <button className="w-full py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors">
      Submit Paper
    </button>
  </div>
);

const SubmissionRow = ({ paper, onView, onEdit }) => {
  const getStatusConfig = (status) => {
    const s = (status || "").toLowerCase();
    switch (s) {
      case "accept":
      case "accepted":
        return {
          color: "bg-green-50 text-green-700 border-green-200",
          label: "Accepted"
        };
      case "reject":
      case "rejected":
        return {
          color: "bg-red-50 text-red-700 border-red-200",
          label: "Rejected"
        };
      case "under review":
      case "reviewing":
        return {
          color: "bg-yellow-50 text-yellow-700 border-yellow-200",
          label: "Under Review"
        };
      default:
        return {
          color: "bg-blue-50 text-blue-700 border-blue-200",
          label: "Submitted"
        };
    }
  };

  const statusConfig = getStatusConfig(paper.status);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors group">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3 mb-2">
            <BookOpen className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 text-base mb-1 leading-tight">{paper.title}</h4>
              <p className="text-sm text-gray-600 mb-2">{paper.authors}</p>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="text-gray-500">
                  <span className="font-medium">{paper.conference.acronym}</span>
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-500">ID: {paper.paper_id}</span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-500">
                  Submitted: {new Date(paper.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                {paper.decision_date && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-500">
                      Decision: {new Date(paper.decision_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </>
                )}
              </div>
              <div className="mt-3">
                <span className={`inline-flex items-center px-3 py-1 rounded text-xs font-medium border ${statusConfig.color}`}>
                  {statusConfig.label}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onView}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={onEdit}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default function AuthorDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const myCounts = {
    total: 4,
    accepted: 2,
    underReview: 1,
    rejected: 1
  };

  const acceptanceRate = ((myCounts.accepted / myCounts.total) * 100).toFixed(1);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-1">
                Author Dashboard
              </h1>
              <p className="text-gray-600">
                {mockUser.name} • {mockUser.affiliation}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={handleRefresh}
                className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button 
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Submission
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab("overview")}
                className={`py-3 px-1 border-b-2 text-sm font-medium transition-colors ${
                  activeTab === "overview"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("submissions")}
                className={`py-3 px-1 border-b-2 text-sm font-medium transition-colors ${
                  activeTab === "submissions"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                }`}
              >
                My Submissions ({myCounts.total})
              </button>
            </nav>
          </div>
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Submissions"
                value={myCounts.total}
                icon={FileText}
              />
              <StatCard
                title="Accepted Papers"
                value={myCounts.accepted}
                icon={CheckCircle}
                subtitle={`${acceptanceRate}% acceptance rate`}
                trend={12}
              />
              <StatCard
                title="Under Review"
                value={myCounts.underReview}
                icon={Clock}
              />
              <StatCard
                title="Rejected"
                value={myCounts.rejected}
                icon={XCircle}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Submission Analytics */}
              <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 text-lg mb-6">Submission Status Distribution</h3>
                
                <div className="space-y-5">
                  {[
                    { 
                      label: "Accepted", 
                      value: myCounts.accepted, 
                      color: "bg-green-600"
                    },
                    { 
                      label: "Under Review", 
                      value: myCounts.underReview, 
                      color: "bg-yellow-500"
                    },
                    { 
                      label: "Rejected", 
                      value: myCounts.rejected, 
                      color: "bg-red-600"
                    },
                  ].map((item) => {
                    const percentage = (item.value / myCounts.total) * 100;
                    return (
                      <div key={item.label}>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">{item.label}</span>
                          <span className="text-sm font-semibold text-gray-900">
                            {item.value} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${item.color} transition-all duration-500`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-1">Performance Insight</p>
                      <p className="text-sm text-gray-600">
                        Your acceptance rate of {acceptanceRate}% is above the average for your research field. 
                        Continue focusing on high-quality submissions to maintain this performance.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 text-lg mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Paper Accepted</p>
                      <p className="text-xs text-gray-600 mt-0.5">ICRA 2024 • May 30, 2024</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">New Submission</p>
                      <p className="text-xs text-gray-600 mt-0.5">IEEE ICHI 2024 • Jun 20, 2024</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Paper Accepted</p>
                      <p className="text-xs text-gray-600 mt-0.5">ICCL 2024 • May 20, 2024</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Paper Rejected</p>
                      <p className="text-xs text-gray-600 mt-0.5">ICBT 2024 • Apr 15, 2024</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Open Call for Papers */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">Open Call for Papers</h2>
                  <p className="text-sm text-gray-600">Upcoming conferences accepting submissions</p>
                </div>
                <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
                  View All →
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockConferences.map((conference) => (
                  <ConferenceCard
                    key={conference.id}
                    conference={conference}
                    onClick={() => alert(`Submit to: ${conference.acronym}`)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SUBMISSIONS TAB */}
        {activeTab === "submissions" && (
          <div>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">My Submissions</h2>
                    <p className="text-sm text-gray-600 mt-1">Track and manage all your paper submissions</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search papers..."
                        className="pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <button className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </button>
                    <button className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-3">
                  {mockSubmissions.map((paper) => (
                    <SubmissionRow
                      key={paper.id}
                      paper={paper}
                      onView={() => alert(`View: ${paper.title}`)}
                      onEdit={() => alert(`Edit: ${paper.title}`)}
                    />
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200 flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Showing <span className="font-medium text-gray-900">{mockSubmissions.length}</span> of <span className="font-medium text-gray-900">{mockSubmissions.length}</span> submissions
                  </p>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50" disabled>
                      Previous
                    </button>
                    <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm font-medium">
                      1
                    </button>
                    <button className="px-3 py-1 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50" disabled>
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}