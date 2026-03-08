import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supportApi } from "../../api/supportApi";

export const fetchTickets = createAsyncThunk(
  "support/fetchTickets",
  async (params, { rejectWithValue }) => {
    try {
      const response = await supportApi.getAllTickets(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const fetchSupportStats = createAsyncThunk(
  "support/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await supportApi.getStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const updateStatus = createAsyncThunk(
  "support/updateStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await supportApi.updateStatus(id, status);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

const supportSlice = createSlice({
  name: "support",
  initialState: {
    tickets: [],
    stats: {
      open: 0,
      in_progress: 0,
      resolved: 0,
      closed: 0,
      total: 0,
    },
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    loading: false,
    statsLoading: false,
    error: null,
  },
  reducers: {
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Tickets
      .addCase(fetchTickets.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTickets.fulfilled, (state, action) => {
        state.loading = false;
        // Correctly handle Axios response path
        const responseData =
          action.payload?.data?.data || action.payload?.data || action.payload;
        state.tickets = responseData.tickets || [];
        state.totalPages = responseData.totalPages || 1;
        state.currentPage = responseData.currentPage || 1;
      })
      .addCase(fetchTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Stats
      .addCase(fetchSupportStats.pending, (state) => {
        state.statsLoading = true;
      })
      .addCase(fetchSupportStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        const responseData =
          action.payload?.data?.data || action.payload?.data || action.payload;
        state.stats = { ...state.stats, ...(responseData || {}) };
      })
      .addCase(fetchSupportStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.error = action.payload;
      })
      // Update Status
      .addCase(updateStatus.fulfilled, (state, action) => {
        const data = action.payload?.data || action.payload;
        const id = data.id || data._id;
        const index = state.tickets.findIndex((t) => t.id === id);
        if (index !== -1) {
          state.tickets[index].status = data.status;
        }
      });
  },
});

export const { setCurrentPage } = supportSlice.actions;
export default supportSlice.reducer;
