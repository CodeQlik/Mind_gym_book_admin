import axios from "axios";

// const API_BASE_URL = "https://mindgymbook.ductfabrication.in/api/v1";
const API_BASE_URL = "http://localhost:5000/api/v1";

const API = axios.create({
  baseURL: API_BASE_URL,
});
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && token !== "undefined") {
      const isExternal =
        /^https?:\/\//i.test(config.url) &&
        !config.url.startsWith(API_BASE_URL);

      if (!isExternal) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    if (config.data) {
      const unwantedFields = ["location", "role"];

      if (config.data instanceof FormData) {
        unwantedFields.forEach((field) => {
          if (config.data.has(field)) {
            config.data.delete(field);
          }
        });
      } else if (typeof config.data === "object") {
        unwantedFields.forEach((field) => {
          if (Object.prototype.hasOwnProperty.call(config.data, field)) {
            delete config.data[field];
          }
        });
      }
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
