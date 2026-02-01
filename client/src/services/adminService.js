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

  updateSMTPConfig: async (payload) => {
    const res = await api.put("/admin/smtp-config", payload);
    return res.data;
  },

  testSMTPConfig: async (payload) => {
    const res = await api.post("/admin/smtp-config/test", payload); // I might need to add this endpoint
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

  /**
   * Tenancy management
   */
  getTenants: async () => {
    const res = await api.get("/tenants");
    return res.data;
  },
  createTenant: async (payload) => {
    const res = await api.post("/tenants", payload);
    return res.data;
  },
  updateTenant: async (tenantId, payload) => {
    const res = await api.put(`/tenants/${tenantId}`, payload);
    return res.data;
  },
  deleteTenant: async (tenantId) => {
    await api.delete(`/tenants/${tenantId}`);
  },
};

export default adminService;