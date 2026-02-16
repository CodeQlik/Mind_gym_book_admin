import axios from "axios";

const API_BASE_URL = "https://mindgymbook.ductfabrication.in/api/v1";
// const API_BASE_URL = "http://localhost:5000/api/v1";

const API = axios.create({
  baseURL: API_BASE_URL,
});
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && token !== "undefined") {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    return Promise.reject(error);
  },
);

export default API;
