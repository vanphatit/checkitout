"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch } from "@/hooks";
import { googleOAuthLogin } from "@/store/slices";
import api from "@/lib/axios";
import { Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function OAuthCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get("token");

      if (!token) {
        setError("No authentication token received");
        setTimeout(() => router.push("/login"), 2000);
        return;
      }

      try {
        // Fetch user data using the access token
        const response = await api.get("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Store in Redux (same as regular login)
        dispatch(
          googleOAuthLogin({
            user: response.data.data?.user || response.data.user,
            accessToken: token,
          })
        );

        // Redirect to dashboard
        router.push("/");
      } catch (err) {
        console.error("OAuth login failed:", err);
        setError("Login failed. Please try again.");
        setTimeout(() => router.push("/login"), 2000);
      }
    };

    handleCallback();
  }, [searchParams, router, dispatch]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>OAuth Login</CardTitle>
          <CardDescription>
            {error ? error : "Completing your login..."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          {!error && (
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          )}
          {error && (
            <p className="mt-4 text-sm text-red-600">
              Redirecting to login page...
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>OAuth Login</CardTitle>
            <CardDescription>Loading...</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    }>
      <OAuthCallbackContent />
    </Suspense>
  );
}
