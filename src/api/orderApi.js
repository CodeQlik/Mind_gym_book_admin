import API from "./axiosInstance";

export const orderApi = {
  // GET /orders/admin/all?delivery_status=processing&search=john&page=1&limit=10
  getAllOrders: async (params = {}) => {
    const response = await API.get("/orders/admin/all", { params });
    return response.data;
  },

  // GET /orders/admin/stats
  getStats: async () => {
    const response = await API.get("/orders/admin/stats");
    return response.data;
  },

  // GET /orders/admin/search?q=<query>&page=1&limit=10
  searchOrders: async (q, page = 1, limit = 10) => {
    const response = await API.get("/orders/admin/search", {
      params: { q, page, limit },
    });
    return response.data;
  },

  // GET /orders/admin/:orderId
  getOrderById: async (orderId) => {
    const response = await API.get(`/orders/admin/${orderId}`);
    return response.data;
  },

  // PATCH /orders/admin/status/:orderId
  updateOrderStatus: async (orderId, payload) => {
    const response = await API.patch(
      `/orders/admin/status/${orderId}`,
      payload,
    );
    return response.data;
  },

  // PATCH /orders/admin/dispatch/:orderId
  dispatchOrder: async (orderId, payload) => {
    const response = await API.patch(
      `/orders/admin/dispatch/${orderId}`,
      payload,
    );
    return response.data;
  },

  // DELETE /orders/admin/delete/:orderId
  deleteOrder: async (orderId) => {
    const response = await API.delete(`/orders/admin/delete/${orderId}`);
    return response.data;
  },

  // GET /orders/invoice/:orderId
  downloadInvoice: async (orderId) => {
    const response = await API.get(`/orders/invoice/${orderId}`, {
      responseType: "blob",
    });
    return response.data;
  },
};
