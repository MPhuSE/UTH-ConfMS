import api from "../lib/axios";

/**
 * Track Service
 * Handles all track-related API calls
 */
export const trackService = {
  /**
   * Create a new track (Admin/Chair only)
   * @param {Object} payload - { conference_id, name, max_reviewers }
   * @returns {Promise<Object>} Created track
   */
  create: async (payload) => {
    const res = await api.post("/tracks", payload);
    return res.data;
  },

  /**
   * Get track by ID
   * @param {number} trackId - Track ID
   * @returns {Promise<Object>} Track data
   */
  getById: async (trackId) => {
    const res = await api.get(`/tracks/${trackId}`);
    return res.data;
  },

  /**
   * Get tracks by conference
   * @param {number} conferenceId - Conference ID
   * @returns {Promise<Array>} List of tracks
   */
  getByConference: async (conferenceId) => {
    const res = await api.get(`/tracks/conferences/${conferenceId}`);
    return res.data;
  },

  /**
   * Update track (Admin/Chair only)
   * @param {number} trackId - Track ID
   * @param {Object} payload - Updated track data
   * @returns {Promise<Object>} Updated track
   */
  update: async (trackId, payload) => {
    const res = await api.put(`/tracks/${trackId}`, payload);
    return res.data;
  },

  /**
   * Delete track (Admin/Chair only)
   * @param {number} trackId - Track ID
   * @returns {Promise<void>}
   */
  delete: async (trackId) => {
    await api.delete(`/tracks/${trackId}`);
  },
};

export default trackService;