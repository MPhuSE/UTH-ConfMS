import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { submissionService } from '../../services/submissionService';
import { cameraReadyService } from '../../services/cameraReadyService';
import { reviewService } from '../../services/reviewService';

export const useSubmissionStore = create(
  persist(
    (set, get) => ({
      // --- STATE ---
      submissions: [],        // Danh sách bài nộp của Author
      allSubmissions: [],     // Danh sách cho Admin/Chair
      currentSubmission: null, 
      conferences: [],        
      reviewsBySubmission: {},
      reviewsLoading: {},
      isLoading: false,
      error: null,

      // --- ACTIONS ---

      // 1. Upload Camera-Ready (Đồng bộ hóa ID 26 ngay lập tức)
      uploadCameraReady: async (submissionId, file) => {
        set({ isLoading: true, error: null });
        try {
          const numericId = Number(submissionId);
          const state = get();
          const existing =
            (state.currentSubmission && Number(state.currentSubmission.id) === numericId
              ? state.currentSubmission
              : null) ||
            state.submissions.find(s => Number(s.id) === numericId) ||
            state.allSubmissions.find(s => Number(s.id) === numericId);

          if (Number(existing?.camera_ready_submission) > 0) {
            set({ isLoading: false, error: 'Bản camera-ready đã được nộp.' });
            return { success: false, error: 'Bản camera-ready đã được nộp.' };
          }

          const response = await cameraReadyService.upload(submissionId, file);
          
          // Lấy dữ liệu mới từ Backend trả về
          const newCameraId = response.camera_ready_submission || response.id;
          const newFilePath = response.file_url || response.file_path;
          const newStatus = response.status || "published"; // Backend trả về status = "published"

          set((state) => {
            // Theo SUBMISSION_WORKFLOW.md: Sau khi upload camera-ready, status = "published"
            const updatedFields = {
              camera_ready_submission: newCameraId,
              file_path: newFilePath,
              status: newStatus  // Cập nhật status = "published" từ backend
            };

            // Cập nhật ĐỒNG THỜI cả Object chi tiết và Danh sách mảng
            return {
              isLoading: false,
              currentSubmission: Number(state.currentSubmission?.id) === numericId 
                ? { ...state.currentSubmission, ...updatedFields } 
                : state.currentSubmission,
              submissions: state.submissions.map(s => 
                Number(s.id) === numericId ? { ...s, ...updatedFields } : s
              ),
              allSubmissions: state.allSubmissions.map(s => 
                Number(s.id) === numericId ? { ...s, ...updatedFields } : s
              )
            };
          });
          return { success: true };
        } catch (err) {
          const errorMsg = err.response?.data?.detail || 'Lỗi tải lên bản cuối';
          set({ isLoading: false, error: errorMsg });
          return { success: false, error: errorMsg };
        }
      },

      // 2. Lấy dữ liệu Dashboard (Làm mới danh sách)
      fetchDashboardData: async (role) => {
        set({ isLoading: true, error: null });
        try {
          const confData = await submissionService.getConferences();
          const openConfs = (confData?.conferences || confData || []).filter(c => c.is_open);
          
          let newState = { conferences: openConfs, isLoading: false };

          if (role === 'author') {
            const mySubs = await submissionService.getMySubmissions();
            newState.submissions = Array.isArray(mySubs) ? mySubs : [];
          } else if (['chair', 'admin'].includes(role)) {
            const totalSubs = await submissionService.getAllSubmissions();
            newState.allSubmissions = Array.isArray(totalSubs) ? totalSubs : [];
          }
          set(newState);
        } catch (error) {
          set({ isLoading: false, error: 'Lỗi nạp dữ liệu hệ thống' });
        }
      },

      // 3. Lấy chi tiết bài nộp theo ID (Xử lý ép kiểu dữ liệu)
      fetchSubmissionById: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const res = await submissionService.getById(id);
          // Xử lý trường hợp Backend trả về mảng hoặc object đơn lẻ
          const data = res.data ? (Array.isArray(res.data) ? res.data[0] : res.data) : res;
          
          // Debug: Log scores để kiểm tra
          console.log("[SubmissionStore] fetchSubmissionById - Received data:", {
            id: data?.id,
            avg_score: data?.avg_score,
            final_score: data?.final_score,
            fullData: data
          });
          
          // Đảm bảo camera_ready_submission được lưu đúng (quan trọng để không mất trạng thái khi reload)
          const numId = Number(id);
          set((state) => ({
            currentSubmission: data,
            isLoading: false,
            // Đồng bộ vào submissions list nếu có
            submissions: state.submissions.map(s => 
              s.id === numId ? { ...s, ...data } : s
            ),
            allSubmissions: state.allSubmissions.map(s => 
              s.id === numId ? { ...s, ...data } : s
            )
          }));
          return data;
        } catch (error) {
          set({ isLoading: false, error: 'Không thể tải chi tiết bài báo' });
          return null;
        }
      },

      // 4. Cập nhật bài nộp
      updateSubmission: async (id, formData) => {
        set({ isLoading: true });
        try {
          const res = await submissionService.update(id, formData);
          const updated = res.data || res;
          const numId = parseInt(id);
          
          set((state) => ({
            isLoading: false,
            submissions: state.submissions.map(s => s.id === numId ? { ...s, ...updated } : s),
            allSubmissions: state.allSubmissions.map(s => s.id === numId ? { ...s, ...updated } : s),
            currentSubmission: updated
          }));
          return true;
        } catch (error) {
          set({ isLoading: false, error: 'Cập nhật thất bại' });
          return false;
        }
      },

      // 5. Xóa bài nộp
      deleteSubmission: async (id) => {
        set({ isLoading: true });
        try {
          await submissionService.delete(id);
          const numId = parseInt(id);
          set((state) => ({ 
            submissions: state.submissions.filter(s => s.id !== numId),
            allSubmissions: state.allSubmissions.filter(s => s.id !== numId),
            currentSubmission: null,
            isLoading: false 
          }));
          return true;
        } catch (error) {
          set({ isLoading: false, error: 'Xóa thất bại' });
          return false;
        }
      },

      // 6. Lấy reviews ẩn danh theo Submission ID
      fetchReviewsBySubmission: async (submissionId) => {
        set((state) => ({
          error: null,
          reviewsLoading: { ...state.reviewsLoading, [submissionId]: true }
        }));
        try {
          const res = await reviewService.getReviewsBySubmission(submissionId);
          const reviews = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
          set((state) => ({
            reviewsBySubmission: { ...state.reviewsBySubmission, [submissionId]: reviews },
            reviewsLoading: { ...state.reviewsLoading, [submissionId]: false }
          }));
          return reviews;
        } catch (err) {
          const errorMsg = err.response?.data?.detail || 'Không thể tải reviews';
          set((state) => ({
            error: errorMsg,
            reviewsLoading: { ...state.reviewsLoading, [submissionId]: false }
          }));
          return null;
        }
      },

      // --- GETTERS / HELPERS ---
      
      getMyCounts: () => {
        const list = get().submissions || [];
        const active = list.filter(p => !p.is_withdrawn);
        const accepted = active.filter(p => {
          const decision = p.decision?.toLowerCase();
          const status = p.status?.toLowerCase();
          return decision === "accepted" || status === "accept" || status === "accepted";
        }).length;
        const rejected = active.filter(p => {
          const decision = p.decision?.toLowerCase();
          const status = p.status?.toLowerCase();
          return decision === "rejected" || status === "reject" || status === "rejected";
        }).length;
        const underReview = active.filter(p => (p.status?.toLowerCase() || '').includes('review')).length;
        // Kiểm tra an toàn cho ID bản cuối
        const finished = active.filter(p => Number(p.camera_ready_submission) > 0).length;

        return { 
          total: active.length, 
          accepted, 
          rejected, 
          finished,
          underReview,
          pending: active.length - (accepted + rejected + underReview) 
        };
      },

      getCounts: () => {
        const list = get().allSubmissions || [];
        const active = list.filter(p => !p.is_withdrawn);
        const accepted = active.filter(p => p.decision?.toLowerCase() === "accepted").length;
        return { total: active.length, accepted, pending: active.length - accepted };
      },

      clearStore: () => set({ 
        submissions: [], 
        allSubmissions: [], 
        currentSubmission: null, 
        conferences: [], 
        reviewsBySubmission: {},
        reviewsLoading: {},
        isLoading: false, 
        error: null 
      })
    }),
    { 
      name: 'submission-storage', 
    
      partialize: (state) => ({ 
        submissions: state.submissions, 
        allSubmissions: state.allSubmissions,
        conferences: state.conferences 
      }) 
    }
  )
);