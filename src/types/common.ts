export interface UIState {
  theme: "light" | "dark" | "system";
  sidebarOpen: boolean;
  loading: boolean;
}

export interface AppError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
