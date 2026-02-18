import API from "./axiosInstance";

export const bookApi = {
  getAllBooks: async (page = 1, limit = 10, status = "") => {
    let url = `/book/admin/all?page=${page}&limit=${limit}`;
    if (status) url += `&status=${status}`;
    const response = await API.get(url);
    return response.data;
  },

  getBookById: async (id) => {
    const response = await API.get(`/book/${id}`);
    return response.data;
  },

  getBookBySlug: async (slug) => {
    const response = await API.get(`/book/${slug}`);
    return response.data;
  },

  createBook: async (formData) => {
    const response = await API.post("/book/add", formData);
    return response.data;
  },

  updateBook: async (id, formData) => {
    const response = await API.put(`/book/update/${id}`, formData);
    return response.data;
  },

  deleteBook: async (id) => {
    const response = await API.delete(`/book/delete/${id}`);
    return response.data;
  },

  toggleBookStatus: async (id) => {
    const response = await API.patch(`/book/toggle-status/${id}`);
    return response.data;
  },

  searchBooks: async (query, status = "", page = 1, limit = 10) => {
    let url = `/book/search?q=${query}&page=${page}&limit=${limit}`;
    if (status) url += `&status=${status}`;
    const response = await API.get(url);
    return response.data;
  },

  getReadBookUrl: (id) => {
    return `/book/readBook/${id}`;
  },
};
