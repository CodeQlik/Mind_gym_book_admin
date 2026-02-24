import API from "./axiosInstance";

export const analyticsApi = {
  getDashboardStats: async () => {
    try {
      const response = await API.get("/analytics/dashboard");
      return response.data;
    } catch (error) {
      console.error("Failed to fetch analytics", error);
      throw error;
    }
  },
};
