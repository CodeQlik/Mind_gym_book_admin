import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchNotificationsAPI,
  markNotificationReadAPI,
  markAllNotificationsReadAPI,
  deleteNotificationAPI,
  sendNotificationAPI,
  fetchAdminNotificationsAPI,
  fetchNotificationStatsAPI,
  deleteAdminNotificationAPI,
  markAllAdminNotificationsReadAPI,
} from "../../api/notificationApi";

// ── Thunks ──────────────────────────────────────────────────────────────────

// (User context fetch)
export const fetchNotifications = createAsyncThunk(
  "notifications/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await fetchNotificationsAPI(params);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to fetch notifications",
      );
    }
  },
);

// (Admin context fetch)
export const fetchAdminNotifications = createAsyncThunk(
  "notifications/fetchAdminAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await fetchAdminNotificationsAPI(params);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to fetch admin notifications",
      );
    }
  },
);

export const fetchNotificationStats = createAsyncThunk(
  "notifications/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetchNotificationStatsAPI();
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to fetch notification stats",
      );
    }
  },
);

export const markNotificationRead = createAsyncThunk(
  "notifications/markRead",
  async (id, { rejectWithValue }) => {
    try {
      await markNotificationReadAPI(id);
      return id;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to mark as read",
      );
    }
  },
);

export const markAllNotificationsRead = createAsyncThunk(
  "notifications/markAllRead",
  async (_, { rejectWithValue }) => {
    try {
      await markAllNotificationsReadAPI();
      return true;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to mark all as read",
      );
    }
  },
);

// (User context delete)
export const deleteNotification = createAsyncThunk(
  "notifications/delete",
  async (id, { rejectWithValue }) => {
    try {
      await deleteNotificationAPI(id);
      return id;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to delete notification",
      );
    }
  },
);

// (Admin context delete)
export const deleteAdminNotification = createAsyncThunk(
  "notifications/adminDelete",
  async (id, { rejectWithValue }) => {
    try {
      await deleteAdminNotificationAPI(id);
      return id;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message ||
          "Failed to delete notification by admin",
      );
    }
  },
);

export const markAllAdminNotificationsRead = createAsyncThunk(
  "notifications/adminMarkAllRead",
  async (_, { rejectWithValue }) => {
    try {
      await markAllAdminNotificationsReadAPI();
      return true;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to mark all as read by admin",
      );
    }
  },
);

export const sendNotification = createAsyncThunk(
  "notifications/send",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await sendNotificationAPI(payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to send notification",
      );
    }
  },
);

// ── Slice ────────────────────────────────────────────────────────────────────

const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    items: [],
    unreadCount: 0,
    total: 0,
    totalPages: 0,
    currentPage: 1,
    loading: false,
    error: null,
    sending: false,
    sendError: null,
    stats: {
      total: 0,
      unread: 0,
      sentToday: 0,
    },
  },
  reducers: {
    clearNotifications(state) {
      state.items = [];
      state.unreadCount = 0;
      state.total = 0;
    },
    receivedRealTimeNotification(state, action) {
      const newNotif = action.payload;
      // Add to list if not already there
      if (!state.items.find((n) => n.id === newNotif.id)) {
        state.items = [newNotif, ...state.items];
        state.total += 1;
        state.unreadCount += 1;
        // Update stats
        if (state.stats) {
          state.stats.unreadCount = (state.stats.unreadCount || 0) + 1;
          state.stats.totalNotifications =
            (state.stats.totalNotifications || 0) + 1;
          state.stats.total = (state.stats.total || 0) + 1;
        }
      }
    },
  },
  extraReducers: (builder) => {
    // Shared fetch handler
    const onFetchPending = (state) => {
      state.loading = true;
      state.error = null;
    };
    const onFetchFulfilled = (state, action) => {
      state.loading = false;
      const payload = action.payload;
      state.items =
        payload?.data?.notifications ||
        payload?.notifications ||
        payload?.data ||
        [];
      state.total =
        payload?.data?.total_items ||
        payload?.total_items ||
        payload?.total ||
        state.items.length;
      state.totalPages =
        payload?.data?.total_pages || payload?.total_pages || 1;
      state.currentPage =
        payload?.data?.current_page || payload?.current_page || 1;
      state.unreadCount = state.items.filter((n) => !n.is_read).length;
    };
    const onFetchRejected = (state, action) => {
      state.loading = false;
      state.error = action.payload;
    };

    builder
      .addCase(fetchNotifications.pending, onFetchPending)
      .addCase(fetchNotifications.fulfilled, onFetchFulfilled)
      .addCase(fetchNotifications.rejected, onFetchRejected)
      .addCase(fetchAdminNotifications.pending, onFetchPending)
      .addCase(fetchAdminNotifications.fulfilled, onFetchFulfilled)
      .addCase(fetchAdminNotifications.rejected, onFetchRejected);

    // fetchNotificationStats
    builder.addCase(fetchNotificationStats.fulfilled, (state, action) => {
      state.stats = {
        ...state.stats,
        ...(action.payload?.data || action.payload || {}),
      };
    });

    // markNotificationRead
    builder.addCase(markNotificationRead.fulfilled, (state, action) => {
      const id = action.payload;
      const notification = state.items.find((n) => n.id === id);
      if (notification && !notification.is_read) {
        notification.is_read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
        if (state.stats && state.stats.unreadCount > 0) {
          state.stats.unreadCount -= 1;
        }
      }
    });

    // markAllNotificationsRead
    builder.addCase(markAllNotificationsRead.fulfilled, (state) => {
      state.items.forEach((n) => {
        n.is_read = true;
      });
      state.unreadCount = 0;
      if (state.stats) {
        state.stats.unreadCount = 0;
      }
    });

    builder.addCase(markAllAdminNotificationsRead.fulfilled, (state) => {
      state.items.forEach((n) => {
        n.is_read = true;
      });
      state.unreadCount = 0;
      if (state.stats) {
        state.stats.unreadCount = 0;
      }
    });

    // Shared delete handler
    const onDeleteFulfilled = (state, action) => {
      const id = String(action.payload);
      const notification = state.items.find(
        (n) => String(n.id || n._id) === id,
      );
      if (notification && !notification.is_read) {
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
      state.items = state.items.filter((n) => String(n.id || n._id) !== id);
      state.total = Math.max(0, state.total - 1);
    };

    builder
      .addCase(deleteNotification.fulfilled, onDeleteFulfilled)
      .addCase(deleteAdminNotification.fulfilled, onDeleteFulfilled);

    // sendNotification
    builder
      .addCase(sendNotification.pending, (state) => {
        state.sending = true;
        state.sendError = null;
      })
      .addCase(sendNotification.fulfilled, (state) => {
        state.sending = false;
      })
      .addCase(sendNotification.rejected, (state, action) => {
        state.sending = false;
        state.sendError = action.payload;
      });
  },
});

export const { clearNotifications, receivedRealTimeNotification } =
  notificationSlice.actions;
export default notificationSlice.reducer;
