import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage"; // ✅ Import AsyncStorage

const initialState = {
  user: null,
  token: null,
  isLoading: false,
  isCheckAuth: true,
  error: null,
};

// ✅ Load user & token from AsyncStorage on app start
export const loadUser = createAsyncThunk("auth/loadUser", async () => {
  const token = await AsyncStorage.getItem("token");
  const user = await AsyncStorage.getItem("user");
  return { token: JSON.parse(token), user: JSON.parse(user) };
});

// ✅ Register User
export const registerUser = createAsyncThunk(
  "auth/register",
  async ({ username, password, email }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "http://10.0.2.2:3000/api/auth/register",
        { username, password, email },
        { withCredentials: true }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Registration failed"
      );
    }
  }
);

// ✅ Login User
export const loginUser = createAsyncThunk(
  "auth/login",
  async ({ password, email }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "http://10.0.2.2:3000/api/auth/login",
        { password, email },
        { withCredentials: true }
      );

      // ✅ Store token & user in AsyncStorage
      await AsyncStorage.setItem("token", JSON.stringify(response.data.token));
      await AsyncStorage.setItem("user", JSON.stringify(response.data.user));

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Login failed"
      );
    }
  }
);

// ✅ Logout User
export const logoutUser = createAsyncThunk("auth/logout", async () => {
  await AsyncStorage.removeItem("token");
  await AsyncStorage.removeItem("user");
  return null;
});

// ✅ Auth Slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // ✅ Load User Cases
      .addCase(loadUser.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isCheckAuth = false
      })

      // ✅ Register User Cases
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ✅ Login User Cases
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ✅ Logout User Cases
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
      });
  },
});

export default authSlice.reducer;
