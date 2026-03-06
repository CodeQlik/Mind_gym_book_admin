import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { orderApi } from "../../api/orderApi";

// ─── Thunks ────────────────────────────────────────────────────────────────────

export const fetchOrders = createAsyncThunk(
  "orders/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await orderApi.getAllOrders(params);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch orders",
      );
    }
  },
);

export const fetchOrderStats = createAsyncThunk(
  "orders/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await orderApi.getStats();
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch stats",
      );
    }
  },
);

export const searchOrders = createAsyncThunk(
  "orders/search",
  async ({ q, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await orderApi.searchOrders(q, page, limit);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Search failed");
    }
  },
);

export const updateStatus = createAsyncThunk(
  "orders/updateStatus",
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      const response = await orderApi.updateOrderStatus(id, updates);
      return { id, updates, data: response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update status",
      );
    }
  },
);

export const dispatchOrder = createAsyncThunk(
  "orders/dispatch",
  async (
    { id, tracking_id, courier_name, tracking_url },
    { rejectWithValue },
  ) => {
    try {
      const response = await orderApi.dispatchOrder(id, {
        tracking_id,
        courier_name,
        tracking_url,
      });
      return { id, data: response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to dispatch order",
      );
    }
  },
);

export const deleteOrder = createAsyncThunk(
  "orders/delete",
  async (orderId, { rejectWithValue }) => {
    try {
      await orderApi.deleteOrder(orderId);
      return orderId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete order",
      );
    }
  },
);

// ─── Slice ─────────────────────────────────────────────────────────────────────

const orderSlice = createSlice({
  name: "orders",
  initialState: {
    orders: [],
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    stats: {
      all: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      returned: 0,
    },
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
      // ── fetchOrders ──
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        // Handle: { success, data: { orders, totalItems, totalPages, currentPage } }
        const data = payload?.data || payload;
        state.orders = Array.isArray(data?.orders)
          ? data.orders
          : Array.isArray(data)
            ? data
            : [];
        state.totalItems = data?.totalItems ?? state.orders.length;
        state.totalPages = data?.totalPages ?? 1;
        state.currentPage = data?.currentPage ?? 1;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── fetchOrderStats ──
      .addCase(fetchOrderStats.pending, (state) => {
        state.statsLoading = true;
      })
      .addCase(fetchOrderStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        const data = action.payload?.data || action.payload;
        if (data) state.stats = { ...state.stats, ...data };
      })
      .addCase(fetchOrderStats.rejected, (state) => {
        state.statsLoading = false;
      })

      // ── searchOrders ──
      .addCase(searchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchOrders.fulfilled, (state, action) => {
        state.loading = false;
        const data = action.payload?.data || action.payload;
        state.orders = Array.isArray(data?.orders)
          ? data.orders
          : Array.isArray(data)
            ? data
            : [];
        state.totalItems = data?.totalItems ?? state.orders.length;
        state.totalPages = data?.totalPages ?? 1;
      })
      .addCase(searchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── updateStatus ──
      .addCase(updateStatus.fulfilled, (state, action) => {
        const { id, updates } = action.payload;
        const idx = state.orders.findIndex((o) => o.id === id);
        if (idx !== -1) {
          state.orders[idx] = {
            ...state.orders[idx],
            ...updates,
          };
        }
      })

      // ── dispatchOrder ──
      .addCase(dispatchOrder.fulfilled, (state, action) => {
        const { id, data } = action.payload;
        const idx = state.orders.findIndex((o) => o.id === id);
        if (idx !== -1 && data) {
          state.orders[idx] = { ...state.orders[idx], ...data };
        } else if (idx !== -1) {
          state.orders[idx].delivery_status = "shipped";
        }
      })

      // ── deleteOrder ──
      .addCase(deleteOrder.fulfilled, (state, action) => {
        const orderId = action.payload;
        state.orders = state.orders.filter(
          (o) => o.id !== orderId && o.order_id !== orderId,
        );
        state.totalItems = Math.max(0, state.totalItems - 1);
      });
  },
});

export const { setCurrentPage } = orderSlice.actions;
export default orderSlice.reducer;
