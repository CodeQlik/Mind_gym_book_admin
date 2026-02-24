import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { marketplaceApi } from "../../api/marketplaceApi";

export const fetchPendingSellers = createAsyncThunk(
  "marketplace/fetchPendingSellers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await marketplaceApi.getPendingSellers();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch sellers");
    }
  },
);

export const approveSellerThunk = createAsyncThunk(
  "marketplace/approveSeller",
  async (id, { rejectWithValue }) => {
    try {
      const response = await marketplaceApi.approveSeller(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to approve seller",
      );
    }
  },
);

const marketSlice = createSlice({
  name: "marketplace",
  initialState: {
    pendingSellers: [],
    loading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPendingSellers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPendingSellers.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingSellers = action.payload;
      })
      .addCase(fetchPendingSellers.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Error fetching marketplace data";
      })
      .addCase(approveSellerThunk.fulfilled, (state, action) => {
        state.pendingSellers = state.pendingSellers.filter(
          (s) => s.id !== action.meta.arg,
        );
      });
  },
});

export default marketSlice.reducer;
