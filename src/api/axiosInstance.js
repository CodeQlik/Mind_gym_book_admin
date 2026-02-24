import axios from "axios";

const API_BASE_URL = "https://mindgymbook.ductfabrication.in/api/v1";
// const API_BASE_URL = "http://localhost:5000/api/v1";

const API = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && token !== "undefined" && token !== "null") {
      // Forcefully set the header if it's missing
      if (!config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token.trim()}`;
      }
      console.log("[AXIOS] Attaching token to request:", config.url);
    } else {
      console.warn(
        "[AXIOS] No token found in localStorage for request:",
        config.url,
      );
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
      console.warn(
        "[AXIOS] 401 Unauthorized detected. Not wiping storage yet to prevent loop.",
      );
      /*
      ["token", "accessToken", "refreshToken", "refresh_token", "user"].forEach(
        (key) => localStorage.removeItem(key),
      );
      */
      // Optional: window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default API;
