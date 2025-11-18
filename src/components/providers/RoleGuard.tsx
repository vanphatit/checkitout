"use client";

import { useAuth } from "@/hooks";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { getRoleFromToken } from "@/lib/jwt";
import { tokenStorage } from "@/lib/tokenStorage";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { user, isAuthenticated, isCheckingAuth, isInitialized } = useAuth();
  const router = useRouter();
  const normalizedRoles = useMemo(
    () => allowedRoles.map((role) => role.toUpperCase()),
    [allowedRoles]
  );
  const isResolvingAuth = isCheckingAuth || !isInitialized;

  useEffect(() => {
    if (isResolvingAuth) return;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const roleFromState = user?.role?.toUpperCase();
    const tokenRole =
      roleFromState ||
      getRoleFromToken(tokenStorage.getAccessToken() ?? undefined)?.toUpperCase();

    if (!tokenRole || !normalizedRoles.includes(tokenRole)) {
      router.push("/forbidden");
    }
  }, [
    isResolvingAuth,
    isAuthenticated,
    normalizedRoles,
    router,
    user,
  ]);

  if (isResolvingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-24 w-24 border-b-2 border-primary"></div>
      </div>
    );
  }

  const canRender =
    isAuthenticated &&
    user?.role &&
    normalizedRoles.includes(user.role.toUpperCase());

  if (canRender) {
    return <>{children}</>;
  }

  return null;
}

