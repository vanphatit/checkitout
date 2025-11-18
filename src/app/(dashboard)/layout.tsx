"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/hooks";
import { RoleGuard } from "@/components/providers/RoleGuard";
import { Button } from "@/components/ui/button";

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isCheckingAuth, isInitialized, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isResolvingAuth = isCheckingAuth || !isInitialized;
  const normalizedRole = user?.role?.toUpperCase();

  const navItems = useMemo(
    () => [
      {
        href: "/dashboard",
        label: "Overview",
        roles: ["CUSTOMER", "SELLER", "ADMIN"],
      },
      {
        href: "/profile",
        label: "Profile",
        roles: ["CUSTOMER", "SELLER", "ADMIN"],
      },
      {
        href: "/admin",
        label: "Admin",
        roles: ["ADMIN"],
      },
    ],
    []
  );

  const accessibleNav = navItems.filter((item) =>
    normalizedRole ? item.roles.includes(normalizedRole) : false
  );

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
          <div className="flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-xl font-semibold">CheckItOut Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Manage everything for your role from one centralized space.
              </p>
            </div>
            <nav className="flex flex-wrap items-center gap-2">
              {accessibleNav.map((item) => {
                const isActive =
                  pathname === item.href || pathname?.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">
                  {user ? `${user.firstName} ${user.lastName}` : "User"}
                </p>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {user?.role}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}

export default function ProtectedDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={["CUSTOMER", "SELLER", "ADMIN"]}>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </RoleGuard>
  );
}
