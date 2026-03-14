import axiosInstance from "./axiosInstance";

const settingApi = {
  getSettings: async () => {
    const response = await axiosInstance.get("/settings");
    return response.data;
  },

  updateSettings: async (formData) => {
    const response = await axiosInstance.post("/settings/update", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};

export default settingApi;
