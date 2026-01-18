import { create } from "zustand";
import api from "../../lib/axios";
import { toast } from "react-hot-toast";

export const useAuditStore = create((set) => ({
    logs: [],
    isLoading: false,
    error: null,
    fetchLogs: async () => {
        set({ isLoading: true, error: null });
        try {
            const res = await api.get("/audit-logs");
            set({ logs: res.data.audit_logs || [] });
        } catch (err) {
            console.error(err);
            const msg = err?.response?.data?.detail || "Không thể tải audit logs";
            toast.error(msg);
            set({ logs: [], error: msg });
        } finally {
            set({ isLoading: false });  
        }
    },
}));