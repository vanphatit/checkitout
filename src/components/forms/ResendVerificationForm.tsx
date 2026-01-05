"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ArrowLeft, Mail, CheckCircle, AtSign } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  resendVerificationSchema,
  type ResendVerificationFormData,
} from "@/lib/validations";
import api from "@/lib/axios";

export function ResendVerificationForm() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const form = useForm<ResendVerificationFormData>({
    resolver: zodResolver(resendVerificationSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ResendVerificationFormData) => {
    try {
      setError(null);
      await api.post("/auth/resend-verification", data);
      setSubmittedEmail(data.email);
      setIsSuccess(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to resend verification email");
      }
    }
  };

  const isLoading = form.formState.isSubmitting;

  if (isSuccess) {
    return (
      <Card className="w-full max-w-lg shadow-lg border-green-100">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-100 to-green-50 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-600">
            Verification Email Sent!
          </CardTitle>
          <CardDescription className="text-base">
            We&apos;ve sent a new verification link to your email
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <p className="text-sm text-gray-700">
              We&apos;ve sent a verification email to{" "}
              <span className="font-semibold text-blue-700">
                {submittedEmail}
              </span>
            </p>
            <p className="text-xs text-gray-600 mt-2">
              Please check your email (including spam folder) and click the
              verification link to activate your account.
            </p>
          </div>
          <div className="flex flex-col space-y-3">
            <Button asChild className="w-full bg-primary hover:bg-primary/90">
              <Link href="/login">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Sign In
              </Link>
            </Button>
            <Button
              onClick={() => setIsSuccess(false)}
              variant="outline"
              className="w-full"
            >
              Send to Different Email
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-lg shadow-lg">
      <CardHeader className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
          <Mail className="w-6 h-6 text-primary" />
        </div>
        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
          Resend Verification Email
        </CardTitle>
        <CardDescription className="text-base">
          Enter your email address to receive a new verification link
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="email"
                        placeholder="name@example.com"
                        className="pl-10"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 h-11"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Verification Email
                </>
              )}
            </Button>
          </form>
        </Form>

        <div className="pt-4 border-t">
          <Button asChild variant="ghost" className="w-full">
            <Link href="/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sign In
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
