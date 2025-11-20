"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, AlertCircle, Loader2, Mail } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAppDispatch } from "@/hooks";
import { verifyEmail } from "@/store/slices";

export function EmailVerificationForm() {
  const [status, setStatus] = useState<
    "loading" | "success" | "error" | "no-token"
  >("loading");
  const [message, setMessage] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("no-token");
      return;
    }

    const verifyEmailToken = async () => {
      try {
        const result = await dispatch(verifyEmail({ token }));
        if (verifyEmail.fulfilled.match(result)) {
          setStatus("success");
          setMessage(result.payload.message);
        } else {
          setStatus("error");
          setMessage((result.payload as string) || "Verification failed");
        }
      } catch {
        setStatus("error");
        setMessage("An unexpected error occurred");
      }
    };

    verifyEmailToken();
  }, [searchParams, dispatch]);

  const handleGoToLogin = () => {
    router.push("/login");
  };

  if (status === "no-token") {
    return (
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6 text-orange-600" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Invalid Verification Link
          </CardTitle>
          <CardDescription>
            The verification link is invalid or missing required parameters.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Please check your email for the correct verification link, or
            request a new one.
          </p>
          <div className="flex flex-col space-y-3">
            <Button onClick={handleGoToLogin} className="w-full">
              Go to Login
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/resend-verification">Resend Verification Email</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (status === "loading") {
    return (
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Verifying Your Email
          </CardTitle>
          <CardDescription>
            Please wait while we verify your email address...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (status === "success") {
    return (
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-600">
            Email Verified!
          </CardTitle>
          <CardDescription>
            {message || "Your email has been successfully verified."}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            You can now sign in to your account and start using CheckItOut.
          </p>
          <Button onClick={handleGoToLogin} className="w-full">
            Sign In to Your Account
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Error state
  return (
    <Card className="w-full max-w-lg">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-6 h-6 text-red-600" />
        </div>
        <CardTitle className="text-2xl font-bold text-red-600">
          Verification Failed
        </CardTitle>
        <CardDescription>
          {message || "We couldn't verify your email address."}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-sm text-muted-foreground">
          The verification link may have expired or been used already. You can
          request a new verification email.
        </p>
        <div className="flex flex-col space-y-3">
          <Button asChild variant="outline" className="w-full">
            <Link href="/resend-verification">
              <Mail className="mr-2 h-4 w-4" />
              Resend Verification Email
            </Link>
          </Button>
          <Button onClick={handleGoToLogin} variant="ghost" className="w-full">
            Back to Login
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
