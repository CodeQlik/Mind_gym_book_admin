import API from "./axiosInstance";

export const planApi = {
  createPlan: async (planData) => {
    const response = await API.post("/plans", planData);
    return response.data;
  },

  getAllPlans: async () => {
    const response = await API.get("/plans");
    return response.data;
  },

  getPlanById: async (id) => {
    const response = await API.get(`/plans/${id}`);
    return response.data;
  },

  updatePlan: async (id, planData) => {
    const response = await API.put(`/plans/${id}`, planData);
    return response.data;
  },

  deletePlan: async (id) => {
    const response = await API.delete(`/plans/${id}`);
    return response.data;
  },

  togglePlanStatus: async (id) => {
    const response = await API.patch(`/plans/toggle-status/${id}`);
    return response.data;
  },
};
