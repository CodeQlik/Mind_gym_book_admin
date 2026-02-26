import API from "./axiosInstance";

export const planApi = {
  createPlan: async (planData) => {
    const response = await API.post("/plan", planData);
    return response.data;
  },

  getAllPlans: async () => {
    const response = await API.get("/plan");
    return response.data;
  },

  getPlanById: async (id) => {
    const response = await API.get(`/plan/${id}`);
    return response.data;
  },

  updatePlan: async (id, planData) => {
    const response = await API.put(`/plan/${id}`, planData);
    return response.data;
  },

  deletePlan: async (id) => {
    const response = await API.delete(`/plan/${id}`);
    return response.data;
  },

  togglePlanStatus: async (id) => {
    const response = await API.patch(`/plans/toggle-status/${id}`);
    return response.data;
  },
};
