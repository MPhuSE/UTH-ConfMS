import { create } from "zustand";
import api from "../../lib/axios";

export const useProceedingStore = create((set, get) => ({
  isLoading: false,
  error: null,
  exportData: null,

  exportProceedings: async (conferenceId) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get(`/proceedings/conferences/${conferenceId}/export`);
      set({ exportData: res.data, isLoading: false });
      return res.data;
    } catch (err) {
      const message =
        err?.response?.data?.detail ||
        err?.message ||
        "Không thể export proceedings";
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  downloadProceedingsJson: async (conferenceId) => {
    const data = await get().exportProceedings(conferenceId);
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `proceedings_conference_${conferenceId}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  },
}));
