import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../../lib/axios";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: localStorage.getItem("access_token"),
      role: localStorage.getItem("role"),
      isAuthenticated: !!localStorage.getItem("access_token"),
      isCheckingAuth: false,
      isLoading: false,

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

  if (get().user) return;

  set({ isCheckingAuth: true });

  try {
    const res = await api.get("/users/me");
    set({
      user: res.data,
      isAuthenticated: true,
    });
  } catch {
    localStorage.removeItem("access_token");
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
        const res = await api.post("/auth/login", data);
        const { access_token, user } = res.data;
        const role = user.role_names?.[0]; 
        localStorage.setItem("access_token", access_token);
        localStorage.setItem("role", role);

      set({
        user,
        token: access_token,
        role,
        isAuthenticated: true,
        isLoading: false,
      } );

      return user;
  },

      signup: async (userData) => {
        set({ isLoading: true });
        const res = await api.post("/auth/register", userData);
        set({ isLoading: false });
        return res.data;
      },

      verifyEmail: async (tokenValue) => {
        set({ isLoading: true });
        const res = await api.post("/auth/verify-email", { token: tokenValue });
        set({ isLoading: false });
        return res.data;
      },

      forgotPassword: async (email) => {
        set({ isLoading: true });
        const res = await api.post("/auth/forgot-password", { email });
        set({ isLoading: false }); 
        return res.data;
      },

      resetPasswordConfirm: async (token, newPassword) => {
        set({ isLoading: true });
        const res = await api.post("/auth/reset-password-confirm", {
          token,
          new_password: newPassword,
        });
        set({ isLoading: false });
        return res.data;
      },
      updateProfile : async (data) => {
        set({ isLoading: true });
        const res = await api.put("/users/me", data);
        set({ isLoading: false });
        return res.data;
      },

      logout: () => {
        localStorage.removeItem("access_token");
        set({ user: null });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user }),
    }
  )
);
