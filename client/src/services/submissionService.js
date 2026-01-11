import api from "../lib/axios";

/**
 * Submission Service
 * Handles all submission-related API calls
 */
export const submissionService = {
  /**
   * Submit a paper (with file upload)
   * @param {FormData} formData - FormData with title, abstract, track_id, conference_id, file
   * @returns {Promise<Object>} Created submission
   */
  submit: async (formData) => {
    const res = await api.post("/submissions/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },

  /**
   * Get all submissions
   * @returns {Promise<Array>} List of submissions
   */
  getAll: async () => {
    const res = await api.get("/submissions/");
    return res.data;
  },

  /**
   * Get current user's submissions
   * @returns {Promise<Array>} List of user's submissions
   */
  getMySubmissions: async () => {
    const res = await api.get("/submissions/me");
    return res.data;
  },

  /**
   * Get submission by ID
   * @param {number} submissionId - Submission ID
   * @returns {Promise<Object>} Submission data
   */
  getById: async (submissionId) => {
    const res = await api.get(`/submissions/${submissionId}`);
    return res.data;
  },

  /**
   * Update submission
   * @param {number} submissionId - Submission ID
   * @param {Object} payload - Updated submission data
   * @returns {Promise<Object>} Updated submission
   */
  update: async (submissionId, payload) => {
    const res = await api.patch(`/submissions/${submissionId}`, payload);
    return res.data;
  },

  /**
   * Delete submission
   * @param {number} submissionId - Submission ID
   * @returns {Promise<Object>} Success message
   */
  delete: async (submissionId) => {
    const res = await api.delete(`/submissions/${submissionId}`);
    return res.data;
  },
};

export default submissionService;