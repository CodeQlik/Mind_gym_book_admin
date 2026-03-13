import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { analyticsApi } from "../../api/analyticsApi";

export const fetchDashboardStats = createAsyncThunk(
  "analytics/fetchDashboardStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await analyticsApi.getDashboardStats();
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(
          response.message || "Failed to fetch dashboard stats",
        );
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "An error occurred",
      );
    }
  },
);

export const fetchWeeklyTopBooks = createAsyncThunk(
  "analytics/fetchWeeklyTopBooks",
  async (limit = 10, { rejectWithValue }) => {
    try {
      const response = await analyticsApi.getTopSellingBooksWeek(limit);
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(
          response.message || "Failed to fetch weekly top books",
        );
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "An error occurred",
      );
    }
  },
);

const initialState = {
  revenue: null,
  engagement: null,
  weeklyTopBooks: [],
  loading: false,
  error: null,
};

const analyticsSlice = createSlice({
  name: "analytics",
  initialState,
  reducers: {
    clearAnalyticsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.revenue = action.payload.revenue;
        state.engagement = action.payload.engagement;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchWeeklyTopBooks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWeeklyTopBooks.fulfilled, (state, action) => {
        state.loading = false;
        state.weeklyTopBooks = action.payload;
      })
      .addCase(fetchWeeklyTopBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAnalyticsError } = analyticsSlice.actions;
export default analyticsSlice.reducer;
