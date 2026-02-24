import API from "./axiosInstance";

export const orderApi = {
  getAllOrders: async () => {
    try {
      const response = await API.get("/orders/admin/all");
      return response.data;
    } catch (error) {
      console.error("Failed to fetch orders", error);
      throw error;
    }
  },
  updateOrderStatus: async (id, status) => {
    try {
      const response = await API.patch(`/orders/admin/status/${id}`, {
        status,
      });
      return response.data;
    } catch (error) {
      console.error("Failed to update order status", error);
      throw error;
    }
  },
};
