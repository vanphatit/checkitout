"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { RoleGuard } from "@/components/providers/RoleGuard";
import { BarChart3 } from "lucide-react";

export default function AdminHomePage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to dashboard immediately
        router.replace("/admin/dashboard");
    }, [router]);

    return (
        <RoleGuard allowedRoles={['ADMIN']}>
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <BarChart3 className="h-12 w-12 animate-pulse mx-auto mb-4 text-primary" />
                    <p className="text-muted-foreground">Đang chuyển hướng đến Dashboard...</p>
                </div>
            </div>
        </RoleGuard>
    );
}
