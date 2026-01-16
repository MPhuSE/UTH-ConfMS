import { create } from 'zustand';
import { conferenceService } from '../../services/conferenceService';

export const useConferenceStore = create((set) => ({
    conferences: [],
    loading: false,
    error: null,
  
    fetchConferences: async () => {
      set({ loading: true, error: null });
      try {
        const res = await conferenceService.getAll();
        console.log("STORE RAW:", res);
  
        const conferences =
          Array.isArray(res?.conferences) ? res.conferences :
          Array.isArray(res?.items) ? res.items :
          Array.isArray(res?.data) ? res.data :
          [];
  
        console.log("STORE FINAL:", conferences);
  
        set({ conferences, loading: false });
      } catch (err) {
        console.error("STORE ERROR:", err);
        set({
          conferences: [],
          loading: false,
          error: err.message,
        });
      }
    },
  }));