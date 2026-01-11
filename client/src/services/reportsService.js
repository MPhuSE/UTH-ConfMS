import api from "../lib/axios";

/**
 * Reports Service
 * Handles analytics and reporting API calls (Admin/Chair only)
 */
export const reportsService = {
  /**
   * Get submissions by track statistics
   * @param {number} conferenceId - Conference ID
   * @returns {Promise<Object>} Submissions by track statistics
   */
  getSubmissionsByTrack: async (conferenceId) => {
    const res = await api.get(`/reports/conferences/${conferenceId}/submissions-by-track`);
    return res.data;
  },

  /**
   * Get review SLA statistics
   * @param {number} conferenceId - Conference ID
   * @returns {Promise<Object>} Review SLA statistics
   */
  getReviewSLA: async (conferenceId) => {
    const res = await api.get(`/reports/conferences/${conferenceId}/review-sla`);
    return res.data;
  },

  /**
   * Get activity logs for a conference
   * @param {number} conferenceId - Conference ID
   * @param {Object} params - { limit }
   * @returns {Promise<Object>} Activity logs
   */
  getActivityLogs: async (conferenceId, params = {}) => {
    const { limit = 100 } = params;
    const res = await api.get(`/reports/conferences/${conferenceId}/activity-logs`, {
      params: { limit },
    });
    return res.data;
  },

  /**
   * Get acceptance rate by school/affiliation
   * @param {number} conferenceId - Conference ID
   * @returns {Promise<Object>} Acceptance rate by school statistics
   */
  getAcceptanceRateBySchool: async (conferenceId) => {
    const res = await api.get(`/reports/conferences/${conferenceId}/acceptance-rate-by-school`);
    return res.data;
  },
};

export default reportsService;