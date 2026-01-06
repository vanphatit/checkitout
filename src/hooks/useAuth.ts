import { useAppSelector, useAppDispatch } from "./redux";
import { clearError, logoutUser } from "@/store/slices";
import { useRouter } from "next/navigation";

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    isCheckingAuth,
    isInitialized,
  } = useAppSelector((state) => state.auth);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    router.push("/login");
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
