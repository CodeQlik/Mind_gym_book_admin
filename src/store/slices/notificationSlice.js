import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchNotificationsAPI,
  markNotificationReadAPI,
  markAllNotificationsReadAPI,
  deleteNotificationAPI,
  sendNotificationAPI,
} from "../../api/notificationApi";

// ── Thunks ──────────────────────────────────────────────────────────────────

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
    loading: false,
    error: null,
    sending: false,
    sendError: null,
  },
  reducers: {
    clearNotifications(state) {
      state.items = [];
      state.unreadCount = 0;
      state.total = 0;
    },
  },
  extraReducers: (builder) => {
    // fetchNotifications
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        state.items =
          payload?.data?.notifications ||
          payload?.notifications ||
          payload?.data ||
          [];
        state.total =
          payload?.data?.total || payload?.total || state.items.length;
        state.unreadCount = state.items.filter((n) => !n.is_read).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // markNotificationRead
    builder.addCase(markNotificationRead.fulfilled, (state, action) => {
      const id = action.payload;
      const notification = state.items.find((n) => n.id === id);
      if (notification && !notification.is_read) {
        notification.is_read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    });

    // markAllNotificationsRead
    builder.addCase(markAllNotificationsRead.fulfilled, (state) => {
      state.items.forEach((n) => {
        n.is_read = true;
      });
      state.unreadCount = 0;
    });

    // deleteNotification
    builder.addCase(deleteNotification.fulfilled, (state, action) => {
      const id = action.payload;
      const notification = state.items.find((n) => n.id === id);
      if (notification && !notification.is_read) {
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
      state.items = state.items.filter((n) => n.id !== id);
      state.total = Math.max(0, state.total - 1);
    });
    // sendNotification
    builder
      .addCase(sendNotification.pending, (state) => {
        state.sending = true;
        state.sendError = null;
      })
      .addCase(sendNotification.fulfilled, (state, action) => {
        state.sending = false;
        // The backend returns { success: true, data: { dbCount: 5, fcmCount: 1 } }
        // We don't add this to the items list as it's not a notification object.
        // The parent component should refetch to get the actual history.
      })
      .addCase(sendNotification.rejected, (state, action) => {
        state.sending = false;
        state.sendError = action.payload;
      });
  },
});

export const { clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
