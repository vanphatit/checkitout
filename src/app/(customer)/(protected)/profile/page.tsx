"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Activity as ActivityIcon,
  AlertTriangle,
  Clock3,
  Loader2,
  Mail,
  MapPin,
  MonitorSmartphone,
  Phone,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

import { useAuth, useAppDispatch } from "@/hooks";
import { userService } from "@/services/userService";
import { setUser } from "@/store/slices";
import type { User } from "@/types/auth";
import type { UserActivity } from "@/types/users";
import {
  profileSchema,
  type ProfileFormData,
  changePasswordSchema,
  type ChangePasswordFormData,
} from "@/lib/validations";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const statusStyles: Record<User["status"], string> = {
  ACTIVE: "bg-green-100 text-green-700 border border-green-200",
  PENDING: "bg-yellow-100 text-yellow-700 border border-yellow-200",
  INACTIVE: "bg-gray-100 text-gray-700 border border-gray-200",
};

const formatDate = (value?: string | null) => {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
};

export default function ProfilePage() {
  const { user, isCheckingAuth } = useAuth();
  const dispatch = useAppDispatch();
  const [profile, setProfile] = useState<User | null>(user);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [profileLoading, setProfileLoading] = useState(false);
  const [activityLoading, setActivityLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [securityMessage, setSecurityMessage] = useState<string | null>(null);
  const [securityError, setSecurityError] = useState<string | null>(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      phone: user?.phone ?? "",
    },
  });

  const passwordForm = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  useEffect(() => {
    if (!user?.id) return;
    let isMounted = true;

    const fetchProfile = async () => {
      setProfileLoading(true);
      setProfileError(null);
      try {
        const data = await userService.getMyProfile();
        if (!isMounted) return;
        setProfile(data);
        form.reset({
          firstName: data.firstName ?? "",
          lastName: data.lastName ?? "",
          phone: data.phone ?? "",
        });
        dispatch(setUser(data));
      } catch (error) {
        if (!isMounted) return;
        setProfileError(
          error instanceof Error
            ? error.message
            : "Unable to load profile information"
        );
      } finally {
        if (isMounted) {
          setProfileLoading(false);
        }
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [dispatch, form, user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    let isMounted = true;

    const fetchActivities = async () => {
      setActivityLoading(true);
      try {
        const data = await userService.getUserActivities(user.id, {
          limit: 6,
        });
        if (isMounted) {
          setActivities(data);
        }
      } catch {
        if (isMounted) {
          setActivities([]);
        }
      } finally {
        if (isMounted) {
          setActivityLoading(false);
        }
      }
    };

    fetchActivities();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const profileCompletion = useMemo(() => {
    if (!profile) return 0;
    const fieldsToCheck = [
      profile.firstName,
      profile.lastName,
      profile.email,
      profile.phone,
    ];
    const filled = fieldsToCheck.filter(
      (value) => value && value !== ""
    ).length;
    return Math.round((filled / fieldsToCheck.length) * 100);
  }, [profile]);

  const onProfileSubmit = async (data: ProfileFormData) => {
    setProfileMessage(null);
    setProfileError(null);
    try {
      setProfileLoading(true);
      const updated = await userService.updateMyProfile({
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone ?? undefined,
      });
      setProfile(updated);
      dispatch(setUser(updated));
      setProfileMessage("Profile updated successfully");
    } catch (error) {
      setProfileError(
        error instanceof Error
          ? error.message
          : "Unable to update profile at the moment"
      );
    } finally {
      setProfileLoading(false);
    }
  };

  const onPasswordSubmit = async (data: ChangePasswordFormData) => {
    setSecurityMessage(null);
    setSecurityError(null);
    try {
      setIsUpdatingPassword(true);
      const message = await userService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      setSecurityMessage(message);
      passwordForm.reset();
    } catch (error) {
      setSecurityError(
        error instanceof Error
          ? error.message
          : "Unable to update password right now"
      );
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (!profile && (profileLoading || isCheckingAuth)) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-muted-foreground">
            Account Center
          </p>
          <h1 className="text-3xl font-semibold text-gray-900">
            Welcome back,{" "}
            {profile ? `${profile.firstName} ${profile.lastName}` : "Profile"} !
          </h1>
          <p className="text-gray-500">
            Manage your personal information, security preferences, and account
            activity in one place.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              profile
                ? statusStyles[profile.status]
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {profile?.status ?? "Unknown"}
          </span>
          <div className="rounded-full border border-gray-200 px-4 py-1 text-xs font-semibold text-gray-700">
            {profile?.role ?? "USER"}
          </div>
        </div>
      </div>

      {profileError && (
        <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4" />
          <span>{profileError}</span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Keep your personal details up to date for smoother experiences.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onProfileSubmit)}
                className="space-y-4"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your first name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your last name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <FormLabel>Email</FormLabel>
                    <Input
                      className="mt-2"
                      value={profile?.email ?? ""}
                      disabled
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="0912345678" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <p className="text-sm text-muted-foreground">
                    Updating your personal data helps us secure your account.
                  </p>
                  <Button type="submit" disabled={profileLoading}>
                    {profileLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Save changes
                  </Button>
                </div>
                {profileMessage && (
                  <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                    {profileMessage}
                  </div>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Security Controls</CardTitle>
            <CardDescription>
              Update your password regularly to keep your account secured.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...passwordForm}>
              <form
                onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={passwordForm.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter current password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter new password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="confirmNewPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm new password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Confirm new password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <span>
                      Use a unique password that you do not share elsewhere.
                    </span>
                  </div>
                  <Button type="submit" disabled={isUpdatingPassword}>
                    {isUpdatingPassword ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="mr-2 h-4 w-4" />
                    )}
                    {isUpdatingPassword ? "Updating..." : "Update password"}
                  </Button>
                </div>
                {securityMessage && (
                  <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                    {securityMessage}
                  </div>
                )}
                {securityError && (
                  <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {securityError}
                  </div>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ActivityIcon className="h-5 w-5 text-primary" />
            Account Activity
          </CardTitle>
          <CardDescription>
            Track recent changes and logins across your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activityLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading recent events...
            </div>
          ) : activities.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No recent account activities were found.
            </p>
          ) : (
            <div className="relative space-y-4">
              <div className="absolute left-4 top-2 bottom-2 w-px bg-gradient-to-b from-primary/30 via-gray-200 to-primary/30" />
              {activities.map((activity) => {
                const actionLabel = activity.action ?? "Activity";
                const actionUpper = actionLabel.toUpperCase();
                const tone =
                  actionUpper.includes("FAIL") || actionUpper.includes("ERROR")
                    ? "text-red-600 bg-red-50 border-red-100"
                    : actionUpper.includes("LOGIN")
                    ? "text-emerald-700 bg-emerald-50 border-emerald-100"
                    : actionUpper.includes("PASSWORD")
                    ? "text-amber-700 bg-amber-50 border-amber-100"
                    : "text-blue-700 bg-blue-50 border-blue-100";

                return (
                  <div
                    key={`${activity.id}-${activity.createdAt}`}
                    className="relative flex gap-3 pl-10"
                  >
                    <div className="absolute left-3 top-2 size-3 rounded-full border-2 border-white bg-primary shadow-sm" />
                    <div className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm transition hover:-translate-y-[1px] hover:shadow-md">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${tone}`}
                          >
                            {actionLabel}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock3 className="h-3.5 w-3.5" />
                            {formatDate(activity.createdAt)}
                          </span>
                        </div>
                        {activity.description && (
                          <p className="text-sm text-muted-foreground sm:text-right">
                            {activity.description}
                          </p>
                        )}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                        {activity.ipAddress && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-3 py-1">
                            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                            IP: {activity.ipAddress}
                          </span>
                        )}
                        {activity.device && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-3 py-1">
                            <MonitorSmartphone className="h-3.5 w-3.5 text-primary" />
                            {activity.device}
                          </span>
                        )}
                        {activity.location && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-3 py-1">
                            <MapPin className="h-3.5 w-3.5 text-primary" />
                            {activity.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
