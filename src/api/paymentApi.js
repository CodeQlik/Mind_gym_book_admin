import API from "./axiosInstance";

export const paymentApi = {
  // Admin Routes
  getAllPayments: async () => {
    const response = await API.get("/payment/admin/all");
    return response.data;
  },

  // User/Common Routes
  createSubscriptionOrder: async (plan) => {
    const response = await API.post("/payment/create-subscription-order", {
      plan,
    });
    return response.data;
  },

  createBookOrder: async (amount, book_id) => {
    const response = await API.post("/payment/create-book-order", {
      amount,
      book_id,
    });
    return response.data;
  },

  verifyPayment: async (payload) => {
    const response = await API.post("/payment/verify-payment", payload);
    return response.data;
  },
};
