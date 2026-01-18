import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { submissionService, reviewService, conferenceService } from "../../../services";
import { toast } from "react-hot-toast";
import { BarChart3, TrendingUp, Clock, CheckCircle, XCircle, FileText, Users } from "lucide-react";

/**
 * Trang Monitor Review Progress với charts và statistics
 */
export default function ReviewProgressPage() {
  const { conferenceId } = useParams();
  const [submissions, setSubmissions] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [conference, setConference] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTrack, setSelectedTrack] = useState("all");

  useEffect(() => {
    if (conferenceId) {
      loadData();
    }
  }, [conferenceId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load conference
      const confData = await conferenceService.getById(conferenceId);
      setConference(confData);

      // Load submissions
      const subsData = await submissionService.getAll();
      const confSubs = subsData.filter(
        (s) => s.conference_id === parseInt(conferenceId)
      );
      setSubmissions(confSubs);

      // Load reviews for all submissions
      const allReviews = [];
      for (const sub of confSubs) {
        try {
          const reviewsData = await reviewService.getReviewsBySubmission(sub.id);
          if (Array.isArray(reviewsData)) {
            allReviews.push(...reviewsData);
          }
        } catch (error) {
          console.error(`Error loading reviews for submission ${sub.id}:`, error);
        }
      }
      setReviews(allReviews);

      // Load assignments
      const allAssignments = [];
      for (const sub of confSubs) {
        try {
          const assignsData = await reviewService.getAssignmentsBySubmission(sub.id);
          if (Array.isArray(assignsData)) {
            allAssignments.push(...assignsData);
          }
        } catch (error) {
          console.error(`Error loading assignments for submission ${sub.id}:`, error);
        }
      }
      setAssignments(allAssignments);
    } catch (error) {
      toast.error("Không thể tải dữ liệu");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubmissions = useMemo(() => {
    if (selectedTrack === "all") return submissions;
    return submissions.filter((s) => s.track_id === parseInt(selectedTrack));
  }, [submissions, selectedTrack]);

  const stats = useMemo(() => {
    const total = filteredSubmissions.length;
    const underReview = filteredSubmissions.filter(
      (s) => s.status === "under_review"
    ).length;
    const accepted = filteredSubmissions.filter(
      (s) => s.decision === "accepted" || s.status === "accepted"
    ).length;
    const rejected = filteredSubmissions.filter(
      (s) => s.decision === "rejected" || s.status === "rejected"
    ).length;
    const pending = filteredSubmissions.filter(
      (s) => s.status === "submitted" || s.status === "pending"
    ).length;

    const totalAssignments = assignments.filter((a) =>
      filteredSubmissions.some((s) => s.id === a.submission_id)
    ).length;
    const completedReviews = reviews.filter((r) =>
      filteredSubmissions.some((s) => s.id === r.submission_id) && r.submitted_at
    ).length;
    const pendingReviews = totalAssignments - completedReviews;

    const reviewProgress = totalAssignments > 0 
      ? Math.round((completedReviews / totalAssignments) * 100) 
      : 0;

    return {
      total,
      underReview,
      accepted,
      rejected,
      pending,
      totalAssignments,
      completedReviews,
      pendingReviews,
      reviewProgress,
    };
  }, [filteredSubmissions, assignments, reviews]);

  const trackStats = useMemo(() => {
    const tracks = {};
    filteredSubmissions.forEach((sub) => {
      const trackName = sub.track?.name || "No Track";
      if (!tracks[trackName]) {
        tracks[trackName] = {
          total: 0,
          underReview: 0,
          accepted: 0,
          rejected: 0,
          completedReviews: 0,
          totalAssignments: 0,
        };
      }
      tracks[trackName].total++;
      if (sub.status === "under_review") tracks[trackName].underReview++;
      if (sub.decision === "accepted" || sub.status === "accepted") tracks[trackName].accepted++;
      if (sub.decision === "rejected" || sub.status === "rejected") tracks[trackName].rejected++;
    });

    assignments.forEach((assign) => {
      const sub = filteredSubmissions.find((s) => s.id === assign.submission_id);
      if (sub) {
        const trackName = sub.track?.name || "No Track";
        if (tracks[trackName]) {
          tracks[trackName].totalAssignments++;
          if (reviews.some((r) => r.submission_id === assign.submission_id && r.reviewer_id === assign.reviewer_id && r.submitted_at)) {
            tracks[trackName].completedReviews++;
          }
        }
      }
    });

    return Object.entries(tracks).map(([name, data]) => ({
      name,
      ...data,
      progress: data.totalAssignments > 0 
        ? Math.round((data.completedReviews / data.totalAssignments) * 100) 
        : 0,
    }));
  }, [filteredSubmissions, assignments, reviews]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Monitor Review Progress</h1>
        <p className="mt-1 text-sm text-gray-500">
          {conference?.name || `Conference #${conferenceId}`}
        </p>
      </div>

      {/* Track Filter */}
      <div className="bg-white rounded-lg border p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Filter by Track
        </label>
        <select
          value={selectedTrack}
          onChange={(e) => setSelectedTrack(e.target.value)}
          className="w-full md:w-64 px-4 py-2 border rounded-lg"
        >
          <option value="all">All Tracks</option>
          {Array.from(new Set(submissions.map((s) => s.track?.name).filter(Boolean))).map(
            (trackName) => (
              <option key={trackName} value={trackName}>
                {trackName}
              </option>
            )
          )}
        </select>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Submissions"
          value={stats.total}
          icon={FileText}
          color="text-blue-600"
          bgColor="bg-blue-100"
        />
        <StatCard
          title="Under Review"
          value={stats.underReview}
          icon={Clock}
          color="text-yellow-600"
          bgColor="bg-yellow-100"
        />
        <StatCard
          title="Accepted"
          value={stats.accepted}
          icon={CheckCircle}
          color="text-green-600"
          bgColor="bg-green-100"
        />
        <StatCard
          title="Rejected"
          value={stats.rejected}
          icon={XCircle}
          color="text-red-600"
          bgColor="bg-red-100"
        />
      </div>

      {/* Review Progress Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="text-purple-600" size={24} />
            </div>
            <div>
              <div className="text-sm text-gray-500">Total Assignments</div>
              <div className="text-2xl font-semibold">{stats.totalAssignments}</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="text-green-600" size={24} />
            </div>
            <div>
              <div className="text-sm text-gray-500">Completed Reviews</div>
              <div className="text-2xl font-semibold">{stats.completedReviews}</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <TrendingUp className="text-orange-600" size={24} />
            </div>
            <div>
              <div className="text-sm text-gray-500">Review Progress</div>
              <div className="text-2xl font-semibold">{stats.reviewProgress}%</div>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-orange-600 h-2 rounded-full transition-all"
                style={{ width: `${stats.reviewProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Track-wise Statistics */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart3 size={20} />
          Statistics by Track
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 font-medium">Track</th>
                <th className="text-center p-3 font-medium">Total</th>
                <th className="text-center p-3 font-medium">Under Review</th>
                <th className="text-center p-3 font-medium">Accepted</th>
                <th className="text-center p-3 font-medium">Rejected</th>
                <th className="text-center p-3 font-medium">Review Progress</th>
              </tr>
            </thead>
            <tbody>
              {trackStats.map((track) => (
                <tr key={track.name} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium">{track.name}</td>
                  <td className="p-3 text-center">{track.total}</td>
                  <td className="p-3 text-center">{track.underReview}</td>
                  <td className="p-3 text-center text-green-600">{track.accepted}</td>
                  <td className="p-3 text-center text-red-600">{track.rejected}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${track.progress}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-12 text-right">{track.progress}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Timeline Chart (Simple Bar Chart) */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp size={20} />
          Review Completion Timeline
        </h2>
        <div className="h-64 flex items-end gap-2">
          {trackStats.map((track) => (
            <div key={track.name} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-blue-600 rounded-t transition-all hover:bg-blue-700"
                style={{ height: `${track.progress}%` }}
                title={`${track.name}: ${track.progress}%`}
              />
              <div className="mt-2 text-xs text-gray-600 text-center max-w-full truncate">
                {track.name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, bgColor }) {
  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-center gap-3">
        <div className={`p-3 ${bgColor} rounded-lg`}>
          <Icon className={color} size={24} />
        </div>
        <div>
          <div className="text-sm text-gray-500">{title}</div>
          <div className={`text-2xl font-semibold ${color}`}>{value}</div>
        </div>
      </div>
    </div>
  );
}
