import api from "../lib/axios";

export const submissionService = {
  // Gửi bài mới (Multipart cho file + JSON cho authors)
  submit: async (formData) => {
    const res = await api.post("/submissions/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  // Cập nhật bài viết (Sử dụng PATCH hoặc PUT tùy Backend)
  update: async (id, formData) => {
    const res = await api.patch(`/submissions/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  // Xóa bài viết
  delete: async (id) => {
    const res = await api.delete(`/submissions/${id}`);
    return res.data;
  },

  getById: async (id) => {
    const res = await api.get(`/submissions/${id}`);
    return res.data;
  },

  // LẤY DỮ LIỆU THỰC TẾ TỪ API
  getTracksByConference: async (confId) => {
    const res = await api.get(`/tracks/conferences/${confId}`);
    return res.data;
  },

  getTopicsByTrack: async (trackId) => {
    // Lưu ý: Kiểm tra lại endpoint này trên Swagger của bạn
    const res = await api.get(`/topics/tracks/${trackId}`);
    return res.data;
  }
};

export default submissionService;