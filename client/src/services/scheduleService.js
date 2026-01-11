import api from "../lib/axios";

/**
 * Schedule Service
 * Handles schedule management API calls (Admin/Chair only)
 */
export const scheduleService = {
  /**
   * Create schedule item
   * @param {Object} payload - Schedule item data
   * @returns {Promise<Object>} Created schedule item
   */
  create: async (payload) => {
    const res = await api.post("/schedule", payload);
    return res.data;
  },

  /**
   * Get schedule by conference
   * @param {number} conferenceId - Conference ID
   * @returns {Promise<Array>} List of schedule items
   */
  getByConference: async (conferenceId) => {
    const res = await api.get(`/schedule/conferences/${conferenceId}`);
    return res.data;
  },

  /**
   * Update schedule item
   * @param {number} itemId - Schedule item ID
   * @param {Object} payload - Updated schedule item data
   * @returns {Promise<Object>} Updated schedule item
   */
  update: async (itemId, payload) => {
    const res = await api.put(`/schedule/${itemId}`, payload);
    return res.data;
  },

  /**
   * Delete schedule item
   * @param {number} itemId - Schedule item ID
   * @returns {Promise<void>}
   */
  delete: async (itemId) => {
    await api.delete(`/schedule/${itemId}`);
  },
};

export default scheduleService;