import api from "../lib/axios";

export const proceedingsService = {
    getPublicAcceptedPapers: async (conferenceId) => {
        const response = await api.get(`/proceedings/conferences/${conferenceId}/public`);
        return response.data;
    },

    exportProceedings: async (conferenceId) => {
        const response = await api.get(`/proceedings/conferences/${conferenceId}/export`);
        return response.data;
    }
};
