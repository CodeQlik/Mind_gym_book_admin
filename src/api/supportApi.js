import axiosInstance from "./axiosInstance";

export const supportApi = {
  // Admin Endpoints
  getAllTickets: (params) =>
    axiosInstance.get("/support/admin/tickets", { params }),
  getStats: () => axiosInstance.get("/support/admin/stats"),
  updateStatus: (id, status) =>
    axiosInstance.patch(`/support/admin/tickets/${id}/status`, { status }),

  // Shared/Common
  getTicketDetails: (id) => axiosInstance.get(`/support/tickets/${id}`),
  addMessage: (id, data) =>
    axiosInstance.post(`/support/tickets/${id}/messages`, data),

  // User Endpoints
  createTicket: (data) => axiosInstance.post("/support/tickets", data),
  getMyTickets: () => axiosInstance.get("/support/tickets/my"),
};
