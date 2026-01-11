import api from "../lib/axios";

/**
 * Admin Service
 * Handles all admin-related API calls (Admin only)
 */
export const adminService = {
  /**
   * Get SMTP configuration
   * @returns {Promise<Object>} SMTP config
   */
  getSMTPConfig: async () => {
    const res = await api.get("/admin/smtp-config");
    return res.data;
  },

  /**
   * Update SMTP configuration
   * @param {Object} payload - SMTP config data
   * @returns {Promise<Object>} Updated SMTP config
   */
  updateSMTPConfig: async (payload) => {
    const res = await api.put("/admin/smtp-config", payload);
    return res.data;
  },

  /**
   * Get quota configuration
   * @returns {Promise<Object>} Quota config
   */
  getQuotas: async () => {
    const res = await api.get("/admin/quotas");
    return res.data;
  },

  /**
   * Update quota configuration
   * @param {Object} payload - Quota config data
   * @returns {Promise<Object>} Updated quota config
   */
  updateQuotas: async (payload) => {
    const res = await api.put("/admin/quotas", payload);
    return res.data;
  },

  /**
   * Get system health status
   * @returns {Promise<Object>} System health data
   */
  getSystemHealth: async () => {
    const res = await api.get("/admin/system-health");
    return res.data;
  },
};

export default adminService;