import API from "./axiosInstance";

export const authApi = {
  login: async (credentials) => {
    const response = await API.post("/users/login", credentials);
    return response.data;
  },

  fetchProfile: async () => {
    const response = await API.get("/users/profile");
    return response.data;
  },

  updateProfile: async (formData) => {
    const response = await API.put("/users/update-profile", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};
