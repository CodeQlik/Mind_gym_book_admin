import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authApi } from "../../api/authApi";

const getSafeToken = () => {
  const token = localStorage.getItem("token");
  if (!token || token === "undefined") return null;
  return token;
};

const getSafeUser = () => {
  try {
    const user = localStorage.getItem("user");
    if (!user || user === "undefined") return null;
    return JSON.parse(user);
  } catch (e) {
    return null;
  }
};

const initialState = {
  token: getSafeToken(),
  refreshToken: localStorage.getItem("refreshToken"),
  user: getSafeUser(),
  loading: false,
  error: null,
  isAuthenticated: !!getSafeToken(),
};

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const data = await authApi.login(credentials);
      if (data.success) {
        // Handle new response structure: data.data.accessToken
        const token = data.data?.accessToken || data.token || data.data?.token;
        const refreshToken = data.data?.refreshToken;

        // Extract user: check data.data.user first
        let user = data.data?.user || data.user;

        if (!user) {
          if (data.data?.user_type || data.data?.role) {
            user = data.data;
          }
        }

        if (!token) return rejectWithValue("Token not found in response");

        // CHECK ROLE: Ensure only admins can access this panel
        const userRole = user?.role || user?.user_type;
        if (userRole !== "Admin" && userRole !== "admin") {
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          return rejectWithValue("Access Denied: Only Admins can log in here.");
        }

        localStorage.setItem("token", token);
        if (refreshToken) {
          localStorage.setItem("refreshToken", refreshToken);
        }
        localStorage.setItem("user", JSON.stringify(user || null));
        return { token, refreshToken, user };
      } else {
        return rejectWithValue(data.message || "Login failed");
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "An error occurred during login",
      );
    }
  },
);

export const fetchProfile = createAsyncThunk(
  "auth/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const data = await authApi.fetchProfile();
      if (data.success) {
        const user = data.user || data.data;
        localStorage.setItem("user", JSON.stringify(user || null));
        return user;
      } else {
        return rejectWithValue(data.message || "Failed to fetch profile");
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return rejectWithValue(message || "An error occurred fetching profile");
    }
  },
);

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const data = await authApi.updateProfile(id, formData);
      if (data.success) {
        const user = data.user || data.data;
        localStorage.setItem("user", JSON.stringify(user || null));
        return user;
      } else {
        return rejectWithValue(data.message || "Failed to update profile");
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return rejectWithValue(message || "An error occurred updating profile");
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.token = null;
      state.refreshToken = null;
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.user = action.payload.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.error = action.payload;
        // Handle auth failures by logging out
        const authErrors = [
          "Invalid token",
          "Please log in",
          "jwt malformed",
          "jwt expired",
          "No token found",
        ];

        if (authErrors.includes(action.payload)) {
          state.token = null;
          state.refreshToken = null;
          state.user = null;
          state.isAuthenticated = false;
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
        }
      })
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
