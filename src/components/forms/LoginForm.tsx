"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, Mail, Phone, AtSign } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
  FormDescription,
} from "@/components/ui/form";

import { loginSchema, type LoginFormData } from "@/lib/validations";
import { useAppDispatch } from "@/hooks";
import { loginUser } from "@/store/slices";

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email");
  const [needsVerification, setNeedsVerification] = useState(false);
  const [userIdentifier, setUserIdentifier] = useState("");
  const router = useRouter();
  const dispatch = useAppDispatch();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      phone: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const result = await dispatch(loginUser(data));
      if (loginUser.fulfilled.match(result)) {
        router.push("/");
      } else if (loginUser.rejected.match(result)) {
        const error = result.payload as string;
        if (error.includes("verify your email") || error.includes("PENDING")) {
          setUserIdentifier(data.email || data.phone || "");
          setNeedsVerification(true);
        }
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const isLoading = form.formState.isSubmitting;

  if (needsVerification) {
    return (
      <Card className="w-full max-w-lg shadow-lg border-orange-100">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-50 rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-orange-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-orange-600">
            Email Verification Required
          </CardTitle>
          <CardDescription className="text-base">
            Please verify your email address before signing in
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
            <p className="text-sm text-gray-700">
              We&apos;ve sent a verification email to{" "}
              <span className="font-semibold text-orange-700">
                {userIdentifier}
              </span>
            </p>
            <p className="text-xs text-gray-600 mt-2">
              Please check your email and click the verification link to
              activate your account.
            </p>
          </div>
          <div className="flex flex-col space-y-3">
            <Button asChild className="w-full bg-primary hover:bg-primary/90">
              <Link href="/resend-verification">
                <Mail className="mr-2 h-4 w-4" />
                Resend Verification Email
              </Link>
            </Button>
            <Button
              onClick={() => setNeedsVerification(false)}
              variant="outline"
              className="w-full"
            >
              Try Different Account
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-lg shadow-lg">
      <CardHeader className="text-center space-y-2">
        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
          Welcome back
        </CardTitle>
        <CardDescription className="text-base">
          Sign in to continue to CheckItOut
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Login Method Toggle */}
        <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
          <button
            type="button"
            onClick={() => {
              setLoginMethod("email");
              form.setValue("phone", "");
            }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              loginMethod === "email"
                ? "bg-white text-primary shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <AtSign className="inline-block w-4 h-4 mr-2" />
            Email
          </button>
          <button
            type="button"
            onClick={() => {
              setLoginMethod("phone");
              form.setValue("email", "");
            }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              loginMethod === "phone"
                ? "bg-white text-primary shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Phone className="inline-block w-4 h-4 mr-2" />
            Phone
          </button>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {loginMethod === "email" ? (
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
            ) : (
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type="tel"
                          placeholder="0912345678"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormDescription className="text-xs">
                      Enter Vietnamese phone number (10 digits, starts with 0)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Password</FormLabel>
                    <Link
                      href="/forgot-password"
                      className="text-xs text-primary hover:text-primary/80 font-medium"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword((prev) => !prev)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 h-11"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </Form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-primary hover:text-primary/80"
            >
              Sign up
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
