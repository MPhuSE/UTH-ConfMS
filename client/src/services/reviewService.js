import api from "../lib/axios";

/**
 * Review Service
 * Handles all review-related API calls
 */
export const reviewService = {
  /**
   * Assign reviewer to submission (Admin/Chair only)
   * @param {Object} payload - { submission_id, reviewer_id, auto_assigned }
   * @returns {Promise<Object>} Assignment response
   */
  assignReviewer: async (payload) => {
    const res = await api.post("/reviews/assignments", payload);
    return res.data;
  },

  /**
   * Unassign reviewer from submission
   * @param {number} submissionId - Submission ID
   * @param {number} reviewerId - Reviewer ID
   * @returns {Promise<void>}
   */
  unassignReviewer: async (submissionId, reviewerId) => {
    await api.delete(`/reviews/assignments/${submissionId}/${reviewerId}`);
  },

  /**
   * Get assignments by submission
   * @param {number} submissionId - Submission ID
   * @returns {Promise<Array>} List of assignments
   */
  getAssignmentsBySubmission: async (submissionId) => {
    const res = await api.get(`/reviews/assignments/submissions/${submissionId}`);
    return res.data;
  },

  /**
   * Get assignments by reviewer
   * @param {number} reviewerId - Reviewer ID
   * @returns {Promise<Array>} List of assignments
   */
  getAssignmentsByReviewer: async (reviewerId) => {
    const res = await api.get(`/reviews/assignments/reviewers/${reviewerId}`);
    return res.data;
  },

  /**
   * Submit a review (Reviewer only)
   * @param {number} submissionId - Submission ID
   * @param {Object} payload - Review data
   * @returns {Promise<Object>} Review response
   */
  submitReview: async (submissionId, payload) => {
    const res = await api.post(`/reviews/submit/${submissionId}`, payload);
    return res.data;
  },

  /**
   * Get reviews by submission
   * @param {number} submissionId - Submission ID
   * @returns {Promise<Array>} List of reviews
   */
  getReviewsBySubmission: async (submissionId) => {
    const res = await api.get(`/reviews/submissions/${submissionId}`);
    return res.data;
  },

  /**
   * Get specific review
   * @param {number} submissionId - Submission ID
   * @param {number} reviewerId - Reviewer ID
   * @returns {Promise<Object>} Review data
   */
  getReview: async (submissionId, reviewerId) => {
    const res = await api.get(`/reviews/submissions/${submissionId}/reviewers/${reviewerId}`);
    return res.data;
  },

  /**
   * Declare conflict of interest
   * @param {Object} payload - { submission_id, user_id, coi_type }
   * @returns {Promise<Object>} COI response
   */
  declareCOI: async (payload) => {
    const res = await api.post("/reviews/coi", payload);
    return res.data;
  },

  /**
   * Get COIs by submission
   * @param {number} submissionId - Submission ID
   * @returns {Promise<Array>} List of COIs
   */
  getCOIsBySubmission: async (submissionId) => {
    const res = await api.get(`/reviews/coi/submissions/${submissionId}`);
    return res.data;
  },

  /**
   * Place a bid on a submission
   * @param {Object} payload - { submission_id, reviewer_id, bid }
   * @returns {Promise<Object>} Bid response
   */
  placeBid: async (payload) => {
    const res = await api.post("/reviews/bids", payload);
    return res.data;
  },

  /**
   * Get bids by reviewer
   * @param {number} reviewerId - Reviewer ID
   * @returns {Promise<Array>} List of bids
   */
  getBidsByReviewer: async (reviewerId) => {
    const res = await api.get(`/reviews/bids/reviewers/${reviewerId}`);
    return res.data;
  },
};

export default reviewService;