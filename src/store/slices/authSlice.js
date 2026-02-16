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
        const token = data.token || data.data?.token;

        // Improved user extraction: check data.user first,
        // then check if data.data IS the user object (has user_type),
        // otherwise try to get data.data.user
        let user = data.user;
        if (!user) {
          if (data.data?.user_type || data.data?.role) {
            user = data.data;
          } else {
            user = data.data?.user;
          }
        }

        if (!token) return rejectWithValue("Token not found in response");

        // CHECK ROLE: Ensure only admins can access this panel
        const userRole = user?.role || user?.user_type;
        if (userRole !== "Admin" && userRole !== "admin") {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          return rejectWithValue("Access Denied: Only Admins can log in here.");
        }

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user || null));
        return { token, user };
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
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem("token");
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
          state.user = null;
          state.isAuthenticated = false;
          localStorage.removeItem("token");
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
