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

  forgotPassword: async (email) => {
    const response = await API.post("/users/forgot-password", { email });
    return response.data;
  },

  // ── OTP: Verify OTP before resetting password ──
  verifyOtp: async (email, otp) => {
    const response = await API.post("/users/verify-forgot-password-otp", {
      email,
      otp,
    });
    return response.data;
  },

  // ── OTP: Reset password using verified OTP ──
  resetPasswordOtp: async ({ email, otp, password, confirmPassword }) => {
    const response = await API.post("/users/reset-password-otp", {
      email,
      otp,
      password,
      confirmPassword,
    });
    return response.data;
  },

  // ── NEW: Reset password using token received after OTP verification ──
  resetPasswordWithToken: async ({ token, new_password, confirm_password }) => {
    const response = await API.post("/users/reset-password", {
      token,
      new_password,
      confirm_password,
    });
    return response.data;
  },

  // Legacy token-based reset (kept for backward compat)
  resetPassword: async (token, passwords) => {
    const response = await API.post(
      `/users/reset-password/${token}`,
      passwords,
    );
    return response.data;
  },

  changePassword: async (passwords) => {
    const response = await API.post("/users/change-password", passwords);
    return response.data;
  },
};
