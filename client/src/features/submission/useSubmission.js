import { useEffect, useState } from "react";
import api from "../../lib/axios";

/**
 * Hook phục vụ luồng Author: nộp bài, xem bài của tôi, upload camera-ready.
 * Khớp với backend hiện tại:
 * - POST /submissions (FormData: title, abstract, track_id, conference_id, file[PDF])
 * - GET  /submissions/me
 * - GET  /conferences
 * - GET  /tracks/conferences/{conference_id}
 * - POST /camera-ready/upload (submission_id, file)
 */
export default function useSubmission() {
  const [mySubmissions, setMySubmissions] = useState([]);
  const [conferences, setConferences] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchConferences = async () => {
    const res = await api.get("/conferences");
    // API trả { conferences, total }
    return res.data?.conferences || [];
  };

  const fetchTracksByConference = async (conferenceId) => {
    if (!conferenceId) return [];
    const res = await api.get(`/tracks/conferences/${conferenceId}`);
    return res.data || [];
  };

  const fetchMySubmissions = async () => {
    const res = await api.get("/submissions/me");
    return res.data || [];
  };

  const submitPaper = async ({ title, abstract, trackId, conferenceId, file }) => {
    const form = new FormData();
    form.append("title", title);
    form.append("abstract", abstract);
    form.append("track_id", trackId);
    form.append("conference_id", conferenceId);
    form.append("file", file);
    const res = await api.post("/submissions/", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  };

  const uploadCameraReady = async ({ submissionId, file }) => {
    const form = new FormData();
    form.append("submission_id", submissionId);
    form.append("file", file);
    const res = await api.post("/camera-ready/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  };

  const loadInitial = async () => {
    setLoading(true);
    setError(null);
    try {
      const [conf, mine] = await Promise.all([
        fetchConferences(),
        fetchMySubmissions(),
      ]);
      setConferences(conf.filter((c) => c.is_open !== false));
      setMySubmissions(mine);
    } catch (err) {
      console.error("Load submission data error", err);
      setError(err?.response?.data?.detail || err.message || "Load data failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitial();
  }, []);

  return {
    loading,
    error,
    conferences,
    tracks,
    mySubmissions,
    setTracks,
    fetchTracksByConference,
    fetchMySubmissions: loadInitial,
    submitPaper,
    uploadCameraReady,
  };
}
