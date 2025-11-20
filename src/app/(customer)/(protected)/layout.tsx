"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { RoleGuard } from "@/components/providers/RoleGuard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks";

function ProtectedCustomerContent({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isCheckingAuth, isInitialized, logout } = useAuth();
  const router = useRouter();
  const isResolvingAuth = isCheckingAuth || !isInitialized;

  useEffect(() => {
    if (!isResolvingAuth && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isResolvingAuth, router]);

  if (isResolvingAuth) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-muted-foreground border-b-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
      <div className="mt-8 space-y-8">{children}</div>
    </div>
  );
}

export default function ProtectedCustomerLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard allowedRoles={["CUSTOMER", "SELLER", "ADMIN"]}>
      <ProtectedCustomerContent>{children}</ProtectedCustomerContent>
    </RoleGuard>
  );
}
