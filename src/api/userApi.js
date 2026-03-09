import API from "./axiosInstance";

export const userApi = {
  getAllUsers: async (page = 1, limit = 10) => {
    const response = await API.get(
      `/users/all-users?page=${page}&limit=${limit}`,
    );
    return response.data;
  },

  getUserById: async (id) => {
    const response = await API.get(`/users/${id}`);
    return response.data;
  },

  updateUser: async (id, formData) => {
    const response = await API.put(`/users/update/${id}`, formData);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await API.delete(`/users/delete/${id}`);
    return response.data;
  },

  searchUsers: async (query) => {
    const response = await API.get(`/users/search?query=${query}`);
    return response.data;
  },
  toggleUserStatus: async (id) => {
    const response = await API.patch(`/users/toggle-status/${id}`);
    return response.data;
  },

  adminGetUserSessions: async (userId) => {
    const response = await API.get(`/users/admin/sessions/${userId}`);
    return response.data;
  },

  adminTerminateSession: async (userId, sessionId) => {
    const response = await API.delete(
      `/users/admin/terminate-session/${userId}/${sessionId}`,
    );
    return response.data;
  },
};
