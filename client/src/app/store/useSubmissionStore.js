import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { submissionService } from '../../services/submissionService'; // Import service

export const useSubmissionStore = create(
  persist(
    (set, get) => ({
      // --- STATE ---
      submissions: [],      
      allSubmissions: [],   
      conferences: [],
      assignedReviews: [],
      isLoading: false,
      error: null,

      // --- ACTIONS ---
      fetchDashboardData: async (role) => {
        set({ isLoading: true, error: null });
        try {
          // 1. Luôn lấy danh sách hội nghị (dùng chung cho mọi role)
          const confData = await submissionService.getConferences();
          const openConferences = (confData?.conferences || []).filter(c => c.is_open);

          let newState = { 
            conferences: openConferences,
            isLoading: false 
          };

          // 2. Lấy dữ liệu theo vai trò (Role-based) thông qua Service
          switch (role) {
            case 'author':
              // Tác giả cần bài của mình và danh sách hội nghị để nộp bài
              const [mySubs, allSubs] = await Promise.all([
                submissionService.getMySubmissions(),
                submissionService.getAllSubmissions()
              ]);
              newState.submissions = mySubs || [];
              newState.allSubmissions = allSubs || [];
              break;

            case 'reviewer':
              const assigned = await submissionService.getAssignedReviews();
              newState.assignedReviews = assigned || [];
              break;

            case 'chair':
            case 'admin':
              const totalSubs = await submissionService.getAllSubmissions();
              newState.allSubmissions = totalSubs || [];
              break;

            default:
              const defaultSubs = await submissionService.getMySubmissions();
              newState.submissions = defaultSubs || [];
          }

          set(newState);
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error.response?.data?.detail || 'Lỗi tải dữ liệu dashboard' 
          });
        }
      },

      // Hàm xóa bài nộp (Ví dụ gọi từ UI)
      deleteSubmission: async (id) => {
        set({ isLoading: true });
        try {
          await submissionService.delete(id);
          // Cập nhật lại state cục bộ sau khi xóa thành công
          set({ 
            submissions: get().submissions.filter(s => s.id !== id),
            isLoading: false 
          });
        } catch (error) {
          set({ isLoading: false, error: "Không thể xóa bài viết" });
        }
      },

      // --- GETTERS (Computed Values) ---
      getCounts: () => {
        const list = get().allSubmissions || [];
        const total = list.filter(p => !p.is_withdrawn).length;
        return {
          total,
          accepted: list.filter(p => p.status === "Accept").length,
          rejected: list.filter(p => p.status === "Reject").length,
          underReview: total - (list.filter(p => p.status === "Accept").length + list.filter(p => p.status === "Reject").length)
        };
      },

      getMyCounts: () => {
        const list = get().submissions || [];
        return {
          total: list.length,
          accepted: list.filter(p => p.status === "Accept").length,
          rejected: list.filter(p => p.status === "Reject").length,
        };
      },

      clearStore: () => set({ 
        submissions: [], allSubmissions: [], conferences: [], 
        assignedReviews: [], isLoading: false, error: null 
      }),
    }),
    {
      name: 'submission-storage',
      partialize: (state) => ({ 
        submissions: state.submissions,
        allSubmissions: state.allSubmissions,
        conferences: state.conferences,
        assignedReviews: state.assignedReviews
      }),
    }
  )
);