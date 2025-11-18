"use client";

import { useAuth } from "@/hooks";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
// 1. Import RoleGuard (giả sử bạn đã tạo nó)
import { RoleGuard } from "@/components/providers/RoleGuard";

// 2. Component layout gốc của bạn
function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isCheckingAuth, isInitialized } = useAuth();
  const router = useRouter();
  const isResolvingAuth = isCheckingAuth || !isInitialized;

  useEffect(() => {
    if (!isResolvingAuth && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isResolvingAuth, router]);

  if (isResolvingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">CheckItOut Dashboard</h1>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}

// 3. Bọc layout gốc bằng RoleGuard
export default function ProtectedDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Chỉ cho phép CUSTOMER và ADMIN vào dashboard
  return (
    <RoleGuard allowedRoles={["CUSTOMER", "ADMIN"]}>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </RoleGuard>
  );
}
