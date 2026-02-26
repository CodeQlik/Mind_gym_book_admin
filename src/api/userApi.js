import API from "./axiosInstance";

export const userApi = {
  getAllUsers: async (page = 1, limit = 10) => {
    const response = await API.get(
      `/user/all-users?page=${page}&limit=${limit}`,
    );
    return response.data;
  },

  getUserById: async (id) => {
    const response = await API.get(`/users/${id}`);
    return response.data;
  },

  updateUser: async (id, formData) => {
    const response = await API.put(`/user/update/${id}`, formData);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await API.delete(`/user/delete/${id}`);
    return response.data;
  },

  searchUsers: async (query) => {
    const response = await API.get(`/user/search?query=${query}`);
    return response.data;
  },
  toggleUserStatus: async (id) => {
    const response = await API.patch(`/users/toggle-status/${id}`);
    return response.data;
  },
};
