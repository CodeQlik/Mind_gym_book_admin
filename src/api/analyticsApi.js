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
  getTopSellingBooksWeek: async (limit = 10) => {
    try {
      const response = await API.get(`/analytics/top-selling-books-week?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch top selling books for the week", error);
      throw error;
    }
  },
};
