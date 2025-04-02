import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_BASE_URL = "http://10.0.2.2:3000/api/book"; // Backend URL for Android Emulator

// ✅ Upload Book Image
export const uploadImage = createAsyncThunk(
  "books/uploadImage",
  async ({ image, token }, { rejectWithValue }) => {
    try {
      let formData = new FormData();
      formData.append("image", {
        uri: image, // Path to image
        name: "upload.jpg",
        type: "image/jpeg",
      });

      const response = await fetch(`${API_BASE_URL}/uploadimage`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Image upload failed.");

      return data.url; // Ensure backend returns image URL
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ✅ Fetch Books with Pagination
export const fetchBooks = createAsyncThunk(
  "books/fetchBooks",
  async ({ page = 1, limit = 3 }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      // if (!token) throw new Error("Unauthorized: No token found");

      const res = await fetch(
        `${API_BASE_URL}/getbook?page=${page}&limit=${limit}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        const errorMessage = await res.text();
        throw new Error(`Failed to fetch books: ${errorMessage}`);
      }

      const data = await res.json();

      return {
        books: data.books,
        totalBooks: data.totalBooks, // ✅ Store totalBooks from response
        page,
        limit,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ✅ Fetch Books By User
export const fetchUserBooks = createAsyncThunk(
  "books/fetchUserBooks",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const res = await fetch(`${API_BASE_URL}/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch user books");
      return await res.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ✅ Add Book
export const addBook = createAsyncThunk(
  "books/addBook",
  async ({ bookData, token }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/addbook`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bookData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add book.");

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ✅ Edit Book
export const editBook = createAsyncThunk(
  "books/editBook",
  async ({ id, bookData, token }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/edit/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bookData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to edit book.");

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ✅ Delete Book
export const deleteBook = createAsyncThunk(
  "books/deleteBook",
  async ( id, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const res = await fetch(`${API_BASE_URL}/delete/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to delete book.");
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ✅ Redux Slice
const bookSlice = createSlice({
  name: "books",
  initialState: {
    books: [],
    userBooks: [],
    loading: false,
    error: null,
    page: 1,
    totalBooks: 0, // ✅ Store totalBooks
    hasMore: true,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBooks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        const { books, totalBooks, page, limit } = action.payload;
        if (page === 1) {
          state.books = books; // ✅ Reset on first page load
        } else {
          state.books = [...state.books, ...books]; // ✅ Append new data
        }
        state.totalBooks = totalBooks;
        state.hasMore = state.books.length < totalBooks; // ✅ Check if more pages exist
        state.page = page;
        state.loading = false;
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      }) // ✅ Fetch User Books
      .addCase(fetchUserBooks.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserBooks.fulfilled, (state, action) => {
        state.loading = false;
        state.userBooks = action.payload.books || action.payload;
      })
      .addCase(fetchUserBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ✅ Add Book
      .addCase(addBook.fulfilled, (state, action) => {
        state.books.unshift(action.payload);
      })

      // ✅ Edit Book
      .addCase(editBook.fulfilled, (state, action) => {
        const index = state.books.findIndex(
          (book) => book._id === action.payload._id
        );
        if (index !== -1) {
          state.books[index] = action.payload;
        }
      })

      // ✅ Delete Book
      .addCase(deleteBook.fulfilled, (state, action) => {
        state.books = state.books.filter((book) => book._id !== action.payload);
      });
  },
});

export default bookSlice.reducer;
