"use client";

import { useAuth } from "@/hooks";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardPage() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back,{" "}
          {user?.firstName ? `${user.firstName} ${user.lastName}` : "User"}!
        </h1>
        <p className="text-gray-600 mt-2">
          Here&apos;s an overview of your account and recent activity.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>
                <strong>Name:</strong> {user?.firstName} {user?.lastName}
              </p>
              <p>
                <strong>Email:</strong> {user?.email}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                    user?.status === "ACTIVE"
                      ? "bg-green-100 text-green-800"
                      : user?.status === "PENDING"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {user?.status}
                </span>
              </p>
              <p>
                <strong>Member since:</strong>{" "}
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : "Unknown"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                Update Profile
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Change Password
              </Button>
              <Button variant="outline" className="w-full justify-start">
                View Settings
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Application health and metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>API Status:</span>
                <span className="text-green-600">✓ Online</span>
              </div>
              <div className="flex justify-between">
                <span>Database:</span>
                <span className="text-green-600">✓ Connected</span>
              </div>
              <div className="flex justify-between">
                <span>Cache:</span>
                <span className="text-green-600">✓ Active</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>
            Welcome to your dashboard! Here are some things you can do:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">
                🔧 Customize Your Experience
              </h3>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Update your profile information</li>
                <li>• Change your password</li>
                <li>• Set up notifications</li>
                <li>• Configure preferences</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">📊 Explore Features</h3>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• View analytics and reports</li>
                <li>• Manage your data</li>
                <li>• Access integrations</li>
                <li>• Browse documentation</li>
              </ul>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t flex justify-between items-center">
            <p className="text-sm text-gray-500">
              Need help? Check out our documentation or contact support.
            </p>
            <Button onClick={handleLogout} variant="outline">
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
