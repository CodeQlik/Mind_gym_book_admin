import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { paymentApi } from "../../api/paymentApi";

export const fetchAllPayments = createAsyncThunk(
  "payments/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await paymentApi.getAllPayments();
      return response.data || response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch payments",
      );
    }
  },
);

const initialState = {
  payments: [],
  loading: false,
  error: null,
};

const paymentSlice = createSlice({
  name: "payments",
  initialState,
  reducers: {
    clearPaymentError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.payments = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchAllPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearPaymentError } = paymentSlice.actions;
export default paymentSlice.reducer;
