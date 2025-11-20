"use client";

import { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "@/store";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { checkAuth } from "@/store/slices";

interface ReduxProviderProps {
  children: React.ReactNode;
}

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { isInitialized, isCheckingAuth } = useAppSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (!isInitialized && !isCheckingAuth) {
      dispatch(checkAuth());
    }
  }, [dispatch, isCheckingAuth, isInitialized]);

  return <>{children}</>;
}

export function ReduxProvider({ children }: ReduxProviderProps) {
  return (
    <Provider store={store}>
      <AuthInitializer>{children}</AuthInitializer>
    </Provider>
  );
}
