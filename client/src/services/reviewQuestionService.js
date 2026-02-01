import axios from "../lib/axios";

const reviewQuestionService = {
    getByConference: async (conferenceId) => {
        const response = await axios.get(`/review-questions/conference/${conferenceId}`);
        return response.data;
    },
    create: async (data) => {
        const response = await axios.post("/review-questions", data);
        return response.data;
    },
    delete: async (id) => {
        const response = await axios.delete(`/review-questions/${id}`);
        return response.data;
    },
};

export default reviewQuestionService;
