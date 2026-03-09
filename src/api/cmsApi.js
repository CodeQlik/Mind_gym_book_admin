import axiosInstance from "./axiosInstance";

const cmsApi = {
  // Public
  getPage: async (slug) => {
    const response = await axiosInstance.get(`/cms/page/${slug}`);
    return response.data;
  },

  // Admin
  getAllPages: async () => {
    const response = await axiosInstance.get("/cms/admin/all");
    return response.data;
  },

  savePage: async (data) => {
    const response = await axiosInstance.post("/cms/admin/save", data);
    return response.data;
  },

  deletePage: async (id) => {
    const response = await axiosInstance.delete(`/cms/admin/${id}`);
    return response.data;
  },
};

export default cmsApi;
