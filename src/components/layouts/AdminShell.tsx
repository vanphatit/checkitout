"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LayoutGrid, LogOut, ShieldCheck, Store } from "lucide-react";

import { RoleGuard } from "@/components/providers/RoleGuard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks";

type AdminShellProps = {
  children: ReactNode;
};

export function AdminShell({ children }: AdminShellProps) {
  const { user, isAuthenticated, isCheckingAuth, isInitialized, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isResolvingAuth = isCheckingAuth || !isInitialized;

  const navItems = useMemo(
    () => [
      { href: "/admin", label: "Admin", icon: ShieldCheck, roles: ["ADMIN"] },
      { href: "/seller", label: "Seller", icon: Store, roles: ["SELLER"] },
      { href: "/dashboard", label: "Customer View", icon: LayoutGrid, roles: ["ADMIN", "SELLER"] },
    ],
    []
  );

  const availableNav = navItems.filter((item) =>
    user?.role ? item.roles.includes(user.role) : false
  );

  useEffect(() => {
    if (!isResolvingAuth && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isResolvingAuth, router]);

  if (isResolvingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-neutral-900">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-neutral-200 border-b-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <RoleGuard allowedRoles={["ADMIN", "SELLER"]}>
      <div className="min-h-screen bg-gradient-to-b from-neutral-50 via-white to-neutral-50 text-neutral-900">
        <header className="sticky top-0 z-30 border-b border-black/20 bg-black text-white shadow-lg">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-lg font-semibold text-white ring-1 ring-white/15">
                C!
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.28em] text-gray-200">
                  Control Center
                </p>
                <p className="text-sm font-semibold text-white">
                  Admin & Seller workspace
                </p>
              </div>
            </div>
            <nav className="flex items-center gap-2">
              {availableNav.map(({ href, label, icon: Icon }) => {
                const active =
                  pathname === href ||
                  pathname?.startsWith(`${href}/`) ||
                  (href === "/seller" && pathname?.startsWith("/seller"));
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`group flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      active
                        ? "bg-white text-black shadow-sm"
                        : "bg-white/10 text-gray-100 hover:bg-white/20"
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${active ? "text-black" : "text-gray-200"}`} />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-white">
                  {user ? `${user.firstName} ${user.lastName}` : "User"}
                </p>
                <p className="text-[11px] uppercase tracking-[0.2em] text-gray-300">
                  {user?.role}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-white/30 bg-white/10 text-white hover:bg-white/20"
                onClick={logout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-6 py-10">
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl shadow-black/5">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-primary">
                  {user?.role === "ADMIN" ? "Administrator" : "Seller"} mode
                </p>
                <h1 className="text-2xl font-semibold text-neutral-900">
                  {user?.role === "ADMIN" ? "System oversight" : "Selling console"}
                </h1>
                <p className="text-sm text-neutral-500">
                  Keep operations running smoothly with a clear, light workspace.
                </p>
              </div>
              <div className="hidden rounded-full border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-600 md:flex md:items-center md:gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span>Secured session</span>
              </div>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 shadow-inner shadow-black/5">
              {children}
            </div>
          </div>
        </main>

        <footer className="border-t border-neutral-200 bg-white">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-6 text-sm text-neutral-600 sm:flex-row sm:items-center sm:justify-between">
            <span>CheckItOut Control • Light workspace</span>
            <span className="text-neutral-500">Support: ops@checkitout.example</span>
          </div>
        </footer>
      </div>
    </RoleGuard>
  );
}
