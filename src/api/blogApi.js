import axiosInstance from "./axiosInstance";

const blogApi = {
  getAllBlogs: async () => {
    try {
      const response = await axiosInstance.get("/blogs");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getBlogBySlug: async (slug) => {
    try {
      const response = await axiosInstance.get(`/blogs/${slug}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  createBlog: async (formData) => {
    try {
      const response = await axiosInstance.post("/blogs", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  updateBlog: async (id, formData) => {
    try {
      const response = await axiosInstance.put(`/blogs/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  deleteBlog: async (id) => {
    try {
      const response = await axiosInstance.delete(`/blogs/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default blogApi;
