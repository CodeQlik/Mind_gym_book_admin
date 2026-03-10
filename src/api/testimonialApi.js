import axiosInstance from "./axiosInstance";

const testimonialApi = {
  getAllTestimonials: async () => {
    try {
      const response = await axiosInstance.get("/testimonials");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  createTestimonial: async (formData) => {
    try {
      const response = await axiosInstance.post("/testimonials", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  updateTestimonial: async (id, formData) => {
    try {
      const response = await axiosInstance.put(
        `/testimonials/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  deleteTestimonial: async (id) => {
    try {
      const response = await axiosInstance.delete(`/testimonials/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default testimonialApi;
