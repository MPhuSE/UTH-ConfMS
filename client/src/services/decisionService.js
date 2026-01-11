import api from "../lib/axios";

/**
 * Decision Service
 * Handles all decision-related API calls (Admin/Chair only)
 */
export const decisionService = {
  /**
   * Make a decision on a submission
   * @param {Object} payload - { submission_id, decision, decision_notes }
   * @returns {Promise<Object>} Decision response
   */
  makeDecision: async (payload) => {
    const res = await api.post("/decisions", payload);
    return res.data;
  },

  /**
   * Get decisions by conference
   * @param {number} conferenceId - Conference ID
   * @returns {Promise<Array>} List of decisions
   */
  getDecisionsByConference: async (conferenceId) => {
    const res = await api.get(`/decisions/conferences/${conferenceId}`);
    return res.data;
  },

  /**
   * Get decision statistics for a conference
   * @param {number} conferenceId - Conference ID
   * @returns {Promise<Object>} Decision statistics
   */
  getDecisionStatistics: async (conferenceId) => {
    const res = await api.get(`/decisions/conferences/${conferenceId}/statistics`);
    return res.data;
  },
};

export default decisionService;