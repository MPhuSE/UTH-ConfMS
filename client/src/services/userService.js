import api from "../lib/axios";

/**
 * User Service
 * Handles all user management API calls
 */
export const userService = {
  /**
   * Get current user profile
   * @returns {Promise<Object>} User data
   */
  getMe: async () => {
    const res = await api.get("/users/me");
    return res.data;
  },

  /**
   * Update current user profile
   * @param {Object} payload - Profile update data
   * @returns {Promise<Object>} Updated user data
   */
  updateMe: async (payload) => {
    const res = await api.put("/users/me", payload);
    return res.data;
  },

  /**
   * Get all users (Admin only)
   * @param {Object} params - { skip, limit }
   * @returns {Promise<Object>} User list response
   */
  getAll: async (params = {}) => {
    const { skip = 0, limit = 100 } = params;
    const res = await api.get("/users", { params: { skip, limit } });
    return res.data;
  },

  /**
   * Get user by ID (Admin only)
   * @param {number} userId - User ID
   * @returns {Promise<Object>} User data
   */
  getById: async (userId) => {
    const res = await api.get(`/users/${userId}`);
    return res.data;
  },

  /**
   * Create new user (Admin only)
   * @param {Object} payload - User data
   * @returns {Promise<Object>} Created user
   */
  create: async (payload) => {
    const res = await api.post("/users", payload);
    return res.data;
  },

  /**
   * Update user (Admin only)
   * @param {number} userId - User ID
   * @param {Object} payload - Updated user data
   * @returns {Promise<Object>} Updated user
   */
  update: async (userId, payload) => {
    const res = await api.put(`/users/${userId}`, payload);
    return res.data;
  },

  /**
   * Delete user (Admin only)
   * @param {number} userId - User ID
   * @returns {Promise<void>}
   */
  delete: async (userId) => {
    await api.delete(`/users/${userId}`);
  },

  /**
   * Update user password
   * @param {number} userId - User ID
   * @param {Object} payload - { new_password }
   * @returns {Promise<void>}
   */
  updatePassword: async (userId, payload) => {
    await api.put(`/users/${userId}/password`, payload);
  },

  /**
   * Add role to user (Admin only)
   * @param {number} userId - User ID
   * @param {Object} payload - { role_id }
   * @returns {Promise<Object>} Updated user
   */
  addRole: async (userId, payload) => {
    const res = await api.put(`/users/${userId}/roles`, payload);
    return res.data;
  },

  /**
   * Remove role from user (Admin only)
   * @param {number} userId - User ID
   * @param {number} roleId - Role ID
   * @returns {Promise<Object>} Updated user
   */
  removeRole: async (userId, roleId) => {
    const res = await api.delete(`/users/${userId}/roles/${roleId}`);
    return res.data;
  },
};

export default userService;