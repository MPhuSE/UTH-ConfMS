import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { conferenceService } from "../../../services/conferenceService";
import { trackService } from "../../../services/trackService";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Globe,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  BookOpen,
  Camera,
  MessageSquare,
  Loader2,
} from "lucide-react";
import Button from "../../../components/Button";

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (error) {
    return dateString;
  }
};

const formatDateTime = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    return dateString;
  }
};

export default function ConferenceDetailPage() {
  const { conferenceId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [conference, setConference] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [tracksLoading, setTracksLoading] = useState(false);

  useEffect(() => {
    loadConference();
  }, [conferenceId]);

  const loadConference = async () => {
    try {
      setLoading(true);
      const data = await conferenceService.getById(conferenceId);
      console.log("Conference data loaded:", data);
      setConference(data);
      
      // Load tracks
      await loadTracks(conferenceId);
    } catch (err) {
      console.error("Error loading conference:", err);
      console.error("Error response:", err?.response?.data);
      const errorMsg = err?.response?.data?.detail || "Không thể tải thông tin hội nghị";
      toast.error(errorMsg);
      // Don't navigate away immediately, let user see the error
    } finally {
      setLoading(false);
    }
  };

  const loadTracks = async (confId) => {
    try {
      setTracksLoading(true);
      const tracksData = await trackService.getByConference(confId);
      setTracks(tracksData || []);
    } catch (err) {
      console.error("Error loading tracks:", err);
      // Don't show error for tracks, just log it
    } finally {
      setTracksLoading(false);
    }
  };

  const handleSubmitPaper = () => {
    navigate(`/dashboard/submission?confId=${conferenceId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (!conference) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Không tìm thấy hội nghị</p>
        </div>
      </div>
    );
  }

  const isCFPOpen = conference.is_open;
  const canSubmit = isCFPOpen && conference.submission_deadline && new Date(conference.submission_deadline) > new Date();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-teal-600 hover:text-teal-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {conference.name}
              </h1>
              {conference.abbreviation && (
                <p className="text-lg text-gray-600 mb-4">
                  {conference.abbreviation}
                </p>
              )}
              <div className="flex items-center gap-4 flex-wrap">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    isCFPOpen
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {isCFPOpen ? "Đang mở CFP" : "CFP đã đóng"}
                </span>
                {conference.blind_mode && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {conference.blind_mode === "double"
                      ? "Double Blind"
                      : conference.blind_mode === "single"
                      ? "Single Blind"
                      : "Open Review"}
                  </span>
                )}
              </div>
            </div>
            {canSubmit && (
              <Button onClick={handleSubmitPaper} className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Nộp bài
              </Button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            {conference.description && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-teal-600" />
                  Mô tả
                </h2>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {conference.description}
                </p>
              </div>
            )}

            {/* Important Dates */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-teal-600" />
                Thời gian quan trọng
              </h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Hạn nộp bài</p>
                    <p className="font-medium text-gray-900">
                      {formatDateTime(conference.submission_deadline)}
                    </p>
                    {conference.submission_deadline &&
                      new Date(conference.submission_deadline) < new Date() && (
                        <span className="text-xs text-red-600 mt-1 inline-block">
                          Đã hết hạn
                        </span>
                      )}
                  </div>
                </div>
                {conference.review_deadline && (
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Hạn phản biện</p>
                      <p className="font-medium text-gray-900">
                        {formatDateTime(conference.review_deadline)}
                      </p>
                    </div>
                  </div>
                )}
                {conference.start_date && (
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Ngày bắt đầu</p>
                      <p className="font-medium text-gray-900">
                        {formatDate(conference.start_date)}
                      </p>
                    </div>
                  </div>
                )}
                {conference.end_date && (
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Ngày kết thúc</p>
                      <p className="font-medium text-gray-900">
                        {formatDate(conference.end_date)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tracks */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-600" />
                Tracks / Chuyên đề
              </h2>
              {tracksLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
                </div>
              ) : tracks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {tracks.map((track) => (
                    <div
                      key={track.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-teal-300 transition-colors"
                    >
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {track.name}
                      </h3>
                      {track.max_reviewers && (
                        <p className="text-sm text-gray-500">
                          Tối đa {track.max_reviewers} reviewers
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">Chưa có tracks nào</p>
              )}
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Conference Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Thông tin hội nghị
              </h2>
              <div className="space-y-3">
                {conference.location && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Địa điểm</p>
                      <p className="text-gray-900">{conference.location}</p>
                    </div>
                  </div>
                )}
                {conference.website && (
                  <div className="flex items-start gap-2">
                    <Globe className="w-4 h-4 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Website</p>
                      <a
                        href={conference.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-600 hover:text-teal-700 hover:underline"
                      >
                        {conference.website}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Workflow Status */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Trạng thái Workflow
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">Camera-Ready</span>
                  </div>
                  {conference.camera_ready_open ? (
                    <span className="flex items-center gap-1 text-green-600 text-sm">
                      <CheckCircle className="w-4 h-4" />
                      Mở
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-gray-400 text-sm">
                      <XCircle className="w-4 h-4" />
                      Đóng
                    </span>
                  )}
                </div>
                {conference.camera_ready_deadline && conference.camera_ready_open && (
                  <p className="text-xs text-gray-500 ml-6">
                    Hạn: {formatDateTime(conference.camera_ready_deadline)}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">Rebuttal</span>
                  </div>
                  {conference.rebuttal_open ? (
                    <span className="flex items-center gap-1 text-green-600 text-sm">
                      <CheckCircle className="w-4 h-4" />
                      Mở
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-gray-400 text-sm">
                      <XCircle className="w-4 h-4" />
                      Đóng
                    </span>
                  )}
                </div>
                {conference.rebuttal_deadline && conference.rebuttal_open && (
                  <p className="text-xs text-gray-500 ml-6">
                    Hạn: {formatDateTime(conference.rebuttal_deadline)}
                  </p>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Thao tác nhanh
              </h2>
              <div className="space-y-2">
                <Button
                  variant="secondary"
                  onClick={() => navigate(`/dashboard/my-submissions?confId=${conferenceId}`)}
                  className="w-full justify-start"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Xem bài đã nộp
                </Button>
                {canSubmit && (
                  <Button
                    onClick={handleSubmitPaper}
                    className="w-full justify-start"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Nộp bài mới
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
