import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { subscriptionApi } from "../../api/subscriptionApi";

export const fetchSubscriptions = createAsyncThunk(
  "subscriptions/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await subscriptionApi.getAllSubscriptions();
      return response.data || response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch subscriptions",
      );
    }
  },
);

export const forceUpdateStatus = createAsyncThunk(
  "subscriptions/updateStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await subscriptionApi.forceUpdateStatus(id, status);
      return { id, status: response.data?.status || status };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update status",
      );
    }
  },
);

const initialState = {
  subscriptions: [],
  loading: false,
  error: null,
};

const subscriptionSlice = createSlice({
  name: "subscriptions",
  initialState,
  reducers: {
    clearSubscriptionError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubscriptions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubscriptions.fulfilled, (state, action) => {
        state.loading = false;
        // The screenshot shows data: { ... } which might be a single object or an array
        // We'll ensure it's handled as an array for the table
        const payload = action.payload;
        state.subscriptions = Array.isArray(payload)
          ? payload
          : payload
            ? [payload]
            : [];
      })
      .addCase(fetchSubscriptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(forceUpdateStatus.fulfilled, (state, action) => {
        const index = state.subscriptions.findIndex(
          (sub) => sub.id === action.payload.id,
        );
        if (index !== -1) {
          state.subscriptions[index].status = action.payload.status;
        }
      });
  },
});

export const { clearSubscriptionError } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;
