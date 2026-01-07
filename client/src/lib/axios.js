import axios from "axios";

const api = axios.create({
<<<<<<< HEAD
  baseURL: "http://127.0.0.1:8000/",
  withCredentials: false,
  timeout: 5000,
=======
  baseURL: "http://localhost:8000",
  withCredentials: true, 
>>>>>>> 996ccfa (: add rebuttal)
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token"); 
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("Phiên đăng nhập hết hạn hoặc chưa đăng nhập.");
    }
    return Promise.reject(error);
  }
);

export default api;