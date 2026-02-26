import API from "./axiosInstance";

export const orderApi = {
  getAllOrders: async () => {
    try {
      const response = await API.get("/order/admin/all");
      return response.data;
    } catch (error) {
      console.error("Failed to fetch orders", error);
      throw error;
    }
  },
  updateOrderStatus: async (id, status) => {
    try {
      const response = await API.patch(`/order/admin/status/${id}`, {
        delivery_status: status,
      });
      return response.data;
    } catch (error) {
      console.error("Failed to update order status", error);
      throw error;
    }
  },
};
