import api from "../lib/axios";

/**
 * Audit Log Service
 * Handles all audit log-related API calls (Admin only)
 */
export const auditLogService = {
  /**
   * Create audit log
   * @param {Object} payload - Audit log data
   * @returns {Promise<Object>} Created audit log
   */
  create: async (payload) => {
    const res = await api.post("/audit-logs", payload);
    return res.data;
  },

  /**
   * Get audit logs with filters
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Audit log list response
   */
  getAll: async (params = {}) => {
    const {
      skip = 0,
      limit = 100,
      user_id,
      action_type,
      resource_type,
      resource_id,
      start_date,
      end_date,
    } = params;

    const queryParams = {
      skip,
      limit,
      ...(user_id && { user_id }),
      ...(action_type && { action_type }),
      ...(resource_type && { resource_type }),
      ...(resource_id && { resource_id }),
      ...(start_date && { start_date }),
      ...(end_date && { end_date }),
    };

    const res = await api.get("/audit-logs", { params: queryParams });
    return res.data;
  },

  /**
   * Get audit log by ID
   * @param {number} auditLogId - Audit log ID
   * @returns {Promise<Object>} Audit log data
   */
  getById: async (auditLogId) => {
    const res = await api.get(`/audit-logs/${auditLogId}`);
    return res.data;
  },
};

export default auditLogService;