import API from "./axiosInstance";

export const subscriptionApi = {
  // User Routes
  getMySubscription: async () => {
    const response = await API.get("/subscription/");
    return response.data;
  },

  createManualSubscription: async (payload) => {
    const response = await API.post("/subscription/create", payload);
    return response.data;
  },

  // Admin Routes
  getAllSubscriptions: async () => {
    const response = await API.get("/subscription/admin/all");
    return response.data;
  },

  forceUpdateStatus: async (id, status) => {
    const response = await API.patch(`/subscription/admin/status/${id}`, {
      status,
    });
    return response.data;
  },

  getSubscriptionById: async (id) => {
    const response = await API.get(`/subscription/${id}`);
    return response.data;
  },

  getSubscriptionByUserId: async (userId) => {
    const response = await API.get(`/subscription/user/${userId}`);
    return response.data;
  },
};
