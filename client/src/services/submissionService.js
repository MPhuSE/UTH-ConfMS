import api from "../lib/axios";

export const submissionService = {
  // Gửi bài mới
  submit: async (formData) => {
    const res = await api.post("/submissions/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  // Lấy danh sách bài nộp của chính mình (Author)
  getMySubmissions: async () => {
    const res = await api.get("/submissions/me");
    return res.data;
  },

  // Lấy toàn bộ bài nộp (Chair/Admin)
  getAllSubmissions: async () => {
    const res = await api.get("/submissions");
    return res.data;
  },

  // Lấy danh sách bài được phân công (Reviewer)
  getAssignedReviews: async () => {
    const res = await api.get("/reviews/assigned");
    return res.data;
  },

  // Lấy danh sách hội nghị
  getConferences: async () => {
    const res = await api.get("/conferences");
    return res.data;
  },

  // Các hàm cũ của bạn...
  getById: async (id) => {
    const res = await api.get(`/submissions/${id}`);
    return res.data;
  },
  
  update: async (id, formData) => {
    const res = await api.patch(`/submissions/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  delete: async (id) => {
    const res = await api.delete(`/submissions/${id}`);
    return res.data;
  }
};

export default submissionService;