import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to CheckItOut
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Your modern digital solution built with Next.js, React, and
            TypeScript
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>🚀 Modern Stack</CardTitle>
              <CardDescription>
                Built with the latest technologies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-left space-y-2">
                <li>✓ Next.js 15 with App Router</li>
                <li>✓ React 19 with TypeScript</li>
                <li>✓ Tailwind CSS & shadcn/ui</li>
                <li>✓ Redux Toolkit for state management</li>
                <li>✓ Axios for API communication</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🔐 Authentication Ready</CardTitle>
              <CardDescription>Complete auth system included</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-left space-y-2">
                <li>✓ Login & Registration</li>
                <li>✓ Password reset functionality</li>
                <li>✓ JWT token management</li>
                <li>✓ Protected routes</li>
                <li>✓ Form validation with Zod</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="bg-[#1868db] hover:bg-[#1557c7]">
            <Link href="/login">Sign In</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-[#1868db] text-[#1868db] hover:bg-[#1868db] hover:text-white"
          >
            <Link href="/register">Create Account</Link>
          </Button>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <p>
            Need help getting started? Check out the{" "}
            <Link href="/dashboard" className="text-primary hover:underline">
              dashboard
            </Link>{" "}
            to see what&apos;s available.
          </p>
        </div>
      </div>
    </div>
  );
}
