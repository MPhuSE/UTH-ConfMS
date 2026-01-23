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

  // Backward compatible alias (many Chair/Reviewer pages call getAll)
  getAll: async () => {
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
    const res = await api.patch(`/submissions/${id}/`, formData, {
        headers: { 
            "Content-Type": "multipart/form-data" 
        },
    });
    return res.data;
},

  delete: async (id) => {
    const res = await api.delete(`/submissions/${id}`);
    return res.data;
  },

  // Download PDF file
  downloadPdf: async (id) => {
    try {
      // Lấy download URL từ backend (với redirect=false để nhận JSON)
      const res = await api.get(`/submissions/${id}/download?redirect=false`);
      const { download_url } = res.data;
      
      if (download_url) {
        // Mở URL trong tab mới để download
        window.open(download_url, '_blank');
      } else {
        throw new Error('No download URL returned');
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      // Fallback: mở trực tiếp endpoint (backend sẽ redirect)
      const baseURL = api.defaults.baseURL || window.location.origin.replace(':5173', ':8000').replace(':5174', ':8000');
      window.open(`${baseURL}/submissions/${id}/download`, '_blank');
    }
  },

  // Get download URL (helper function)
  getDownloadUrl: (id) => {
    const baseURL = api.defaults.baseURL || window.location.origin.replace(':5173', ':8000').replace(':5174', ':8000');
    return `${baseURL}/submissions/${id}/download`;
  }
};

export default submissionService;