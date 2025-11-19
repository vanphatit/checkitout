import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  AuthState,
  User,
  LoginCredentials,
  RegisterData,
  RegisterApiData,
  ForgotPasswordData,
  AuthResponse,
  ApiResponse,
} from "@/types/auth";
import api from "@/lib/axios";
import { getRoleFromToken, isTokenExpired } from "@/lib/jwt";
import { tokenStorage } from "@/lib/tokenStorage";

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isCheckingAuth: false,
  isInitialized: false,
  error: null,
};

// Async thunks
const extractResponseData = <T>(
  payload: ApiResponse<T> | { data: T } | T
): T => {
  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    (payload as { data?: T }).data !== undefined
  ) {
    return (payload as { data: T }).data;
  }
  return payload as T;
};

export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await api.post<AuthResponse | ApiResponse<AuthResponse>>(
        "/auth/login",
        credentials
      );
      const { user, accessToken } = extractResponseData(response.data);

      if (accessToken) {
        tokenStorage.setAccessToken(accessToken);
      }

      let resolvedUser = user;
      if (resolvedUser && !resolvedUser.role) {
        const tokenRole = getRoleFromToken(accessToken);
        if (tokenRole) {
          resolvedUser = { ...resolvedUser, role: tokenRole as User["role"] };
        }
      }

      return resolvedUser;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Login failed");
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData: RegisterData, { rejectWithValue }) => {
    try {
      // Remove confirmPassword before sending to API
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const {
        confirmPassword,
        ...apiData
      }: { confirmPassword: string } & RegisterApiData = userData;
      const response = await api.post<{ message: string; user: User }>(
        "/auth/register",
        apiData
      );
      const { user } = response.data;

      // Registration doesn't return tokens, user needs to verify email first

      return user;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Registration failed");
    }
  }
);

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (data: ForgotPasswordData, { rejectWithValue }) => {
    try {
      await api.post("/auth/forgot-password", data);
      return "Password reset email sent";
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to send reset email");
    }
  }
);

export const verifyEmail = createAsyncThunk(
  "auth/verifyEmail",
  async (data: { token: string }, { rejectWithValue }) => {
    try {
      const response = await api.post<{ message: string; user: User }>(
        "/auth/verify-email",
        data
      );
      return { message: response.data.message, user: response.data.user };
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Email verification failed");
    }
  }
);

export const refreshTokens = createAsyncThunk(
  "auth/refreshToken",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post<{ accessToken: string; user?: User }>(
        "/auth/refresh-token"
      );
      const { accessToken, user } = response.data;
      if (!accessToken) {
        return rejectWithValue("Missing access token");
      }
      tokenStorage.setAccessToken(accessToken);
      return { accessToken, user };
    } catch (error: unknown) {
      tokenStorage.clearAccessToken();
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Token refresh failed");
    }
  }
);

export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async (_, thunkAPI) => {
    const token = tokenStorage.getAccessToken();
    if (!token) {
      return thunkAPI.rejectWithValue("No access token");
    }
    if (isTokenExpired(token)) {
      tokenStorage.clearAccessToken();
      return thunkAPI.rejectWithValue("Token expired");
    }

    try {
      const res = await api.get<{ user?: User } | User>("/auth/me");
      const user = "user" in res.data ? res.data.user : res.data;

      if (user && !user.role) {
        const tokenRole = getRoleFromToken(token);
        if (tokenRole) {
          user.role = tokenRole as User["role"];
        }
      }

      if (!user) {
        return thunkAPI.rejectWithValue("User not found");
      }

      return user;
    } catch (e) {
      tokenStorage.clearAccessToken();
      return thunkAPI.rejectWithValue("Session invalid");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      state.isCheckingAuth = false;
      state.isInitialized = true;
      tokenStorage.clearAccessToken();
    },
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    setUserRole(state, action: PayloadAction<string>) {
      if (state.user) {
        state.user.role = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isInitialized = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = false;
        state.isInitialized = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Check Auth
      .addCase(checkAuth.pending, (state) => {
        state.isCheckingAuth = true;
        state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isCheckingAuth = false;
        state.isInitialized = true;
        state.user = action.payload as User;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.isCheckingAuth = false;
        state.isInitialized = true;
        state.user = null;
        state.isAuthenticated = false;
        state.error = (action.payload as string) ?? null;
      });
  },
});

export const { logout, setUserRole, clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
