import axiosInstance from "./axiosInstance";

export const getAllContactQueries = async (page = 1, limit = 10) => {
  try {
    const response = await axiosInstance.get(
      `/contact/admin/all?page=${page}&limit=${limit}`,
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateQueryStatus = async (id, status) => {
  try {
    const response = await axiosInstance.patch(`/contact/admin/${id}/status`, {
      status,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteContactQuery = async (id) => {
  try {
    const response = await axiosInstance.delete(`/contact/admin/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
