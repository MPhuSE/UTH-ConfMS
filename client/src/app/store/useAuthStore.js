import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../../lib/axios";
import { authService } from "../../services/authService";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: localStorage.getItem("access_token"),
      refreshToken: localStorage.getItem("refresh_token"),
      role: localStorage.getItem("role"),
      isAuthenticated: !!localStorage.getItem("access_token"),
      isCheckingAuth: false,
      isLoading: false,

      setAuthState: ({ user, access_token, refresh_token }) => {
        const role = user?.role_names?.[0] || user?.roles?.[0] || null;
        if (access_token) localStorage.setItem("access_token", access_token);
        if (refresh_token) localStorage.setItem("refresh_token", refresh_token);
        if (role) localStorage.setItem("role", role);
        set({
          user,
          token: access_token || get().token,
          refreshToken: refresh_token || get().refreshToken,
          role,
          isAuthenticated: !!access_token,
        });
      },

      checkAuth: async () => {
        const token = localStorage.getItem("access_token");
        if (!token) {
          set({
            user: null,
            isAuthenticated: false,
            isCheckingAuth: false,
          });
          return;
        }

        // Nếu đã có user trong state thì bỏ qua
        if (get().user) return;

        set({ isCheckingAuth: true });
        try {
          const user = await authService.getProfile();
          const role = user?.role_names?.[0] || user?.roles?.[0] || null;
          if (role) localStorage.setItem("role", role);
          set({
            user,
            role,
            isAuthenticated: true,
          });
        } catch {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("role");
          set({
            user: null,
            isAuthenticated: false,
          });
        } finally {
          set({ isCheckingAuth: false });
        }
      },

      login: async (data) => {
        set({ isLoading: true });
        const res = await authService.login(data);
        const { access_token, refresh_token, user } = res;
        get().setAuthState({ user, access_token, refresh_token });
        set({ isLoading: false });
        return user;
      },

      signup: async (userData) => {
        set({ isLoading: true });
        const res = await authService.register(userData);
        set({ isLoading: false });
        return res;
      },

      refreshTokens: async () => {
        const refreshToken = localStorage.getItem("refresh_token");
        if (!refreshToken) return null;
        const res = await authService.refresh(refreshToken);
        const { access_token, refresh_token } = res;
        if (access_token) localStorage.setItem("access_token", access_token);
        if (refresh_token) localStorage.setItem("refresh_token", refresh_token);
        set({ token: access_token, refreshToken: refresh_token, isAuthenticated: true });
        return access_token;
      },

      verifyEmail: async (tokenValue) => {
        set({ isLoading: true });
        const res = await authService.verifyEmail(tokenValue);
        set({ isLoading: false });
        return res;
      },

      resendVerification: async (email) => {
        set({ isLoading: true });
        const res = await authService.resendVerification(email);
        set({ isLoading: false });
        return res;
      },

      forgotPassword: async (email) => {
        set({ isLoading: true });
        const res = await authService.forgotPassword(email);
        set({ isLoading: false });
        return res;
      },

      resetPasswordConfirm: async (token, newPassword) => {
        set({ isLoading: true });
        const res = await authService.resetPasswordConfirm({ token, newPassword });
        set({ isLoading: false });
        return res;
      },

      updateProfile: async (data) => {
        set({ isLoading: true });
        const res = await api.put("/users/me", data);
        set({ user: res.data, isLoading: false });
        return res.data;
      },

      logout: () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("role");
        set({ user: null, token: null, refreshToken: null, role: null, isAuthenticated: false });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user, role: state.role }),
    }
  )
);

export default useAuthStore;