import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authApi } from "../../api/authApi";

const getSafeToken = () => {
  const token = localStorage.getItem("token");
  if (!token || token === "undefined" || token === "null") {
    return null;
  }
  return token;
};

const getSafeUser = () => {
  try {
    const userStr = localStorage.getItem("user");
    if (!userStr || userStr === "undefined" || userStr === "null") return null;
    return JSON.parse(userStr);
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
        console.log("[AUTH] Login Response received:", data);

        // Extraction from backend 'data' wrapper
        const result = data.data || data;
        const accessToken = result.accessToken || result.token;
        const refreshToken = result.refreshToken || result.refresh_token;
        const user = result.user || (result.user_type ? result : null);

        if (!accessToken) {
          console.error("[AUTH] Access Token missing from response");
          return rejectWithValue("Access Token not found");
        }

        // STRICT ROLE CHECK: Only 'admin' or 'System Admin' etc.
        const userRole = (user?.user_type || user?.role || "").toLowerCase();
        const isAdmin = ["admin", "system admin", "master admin"].includes(
          userRole,
        );

        if (!isAdmin) {
          console.warn(
            "[AUTH] Access Denied: User is not an admin. Role:",
            userRole,
          );
          return rejectWithValue(
            "Access Denied: You do not have admin privileges.",
          );
        }

        // Standardized Persistence
        localStorage.setItem("token", String(accessToken));
        if (refreshToken) {
          localStorage.setItem("refreshToken", String(refreshToken));
          console.log("[AUTH] Refresh Token persisted successfully.");
        }

        if (user) {
          localStorage.setItem("user", JSON.stringify(user));
          console.log("[AUTH] User profile persisted successfully.");
        }

        console.log("[AUTH] Session standardized in storage.");

        return {
          token: String(accessToken),
          refreshToken: refreshToken ? String(refreshToken) : null,
          user,
        };
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
        if (user) {
          localStorage.setItem("user", JSON.stringify(user));
        }
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
  async ({ formData }, { rejectWithValue }) => {
    try {
      const data = await authApi.updateProfile(formData);
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

      // Wipe all related keys
      ["token", "accessToken", "refreshToken", "refresh_token", "user"].forEach(
        (key) => localStorage.removeItem(key),
      );
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
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;

        // Handle auth failures by logging out EVERYTHING
        const authErrors = [
          "Invalid token",
          "Please log in",
          "jwt malformed",
          "jwt expired",
          "No token found",
          "Unauthorized request",
          "Invalid access token",
          "Token not found",
        ];

        if (
          authErrors.some((err) =>
            String(action.payload || "")
              .toLowerCase()
              .includes(err.toLowerCase()),
          )
        ) {
          console.warn(
            "[AUTH] Profile fetch rejected with auth error. Not clearing state yet.",
          );
          /*
          state.token = null;
          state.refreshToken = null;
          state.user = null;
          state.isAuthenticated = false;

          [
            "token",
            "accessToken",
            "refreshToken",
            "refresh_token",
            "user",
          ].forEach((key) => localStorage.removeItem(key));
          */
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
