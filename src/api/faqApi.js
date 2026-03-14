import axiosInstance from "./axiosInstance";

const faqApi = {
  // Public
  getFaqs: async () => {
    const response = await axiosInstance.get("/faqs");
    return response.data;
  },

  // Admin
  getAllFaqs: async () => {
    const response = await axiosInstance.get("/faqs/admin");
    return response.data;
  },

  getFaqById: async (id) => {
    const response = await axiosInstance.get(`/faqs/${id}`);
    return response.data;
  },

  createFaq: async (data) => {
    const response = await axiosInstance.post("/faqs", data);
    return response.data;
  },

  updateFaq: async (id, data) => {
    const response = await axiosInstance.put(`/faqs/${id}`, data);
    return response.data;
  },

  toggleFaqStatus: async (id) => {
    const response = await axiosInstance.put(`/faqs/toggle-status/${id}`);
    return response.data;
  },

  deleteFaq: async (id) => {
    const response = await axiosInstance.delete(`/faqs/${id}`);
    return response.data;
  },
};

export default faqApi;
