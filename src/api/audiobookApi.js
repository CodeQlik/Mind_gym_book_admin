import API from "./axiosInstance";

export const audiobookApi = {
  createAudiobook: async (formData) => {
    const response = await API.post("/audiobook/add", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  getAllAudiobooks: async (page = 1, limit = 10) => {
    const response = await API.get(`/audiobook/all?page=${page}&limit=${limit}`);
    return response.data;
  },

  getAudiobookById: async (id) => {
    const response = await API.get(`/audiobook/${id}`);
    return response.data;
  },

  updateAudiobook: async (id, formData) => {
    const response = await API.put(`/audiobook/update/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  deleteAudiobook: async (id) => {
    const response = await API.delete(`/audiobook/delete/${id}`);
    return response.data;
  },
  toggleAudiobookStatus: async (id) => {
    const response = await API.put(`/audiobook/toggle-status/${id}`);
    return response.data;
  },
};
