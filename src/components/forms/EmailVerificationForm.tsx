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
import { useToast } from "@/hooks/use-toast";

export function EmailVerificationForm() {
  const [status, setStatus] = useState<
    "loading" | "success" | "error" | "no-token"
  >("loading");
  const [message, setMessage] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { toast } = useToast();

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
          const errorMsg = (result.payload as string) || "Verification failed";
          setStatus("error");
          setMessage(errorMsg);
          toast({
            variant: "destructive",
            title: "Verification Failed",
            description: errorMsg,
          });
        }
      } catch {
        const errorMsg = "An unexpected error occurred";
        setStatus("error");
        setMessage(errorMsg);
        toast({
          variant: "destructive",
          title: "Error",
          description: errorMsg,
        });
      }
    };

    verifyEmailToken();
  }, [searchParams, dispatch]);

  const handleGoToLogin = () => {
    router.push("/login");
  };

  if (status === "no-token") {
    return (
      <Card className="w-full max-w-lg shadow-lg border-orange-100">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-50 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-orange-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-orange-600">
            Invalid Verification Link
          </CardTitle>
          <CardDescription className="text-base">
            The verification link is invalid or missing required parameters.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
            <p className="text-sm text-gray-700">
              Please check your email for the correct verification link, or
              request a new one.
            </p>
          </div>
          <div className="flex flex-col space-y-3">
            <Button
              onClick={handleGoToLogin}
              className="w-full bg-primary hover:bg-primary/90"
            >
              Go to Login
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/resend-verification">
                <Mail className="mr-2 h-4 w-4" />
                Resend Verification Email
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (status === "loading") {
    return (
      <Card className="w-full max-w-lg shadow-lg border-blue-100">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
          <CardTitle className="text-2xl font-bold text-blue-600">
            Verifying Your Email
          </CardTitle>
          <CardDescription className="text-base">
            Please wait while we verify your email address...
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <p className="text-sm text-gray-700">
              This should only take a moment
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (status === "success") {
    return (
      <Card className="w-full max-w-lg shadow-lg border-green-100">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-100 to-green-50 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-600">
            Email Verified!
          </CardTitle>
          <CardDescription className="text-base">
            {message || "Your email has been successfully verified."}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="bg-green-50 rounded-lg p-4 border border-green-100">
            <p className="text-sm text-gray-700">
              You can now sign in to your account and start using CheckItOut.
            </p>
          </div>
          <Button
            onClick={handleGoToLogin}
            className="w-full bg-primary hover:bg-primary/90 h-11"
          >
            Sign In to Your Account
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Error state
  return (
    <Card className="w-full max-w-lg shadow-lg border-red-100">
      <CardHeader className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-100 to-red-50 rounded-full flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <CardTitle className="text-2xl font-bold text-red-600">
          Verification Failed
        </CardTitle>
        <CardDescription className="text-base">
          {message || "We couldn't verify your email address."}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-6">
        <div className="bg-red-50 rounded-lg p-4 border border-red-100">
          <p className="text-sm text-gray-700">
            The verification link may have expired or been used already. You can
            request a new verification email.
          </p>
        </div>
        <div className="flex flex-col space-y-3">
          <Button asChild className="w-full bg-primary hover:bg-primary/90">
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
