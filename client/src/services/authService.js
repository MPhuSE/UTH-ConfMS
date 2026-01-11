import api from "../lib/axios";

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */
export const authService = {
  /**
   * Register a new user
   * @param {Object} payload - { full_name, email, password, passwordConfirmation }
   * @returns {Promise<Object>} Response message
   */
  register: async (payload) => {
    const body = {
      full_name: payload.full_name,
      email: payload.email,
      password: payload.password,
      passwordConfirmation: payload.passwordConfirmation,
    };
    const res = await api.post("/auth/register", body);
    return res.data;
  },

  /**
   * Login user
   * @param {Object} payload - { email, password }
   * @returns {Promise<Object>} Token response with access_token and refresh_token
   */
  login: async (payload) => {
    const res = await api.post("/auth/login", payload);
    return res.data;
  },

  /**
   * Refresh access token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object>} New token response
   */
  refresh: async (refreshToken) => {
    const res = await api.post("/auth/refresh", { refresh_token: refreshToken });
    return res.data;
  },

  /**
   * Verify email with token
   * @param {string} token - Verification token
   * @returns {Promise<Object>} Response message
   */
  verifyEmail: async (token) => {
    const res = await api.post("/auth/verify-email", { token });
    return res.data;
  },

  /**
   * Resend verification email
   * @param {string} email - User email
   * @returns {Promise<Object>} Response message
   */
  resendVerification: async (email) => {
    const res = await api.post("/auth/resend-verification", { email });
    return res.data;
  },

  /**
   * Request password reset
   * @param {string} email - User email
   * @returns {Promise<Object>} Response message
   */
  forgotPassword: async (email) => {
    const res = await api.post("/auth/forgot-password", { email });
    return res.data;
  },

  /**
   * Reset password with token
   * @param {Object} payload - { token, newPassword }
   * @returns {Promise<Object>} Response message
   */
  resetPasswordConfirm: async ({ token, newPassword }) => {
    const res = await api.post("/auth/reset-password-confirm", {
      token,
      new_password: newPassword,
    });
    return res.data;
  },

  /**
   * Create initial chair user
   * @param {Object} payload - { full_name, email, password }
   * @returns {Promise<Object>} User response
   */
  initialChairSetup: async (payload) => {
    const res = await api.post("/auth/initial-chair-setup", payload);
    return res.data;
  },
};

export default authService;