import axios from "axios";

const BASE_URL = "http://localhost:8000/";

// Client chính
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: false,
  timeout: 10000,
});

// Client riêng để refresh token, tránh loop interceptor
const refreshClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: false,
  timeout: 10000,
});

// --- REQUEST INTERCEPTOR: gắn Access Token ---
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  const tenantSlug = localStorage.getItem("tenant_slug");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (tenantSlug) {
    config.headers["X-Tenant-Slug"] = tenantSlug;
  }

  return config;
});

// --- RESPONSE INTERCEPTOR: tự động refresh ---
let isRefreshing = false;
let refreshPromise = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // 401 -> thử refresh (chỉ 1 lần)
    if (status === 401 && !originalRequest._retry) {
      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) {
        return Promise.reject(error);
      }

      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = refreshClient
          .post("/auth/refresh", { refresh_token: refreshToken })
          .then((res) => {
            const { access_token, refresh_token } = res.data || {};
            if (access_token) localStorage.setItem("access_token", access_token);
            if (refresh_token) localStorage.setItem("refresh_token", refresh_token);
            return access_token;
          })
          .catch((refreshErr) => {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            return Promise.reject(refreshErr);
          })
          .finally(() => {
            isRefreshing = false;
          });
      }

      try {
        const newAccessToken = await refreshPromise;
        if (newAccessToken) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          originalRequest._retry = true;
          return api(originalRequest);
        }
      } catch (refreshErr) {
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

export default api;