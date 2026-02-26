import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { paymentApi } from "../../api/paymentApi";

export const fetchAllPayments = createAsyncThunk(
  "payments/fetchAll",
  async (params, { rejectWithValue }) => {
    try {
      const response = await paymentApi.getAllPayments(params);
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
  totalItems: 0,
  totalPages: 0,
  currentPage: 1,
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
        const data = action.payload.data || action.payload;
        state.payments = data.payments || [];
        state.totalItems = data.totalItems || 0;
        state.totalPages = data.totalPages || 0;
        state.currentPage = data.currentPage || 1;
      })
      .addCase(fetchAllPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearPaymentError } = paymentSlice.actions;
export default paymentSlice.reducer;
