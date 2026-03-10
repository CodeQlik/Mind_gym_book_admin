import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { bookApi } from "../../api/bookApi";

export const fetchBooks = createAsyncThunk(
  "books/fetchAll",
  async ({ page = 1, limit = 10, status = "" } = {}, { rejectWithValue }) => {
    try {
      const response = await bookApi.getAllBooks(page, limit, status);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch books",
      );
    }
  },
);

export const toggleBookStatus = createAsyncThunk(
  "books/toggleStatus",
  async (id, { rejectWithValue }) => {
    try {
      const response = await bookApi.toggleBookStatus(id);
      // Handle { success: true, message: "...", data: { ...book } }
      const bookData = response.data || response;
      return { id, data: bookData };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to toggle status",
      );
    }
  },
);

export const createBook = createAsyncThunk(
  "books/create",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await bookApi.createBook(formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create book",
      );
    }
  },
);

export const deleteBookThunk = createAsyncThunk(
  "books/delete",
  async (id, { rejectWithValue }) => {
    try {
      await bookApi.deleteBook(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete book",
      );
    }
  },
);

export const updateBookThunk = createAsyncThunk(
  "books/update",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await bookApi.updateBook(id, formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update book",
      );
    }
  },
);

export const searchBooksThunk = createAsyncThunk(
  "books/search",
  async ({ query, status = "", page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await bookApi.searchBooks(query, status, page, limit);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Search failed");
    }
  },
);

const initialState = {
  books: [],
  totalItems: 0,
  totalPages: 0,
  currentPage: 1,
  loading: false,
  error: null,
};

const bookSlice = createSlice({
  name: "books",
  initialState,
  reducers: {
    clearBookError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBooks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.loading = false;
        const data = action.payload.data || action.payload;
        state.books = data.books || [];
        state.totalItems = data.totalItems || 0;
        state.totalPages = data.totalPages || 0;
        state.currentPage = data.currentPage || 1;
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Toggle Status
      .addCase(toggleBookStatus.fulfilled, (state, action) => {
        const index = state.books.findIndex(
          (book) =>
            book.id === action.payload.id || book._id === action.payload.id,
        );
        if (index !== -1) {
          state.books[index] = action.payload.data;
        }
      })
      // Create
      .addCase(createBook.pending, (state) => {
        state.loading = true;
      })
      .addCase(createBook.fulfilled, (state, action) => {
        state.loading = false;
        // The API response now follows { success: true, data: { ...book } }
        const newBook = action.payload.data || action.payload;
        state.books.unshift(newBook);
      })
      .addCase(createBook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update
      .addCase(updateBookThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateBookThunk.fulfilled, (state, action) => {
        state.loading = false;
        const updatedBook = action.payload.data || action.payload;
        const targetId =
          action.payload.id ||
          (action.payload.data &&
            (action.payload.data.id || action.payload.data._id));
        const index = state.books.findIndex(
          (book) =>
            (book.id && book.id === targetId) ||
            (book._id && book._id === targetId),
        );
        if (index !== -1) {
          state.books[index] = updatedBook;
        }
      })
      .addCase(updateBookThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete
      .addCase(deleteBookThunk.fulfilled, (state, action) => {
        state.books = state.books.filter(
          (book) => book.id !== action.payload && book._id !== action.payload,
        );
        state.totalItems = Math.max(0, state.totalItems - 1);
      })
      // Search
      .addCase(searchBooksThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchBooksThunk.fulfilled, (state, action) => {
        state.loading = false;
        const data = action.payload.data || action.payload;
        state.books = data.books || [];
        state.totalItems = data.totalItems || 0;
        state.totalPages = data.totalPages || 0;
        state.currentPage = data.currentPage || 1;
      })
      .addCase(searchBooksThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearBookError } = bookSlice.actions;
export default bookSlice.reducer;
