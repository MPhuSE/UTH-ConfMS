import api from "../lib/axios";

/**
 * Conference Service
 * Handles all conference-related API calls
 */
export const conferenceService = {
  /**
   * Create a new conference
   * @param {Object} payload - Conference data
   * @returns {Promise<Object>} Created conference
   */
  create: async (payload) => {
    const res = await api.post("/conferences", payload);
    return res.data;
  },

  /**
   * Get all conferences with pagination
   * @param {Object} params - { skip, limit }
   * @returns {Promise<Object>} Conference list response
   */
  getAll: async (params = {}) => {
    const { skip = 0, limit = 100 } = params;
    const res = await api.get("/conferences", { params: { skip, limit } });
    return res.data;
  },

  /**
   * Get conference by ID
   * @param {number} conferenceId - Conference ID
   * @returns {Promise<Object>} Conference data
   */
  getById: async (conferenceId) => {
    const res = await api.get(`/conferences/${conferenceId}`);
    return res.data;
  },

  /**
   * Update conference by ID
   * @param {number} conferenceId - Conference ID
   * @param {Object} payload - Updated conference data
   * @returns {Promise<Object>} Updated conference
   */
  update: async (conferenceId, payload) => {
    const res = await api.put(`/conferences/${conferenceId}`, payload);
    return res.data;
  },

  /**
   * Delete conference by ID
   * @param {number} conferenceId - Conference ID
   * @returns {Promise<Object>} Success message
   */
  delete: async (conferenceId) => {
    const res = await api.delete(`/conferences/${conferenceId}`);
    return res.data;
  },

  /**
   * Update CFP content (Call for Papers)
   * @param {number} conferenceId - Conference ID
   * @param {Object} payload - { description, submission_deadline }
   * @returns {Promise<Object>} Success message
   */
  updateCFP: async (conferenceId, payload) => {
    const res = await api.put(`/conferences/${conferenceId}/cfp`, payload);
    return res.data;
  },

  /**
   * Get public CFP information
   * @param {number} conferenceId - Conference ID
   * @returns {Promise<Object>} Public CFP data
   */
  getPublicCFP: async (conferenceId) => {
    const res = await api.get(`/conferences/${conferenceId}/cfp/public`);
    return res.data;
  },

  /**
   * Update workflow settings (rebuttal, camera-ready)
   * @param {number} conferenceId - Conference ID
   * @param {Object} payload - { rebuttal_open, rebuttal_deadline, camera_ready_open, camera_ready_deadline }
   * @returns {Promise<Object>} Updated workflow settings
   */
  updateWorkflow: async (conferenceId, payload) => {
    const res = await api.patch(`/conferences/${conferenceId}/workflow`, payload);
    return res.data;
  },
};

export default conferenceService;