import API from "./axiosInstance";

export const categoryApi = {
  addCategory: async (formData) => {
    const response = await API.post("/category/add", formData);
    return response.data;
  },

  getAllCategories: async () => {
    const response = await API.get("/category/all");
    return response.data;
  },

  getAdminCategories: async () => {
    const response = await API.get("/category/admin/all");
    return response.data;
  },

  getCategoryBySlug: async (slug) => {
    const response = await API.get(`/category/${slug}`);
    return response.data;
  },

  updateCategory: async (id, formData) => {
    const response = await API.put(`/category/update/${id}`, formData);
    return response.data;
  },

  deleteCategory: async (id) => {
    const response = await API.delete(`/category/delete/${id}`);
    return response.data;
  },

  toggleCategoryStatus: async (id) => {
    const response = await API.patch(`/category/toggle-status/${id}`);
    return response.data;
  },

  searchCategories: async (query) => {
    const response = await API.get(`/category/search?q=${query}`);
    return response.data;
  },
};
