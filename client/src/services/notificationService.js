import api from "../lib/axios";

/**
 * Notification Service
 * Handles notification-related API calls (Admin/Chair only)
 */
export const notificationService = {
  /**
   * Send result notification for a submission
   * @param {number} submissionId - Submission ID
   * @param {Object} params - { hide_reviewer }
   * @returns {Promise<Object>} Success message
   */
  sendResult: async (submissionId, params = {}) => {
    const { hide_reviewer = true } = params;
    const res = await api.post(`/notifications/send-result/${submissionId}`, null, {
      params: { hide_reviewer },
    });
    return res.data;
  },
};

export default notificationService;