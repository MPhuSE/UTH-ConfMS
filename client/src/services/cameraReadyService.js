import api from "../lib/axios";

/**
 * Camera Ready Service
 * Handles camera-ready paper upload and retrieval
 */
export const cameraReadyService = {
  /**
   * Upload camera-ready version of a submission
   * @param {number} submissionId - Submission ID
   * @param {File} file - PDF file
   * @returns {Promise<Object>} Camera-ready response
   */
  upload: async (submissionId, file) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await api.post(
      `/camera-ready/upload?submission_id=${submissionId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return res.data;
  },

  /**
   * Get camera-ready file for a submission
   * @param {number} submissionId - Submission ID
   * @returns {Promise<Object>} Camera-ready data
   */
  getBySubmission: async (submissionId) => {
    const res = await api.get(`/camera-ready/submissions/${submissionId}`);
    return res.data;
  },
};

export default cameraReadyService;