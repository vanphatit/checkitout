import axios, { AxiosRequestConfig } from "axios";
import { tokenStorage } from "./tokenStorage";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9091";

// Create axios instance
const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  timeout: 10000,
  withCredentials: true, // Important for refresh token cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as
      | (AxiosRequestConfig & { _retry?: boolean })
      | undefined;

    if (
      originalRequest?.url?.includes("/auth/refresh-token")
    ) {
      tokenStorage.clearAccessToken();
      return Promise.reject(error);
    }

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const response = await api.post<{ accessToken: string }>(
          "/auth/refresh-token"
        );
        const { accessToken } = response.data;
        if (!accessToken) {
          tokenStorage.clearAccessToken();
          throw error;
        }

        tokenStorage.setAccessToken(accessToken);
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        tokenStorage.clearAccessToken();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
