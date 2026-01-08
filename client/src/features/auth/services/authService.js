import api from "../../../lib/axios";

export const authService = {
  login: async (payload) => {
    // payload: { email, password }
    const res = await api.post("/auth/login", payload);
    return res.data;
  },

  register: async (payload) => {
    // backend expect passwordConfirmation alias
    const body = {
      full_name: payload.full_name,
      email: payload.email,
      password: payload.password,
      passwordConfirmation: payload.passwordConfirmation,
    };
    const res = await api.post("/auth/register", body);
    return res.data;
  },

  refresh: async (refresh_token) => {
    const res = await api.post("/auth/refresh", { refresh_token });
    return res.data;
  },

  getProfile: async () => {
    const res = await api.get("/users/me");
    return res.data;
  },

  verifyEmail: async (token) => {
    const res = await api.post("/auth/verify-email", { token });
    return res.data;
  },

  resendVerification: async (email) => {
    const res = await api.post("/auth/resend-verification", { email });
    return res.data;
  },

  forgotPassword: async (email) => {
    const res = await api.post("/auth/forgot-password", { email });
    return res.data;
  },

  resetPasswordConfirm: async ({ token, newPassword }) => {
    const res = await api.post("/auth/reset-password-confirm", {
      token,
      new_password: newPassword,
    });
    return res.data;
  },
};

export default authService;
