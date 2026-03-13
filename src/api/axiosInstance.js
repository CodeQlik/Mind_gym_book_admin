import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const API = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
});
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && token !== "undefined" && token !== "null") {
      if (!config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token.trim()}`;
      }
    } else {
      const publicRoutes = [
        "/users/login",
        "/users/forgot-password",
        "/users/reset-password",
      ];
      const isPublicRoute = publicRoutes.some((route) =>
        config.url.includes(route),
      );

      if (!isPublicRoute) {
        console.warn(
          "[AXIOS] No token found in localStorage for request:",
          config.url,
        );
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
      const isLoginRequest = error.config.url.includes("/users/login");
      const isCurrentlyOnLoginPage = window.location.pathname === "/login";

      if (!isLoginRequest && !isCurrentlyOnLoginPage) {
        console.warn(
          "[AXIOS] 401 Unauthorized detected. Clearing storage and redirecting to login...",
        );

        // Wipe all auth keys
        [
          "token",
          "accessToken",
          "refreshToken",
          "refresh_token",
          "user",
        ].forEach((key) => localStorage.removeItem(key));

        window.location.href = "/login";
      } else {
        console.warn(
          "[AXIOS] 401 Unauthorized on login page or from login request. Skip redirect.",
        );
      }
    }
    return Promise.reject(error);
  },
);

export default API;
