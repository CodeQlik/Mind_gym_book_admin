import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { audiobookApi } from "../../api/audiobookApi";

export const fetchAudiobooks = createAsyncThunk(
  "audiobooks/fetchAll",
  async ({ page, limit }, { rejectWithValue }) => {
    try {
      const response = await audiobookApi.getAllAudiobooks(page, limit);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch audiobooks");
    }
  }
);

export const createAudiobook = createAsyncThunk(
  "audiobooks/create",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await audiobookApi.createAudiobook(formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to create audiobook");
    }
  }
);

export const updateAudiobook = createAsyncThunk(
  "audiobooks/update",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await audiobookApi.updateAudiobook(id, formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update audiobook");
    }
  }
);

export const deleteAudiobook = createAsyncThunk(
  "audiobooks/delete",
  async (id, { rejectWithValue }) => {
    try {
      await audiobookApi.deleteAudiobook(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete audiobook");
    }
  }
);

export const toggleAudiobookStatus = createAsyncThunk(
  "audiobooks/toggleStatus",
  async (id, { rejectWithValue }) => {
    try {
      const response = await audiobookApi.toggleAudiobookStatus(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to toggle status");
    }
  }
);

const initialState = {
  audiobooks: [],
  totalItems: 0,
  totalPages: 0,
  currentPage: 1,
  loading: false,
  error: null,
};

const audiobookSlice = createSlice({
  name: "audiobooks",
  initialState,
  reducers: {
    clearAudiobookError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Audiobooks
      .addCase(fetchAudiobooks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAudiobooks.fulfilled, (state, action) => {
        state.loading = false;
        state.audiobooks = action.payload.audiobooks;
        state.totalItems = action.payload.totalItems;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(fetchAudiobooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Audiobook
      .addCase(createAudiobook.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAudiobook.fulfilled, (state, action) => {
        state.loading = false;
        state.audiobooks.unshift(action.payload);
      })
      .addCase(createAudiobook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Audiobook
      .addCase(updateAudiobook.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAudiobook.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.audiobooks.findIndex((a) => a.id === action.payload.id);
        if (index !== -1) {
          state.audiobooks[index] = action.payload;
        }
      })
      .addCase(updateAudiobook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Audiobook
      .addCase(deleteAudiobook.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAudiobook.fulfilled, (state, action) => {
        state.loading = false;
        state.audiobooks = state.audiobooks.filter((a) => a.id !== action.payload);
      })
      .addCase(deleteAudiobook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Toggle Status
      .addCase(toggleAudiobookStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleAudiobookStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.audiobooks.findIndex((a) => a.id === action.payload.id);
        if (index !== -1) {
          state.audiobooks[index].status = action.payload.status;
        }
      })
      .addCase(toggleAudiobookStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAudiobookError } = audiobookSlice.actions;
export default audiobookSlice.reducer;
