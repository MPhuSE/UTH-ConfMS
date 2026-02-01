import api from "../lib/axios";

export const tenantService = {
    getAll: async () => {
        const res = await api.get("/tenants");
        return res.data;
    },

    getMyMemberships: async () => {
        const res = await api.get("/tenants/my-memberships");
        return res.data;
    },

    create: async (data) => {
        const res = await api.post("/tenants", data);
        return res.data;
    },

    update: async (id, data) => {
        const res = await api.put(`/tenants/${id}`, data);
        return res.data;
    },

    delete: async (id) => {
        const res = await api.delete(`/tenants/${id}`);
        return res.data;
    },

    getMembers: async (id) => {
        const res = await api.get(`/tenants/${id}/members`);
        return res.data;
    },

    addMember: async (id, data) => {
        const res = await api.post(`/tenants/${id}/members`, data);
        return res.data;
    },

    removeMember: async (tenantId, userId) => {
        const res = await api.delete(`/tenants/${tenantId}/members/${userId}`);
        return res.data;
    },
};

export default tenantService;
