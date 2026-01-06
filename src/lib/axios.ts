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
  // Do not attach access token when calling refresh endpoint.
  if (config.url?.includes("/auth/refresh-token")) {
    return config;
  }
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

    // Don't attempt refresh if the failed request was to refresh endpoint itself
    if (originalRequest?.url?.includes("/auth/refresh-token")) {
      tokenStorage.clearAccessToken();
      return Promise.reject(error);
    }

    // Don't attempt refresh for auth endpoints (login, register, etc.)
    // These endpoints are expected to fail with 401 if credentials are invalid
    const authEndpoints = [
      "/auth/login",
      "/auth/register",
      "/auth/forgot-password",
      "/auth/verify-email",
      "/auth/resend-verification",
    ];

    const isAuthEndpoint = authEndpoints.some((endpoint) =>
      originalRequest?.url?.includes(endpoint)
    );

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthEndpoint // Don't refresh for auth endpoints
    ) {
      originalRequest._retry = true;

      try {
        const response = await api.post<{ accessToken: string }>(
          "/auth/refresh-token"
        );
        const payload =
          (
            response.data as { accessToken?: string } & {
              data?: { accessToken?: string };
            }
          ).data ?? response.data;
        const { accessToken } = payload as { accessToken?: string };
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
        // Only redirect to login if we're not already on an auth page
        if (typeof window !== "undefined" && !isAuthEndpoint) {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
