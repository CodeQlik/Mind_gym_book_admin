import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { userApi } from "../../api/userApi";

export const fetchAllUsers = createAsyncThunk(
  "users/fetchAllUsers",
  async ({ page = 1, limit = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await userApi.getAllUsers(page, limit);
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.message || "Failed to fetch users");
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "An error occurred",
      );
    }
  },
);

export const updateUserThunk = createAsyncThunk(
  "users/update",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await userApi.updateUser(id, formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update user",
      );
    }
  },
);

export const searchUsersThunk = createAsyncThunk(
  "users/search",
  async (query, { rejectWithValue }) => {
    try {
      const response = await userApi.searchUsers(query);
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.message || "Search failed");
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Search failed");
    }
  },
);

export const toggleUserStatusThunk = createAsyncThunk(
  "users/toggleStatus",
  async (id, { rejectWithValue }) => {
    try {
      const response = await userApi.toggleUserStatus(id);
      return { id, data: response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to toggle status",
      );
    }
  },
);

export const deleteUserThunk = createAsyncThunk(
  "users/delete",
  async (id, { rejectWithValue }) => {
    try {
      const response = await userApi.deleteUser(id);
      if (response.success) {
        return id;
      } else {
        return rejectWithValue(response.message || "Failed to delete user");
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete user",
      );
    }
  },
);

const initialState = {
  users: [],
  totalItems: 0,
  totalPages: 0,
  currentPage: 1,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearUserError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Users
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users || [];
        state.totalItems = action.payload.totalItems || 0;
        state.totalPages = action.payload.totalPages || 0;
        state.currentPage = action.payload.currentPage || 1;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update User
      .addCase(updateUserThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserThunk.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.users.findIndex(
          (u) => u.id === action.payload.id || u._id === action.payload._id,
        );
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(updateUserThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Search Users
      .addCase(searchUsersThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchUsersThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users || [];
        state.totalItems = action.payload.totalItems || 0;
        state.totalPages = action.payload.totalPages || 0;
        state.currentPage = action.payload.currentPage || 1;
      })
      .addCase(searchUsersThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(toggleUserStatusThunk.fulfilled, (state, action) => {
        const { id, data } = action.payload;
        const index = state.users.findIndex((u) => u.id === id || u._id === id);
        if (index !== -1) {
          state.users[index] = { ...state.users[index], ...data };
        }
      })
      // Delete User
      .addCase(deleteUserThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUserThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter(
          (u) => u.id !== action.payload && u._id !== action.payload,
        );
        state.totalItems -= 1;
      })
      .addCase(deleteUserThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearUserError } = userSlice.actions;
export default userSlice.reducer;
