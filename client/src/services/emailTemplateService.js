import api from "../lib/axios";

/**
 * Email Template Service
 * Handles email template management (Admin/Chair only)
 */
export const emailTemplateService = {
  /**
   * Create email template
   * @param {Object} payload - { conference_id, name, subject, body }
   * @returns {Promise<Object>} Created template
   */
  create: async (payload) => {
    const res = await api.post("/email-templates", payload);
    return res.data;
  },

  /**
   * Get email template by ID
   * @param {number} templateId - Template ID
   * @returns {Promise<Object>} Template data
   */
  getById: async (templateId) => {
    const res = await api.get(`/email-templates/${templateId}`);
    return res.data;
  },

  /**
   * Get templates by conference
   * @param {number} conferenceId - Conference ID
   * @returns {Promise<Array>} List of templates
   */
  getByConference: async (conferenceId) => {
    const res = await api.get(`/email-templates/conferences/${conferenceId}`);
    return res.data;
  },

  /**
   * Update email template
   * @param {number} templateId - Template ID
   * @param {Object} payload - Updated template data
   * @returns {Promise<Object>} Updated template
   */
  update: async (templateId, payload) => {
    const res = await api.put(`/email-templates/${templateId}`, payload);
    return res.data;
  },

  /**
   * Delete email template
   * @param {number} templateId - Template ID
   * @returns {Promise<void>}
   */
  delete: async (templateId) => {
    await api.delete(`/email-templates/${templateId}`);
  },
};

export default emailTemplateService;