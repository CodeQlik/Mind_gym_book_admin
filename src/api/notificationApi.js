import API from "./axiosInstance";

// ── User Routes (also consumed by admin panel)
export const fetchNotificationsAPI = (params = {}) =>
  API.get("/notifications", { params });
export const getUnreadCountAPI = () => API.get("/notifications/unread-count");
export const markNotificationReadAPI = (id) =>
  API.patch(`/notifications/${id}/read`);
export const markAllNotificationsReadAPI = () =>
  API.patch("/notifications/mark-all-read");
export const deleteNotificationAPI = (id) => API.delete(`/notifications/${id}`);

// ── Admin Routes ──
export const sendNotificationAPI = (payload) =>
  API.post("/notifications/admin/send", payload);
