export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: "PENDING" | "ACTIVE" | "INACTIVE";
  role: "CUSTOMER" | "ADMIN" | "SELLER";
  avatar?: string | null;
  phone?: string | null;
  emailVerifiedAt?: string | null;
  lastLoginAt?: string | null;
  lastLoginIp?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isCheckingAuth: boolean;
  isInitialized: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string; // Only used for frontend validation, not sent to API
}

export interface RegisterApiData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface AuthResponse {
  message: string;
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface VerifyEmailData {
  token: string;
}

export interface ResendVerificationData {
  email: string;
}
