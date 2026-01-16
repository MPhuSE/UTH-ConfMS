import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { submissionService } from '../../services/submissionService';

export const useSubmissionStore = create(
  persist(
    (set, get) => ({
      // --- STATE ---
      submissions: [],        // Bài nộp của cá nhân (Author)
      allSubmissions: [],     // Toàn bộ bài nộp (Admin/Chair)
      currentSubmission: null, // Bài nộp đang xem chi tiết/chỉnh sửa
      conferences: [],        // Danh sách hội nghị đang mở
      assignedReviews: [],    // Bài nộp được giao (Reviewer)
      isLoading: false,
      error: null,

      // --- ACTIONS ---

      // 1. Tải dữ liệu Dashboard tùy theo vai trò
      fetchDashboardData: async (role) => {
        set({ isLoading: true, error: null });
        try {
          const confData = await submissionService.getConferences();
          const openConferences = (confData?.conferences || []).filter(c => c.is_open);

          let newState = { 
            conferences: openConferences,
            isLoading: false 
          };

          switch (role) {
            case 'author':
              const mySubs = await submissionService.getMySubmissions();
              newState.submissions = Array.isArray(mySubs) ? mySubs : [];
              break;
            case 'reviewer':
              const assigned = await submissionService.getAssignedReviews();
              newState.assignedReviews = Array.isArray(assigned) ? assigned : [];
              break;
            case 'chair':
            case 'admin':
              const totalSubs = await submissionService.getAllSubmissions();
              newState.allSubmissions = Array.isArray(totalSubs) ? totalSubs : [];
              break;
            default:
              const defaultSubs = await submissionService.getMySubmissions();
              newState.submissions = Array.isArray(defaultSubs) ? defaultSubs : [];
          }
          set(newState);
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error.response?.data?.detail || 'Lỗi tải dữ liệu dashboard' 
          });
        }
      },

      // 2. Lấy chi tiết bài nộp theo ID
      fetchSubmissionById: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const res = await submissionService.getById(id);
          // Xử lý dữ liệu linh hoạt (đề phòng API trả về mảng hoặc object)
          let data = res.data ? (Array.isArray(res.data) ? res.data[0] : res.data) : res;

          if (!data) throw new Error("Không tìm thấy dữ liệu bài báo");
          set({ currentSubmission: data, isLoading: false });
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error.response?.data?.detail || error.message || 'Lỗi tải bài báo' 
          });
        }
      },

      // 3. Cập nhật bài nộp (Hàm cực kỳ quan trọng)
      updateSubmission: async (id, formData) => {
        set({ isLoading: true, error: null });
        try {
          // Gửi PATCH request với FormData (chứa title, abstract, file)
          const res = await submissionService.update(id, formData);
          const updatedData = res.data || res;

          set((state) => ({
            isLoading: false,
            // Cập nhật real-time vào danh sách hiện tại mà không cần reload
            submissions: state.submissions.map(s => s.id === parseInt(id) ? updatedData : s),
            allSubmissions: state.allSubmissions.map(s => s.id === parseInt(id) ? updatedData : s),
            currentSubmission: updatedData
          }));
          return true;
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error.response?.data?.detail || "Lỗi cập nhật bài viết" 
          });
          return false;
        }
      },

      // 4. Xóa bài / Rút bài vĩnh viễn
      deleteSubmission: async (id) => {
        set({ isLoading: true });
        try {
          await submissionService.delete(id);
          const numericId = parseInt(id);
          set((state) => ({ 
            submissions: state.submissions.filter(s => s.id !== numericId),
            allSubmissions: state.allSubmissions.filter(s => s.id !== numericId),
            currentSubmission: state.currentSubmission?.id === numericId ? null : state.currentSubmission,
            isLoading: false 
          }));
          return true;
        } catch (error) {
          set({ isLoading: false, error: "Không thể xóa bài viết" });
          return false;
        }
      },

      // --- GETTERS (Tính toán số lượng bài nộp cho UI) ---
      getCounts: () => {
        const list = get().allSubmissions || [];
        const active = list.filter(p => !p.is_withdrawn); 
        const accepted = active.filter(p => p.status?.toLowerCase() === "accepted").length;
        const rejected = active.filter(p => p.status?.toLowerCase() === "rejected").length;
        
        return {
          total: active.length,
          withdrawn: list.filter(p => p.is_withdrawn).length,
          accepted,
          rejected,
          underReview: active.length - (accepted + rejected)
        };
      },

      getMyCounts: () => {
        const list = get().submissions || [];
        const active = list.filter(p => !p.is_withdrawn);
        return {
          total: active.length,
          accepted: active.filter(p => p.status?.toLowerCase() === "accepted").length,
          rejected: active.filter(p => p.status?.toLowerCase() === "rejected").length,
          withdrawn: list.filter(p => p.is_withdrawn).length,
        };
      },

      clearStore: () => set({ 
        submissions: [], 
        allSubmissions: [], 
        currentSubmission: null,
        conferences: [], 
        assignedReviews: [], 
        isLoading: false, 
        error: null 
      }),
    }),
    {
      name: 'submission-storage',
      partialize: (state) => ({ 
        submissions: state.submissions,
        allSubmissions: state.allSubmissions,
        conferences: state.conferences
      }),
    }
  )
);