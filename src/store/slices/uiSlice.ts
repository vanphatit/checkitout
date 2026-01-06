import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UIState } from "@/types/common";

const initialState: UIState = {
  theme: "system",
  sidebarOpen: true,
  loading: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<"light" | "dark" | "system">) => {
      state.theme = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setTheme, toggleSidebar, setSidebarOpen, setLoading } =
  uiSlice.actions;
export default uiSlice.reducer;
