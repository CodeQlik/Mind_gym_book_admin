import API from "./axiosInstance";

export const subscriptionApi = {
  // User Routes
  getMySubscription: async () => {
    const response = await API.get("/subscriptions/");
    return response.data;
  },

  createManualSubscription: async (payload) => {
    const response = await API.post("/subscriptions/create", payload);
    return response.data;
  },

  // Admin Routes
  getAllSubscriptions: async () => {
    const response = await API.get("/subscriptions/admin/all");
    return response.data;
  },

  forceUpdateStatus: async (id, status) => {
    const response = await API.patch(`/subscriptions/admin/status/${id}`, {
      status,
    });
    return response.data;
  },

  getSubscriptionById: async (id) => {
    const response = await API.get(`/subscriptions/${id}`);
    return response.data;
  },

  getSubscriptionByUserId: async (userId) => {
    const response = await API.get(`/subscriptions/user/${userId}`);
    return response.data;
  },
};
