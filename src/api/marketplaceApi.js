import API from "./axiosInstance";

export const marketplaceApi = {
  getPendingSellers: async () => {
    try {
      const response = await API.get("/marketplace/admin/pending-sellers");
      return response.data;
    } catch (error) {
      console.error("Failed to fetch pending sellers", error);
      throw error;
    }
  },
  approveSeller: async (id) => {
    try {
      const response = await API.patch(
        `/marketplace/admin/approve-seller/${id}`,
      );
      return response.data;
    } catch (error) {
      console.error("Failed to approve seller", error);
      throw error;
    }
  },
  approveListing: async (id) => {
    try {
      const response = await API.patch(
        `/marketplace/admin/approve-listing/${id}`,
      );
      return response.data;
    } catch (error) {
      console.error("Failed to approve listing", error);
      throw error;
    }
  },
  releaseEscrow: async (orderId) => {
    try {
      const response = await API.post(
        `/marketplace/admin/release-escrow/${orderId}`,
      );
      return response.data;
    } catch (error) {
      console.error("Failed to release escrow", error);
      throw error;
    }
  },
};
