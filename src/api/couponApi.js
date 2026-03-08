import API from "./axiosInstance";

export const couponApi = {
  // Admin methods
  getAllCoupons: async (params = {}) => {
    const res = await API.get("/coupons/admin/all", { params });
    return res.data;
  },

  createCoupon: async (data) => {
    const res = await API.post("/coupons/admin/create", data);
    return res.data;
  },

  updateCoupon: async (id, data) => {
    const res = await API.patch(`/coupons/admin/update/${id}`, data);
    return res.data;
  },

  deleteCoupon: async (id) => {
    const res = await API.delete(`/coupons/admin/delete/${id}`);
    return res.data;
  },

  getCouponById: async (id) => {
    const res = await API.get(`/coupons/admin/${id}`);
    return res.data;
  },

  // User methods
  validateCoupon: async (code, amount) => {
    const res = await API.post("/coupons/validate", { code, amount });
    return res.data;
  },
};
