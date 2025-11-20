import { useAppSelector, useAppDispatch } from "./redux";
import { logout, clearError } from "@/store/slices";

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    isCheckingAuth,
    isInitialized,
  } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleClearError = () => {
    dispatch(clearError());
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    isCheckingAuth,
    isInitialized,
    logout: handleLogout,
    clearError: handleClearError,
  };
};
