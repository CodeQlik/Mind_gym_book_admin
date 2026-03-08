import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { couponApi } from "../../api/couponApi";

export const fetchCoupons = createAsyncThunk(
  "coupons/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await couponApi.getAllCoupons(params);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch coupons",
      );
    }
  },
);

export const createCoupon = createAsyncThunk(
  "coupons/create",
  async (data, { rejectWithValue }) => {
    try {
      const response = await couponApi.createCoupon(data);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create coupon",
      );
    }
  },
);

export const updateCoupon = createAsyncThunk(
  "coupons/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await couponApi.updateCoupon(id, data);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update coupon",
      );
    }
  },
);

export const deleteCoupon = createAsyncThunk(
  "coupons/delete",
  async (id, { rejectWithValue }) => {
    try {
      await couponApi.deleteCoupon(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete coupon",
      );
    }
  },
);

const couponSlice = createSlice({
  name: "coupons",
  initialState: {
    items: [],
    loading: false,
    error: null,
    submitLoading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCoupons.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCoupons.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
      })
      .addCase(fetchCoupons.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createCoupon.pending, (state) => {
        state.submitLoading = true;
      })
      .addCase(createCoupon.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.items.unshift(action.payload.data);
      })
      .addCase(createCoupon.rejected, (state, action) => {
        state.submitLoading = false;
      })
      .addCase(updateCoupon.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (i) => i.id === action.payload.data.id,
        );
        if (index !== -1) {
          state.items[index] = action.payload.data;
        }
      })
      .addCase(deleteCoupon.fulfilled, (state, action) => {
        state.items = state.items.filter((i) => i.id !== action.payload);
      });
  },
});

export default couponSlice.reducer;
