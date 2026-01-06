"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Activity,
  AlertTriangle,
  BadgeCheck,
  Loader2,
  RefreshCw,
  Search,
  Shield,
  Trash2,
  UserPlus,
  Users as UsersIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useForm } from "react-hook-form";

import { RoleGuard } from "@/components/providers/RoleGuard";
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
import { useAppDispatch, useAuth } from "@/hooks";
import { userService } from "@/services/userService";
import type { User } from "@/types/auth";
import type { UserActivity, UsersListMeta } from "@/types/users";
import {
  adminCreateUserSchema,
  adminUpdateUserSchema,
  type AdminCreateUserFormData,
  type AdminUpdateUserFormData,
} from "@/lib/validations";
import { setUser } from "@/store/slices";

const PAGE_SIZE = 10;

const statusBadgeStyles: Record<User["status"], string> = {
  ACTIVE: "bg-green-100 text-green-700 border border-green-200",
  PENDING: "bg-yellow-100 text-yellow-700 border border-yellow-200",
  INACTIVE: "bg-gray-100 text-gray-700 border border-gray-200",
};

const defaultMeta: UsersListMeta = {
  total: 0,
  page: 1,
  limit: PAGE_SIZE,
  totalPages: 1,
};

function AdminManagementContent() {
  const dispatch = useAppDispatch();
  const { user: authUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [meta, setMeta] = useState<UsersListMeta>(defaultMeta);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedActivities, setSelectedActivities] = useState<UserActivity[]>(
    []
  );
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [activitiesError, setActivitiesError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | User["role"]>("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | User["status"]>(
    "ALL"
  );

  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);
  const [isDeletingUser, setIsDeletingUser] = useState(false);

  const [adminMessage, setAdminMessage] = useState<string | null>(null);
  const [adminError, setAdminError] = useState<string | null>(null);

  const createUserForm = useForm<AdminCreateUserFormData>({
    resolver: zodResolver(adminCreateUserSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      role: "SELLER",
      status: "ACTIVE",
    },
  });

  const updateUserForm = useForm<AdminUpdateUserFormData>({
    resolver: zodResolver(adminUpdateUserSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      role: "SELLER",
      status: "ACTIVE",
    },
  });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 400);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [roleFilter, statusFilter, debouncedSearch]);

  const fetchUsers = useCallback(async () => {
    setAdminError(null);
    setIsLoadingUsers(true);
    try {
      const response = await userService.getUsers({
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch || undefined,
        role: roleFilter === "ALL" ? undefined : roleFilter,
        status: statusFilter === "ALL" ? undefined : statusFilter,
      });

      setUsers(response.items);
      setMeta({
        total: response.meta.total,
        page: response.meta.page,
        limit: response.meta.limit || PAGE_SIZE,
        totalPages: response.meta.totalPages || 1,
      });
      setSelectedUser((current) => {
        if (!response.items.length) {
          return null;
        }
        if (current) {
          const stillExists = response.items.find(
            (item) => item.id === current.id
          );
          if (stillExists) {
            return stillExists;
          }
        }
        return response.items[0];
      });
    } catch (error) {
      setAdminError(
        error instanceof Error ? error.message : "Unable to load users"
      );
    } finally {
      setIsLoadingUsers(false);
      setIsRefreshing(false);
    }
  }, [debouncedSearch, page, roleFilter, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (!selectedUser?.id) {
      setSelectedActivities([]);
      return;
    }

    let isMounted = true;
    setActivitiesLoading(true);
    setActivitiesError(null);

    userService
      .getUserActivities(selectedUser.id, { limit: 5 })
      .then((data) => {
        if (isMounted) {
          setSelectedActivities(data);
        }
      })
      .catch((error) => {
        if (isMounted) {
          setSelectedActivities([]);
          setActivitiesError(
            error instanceof Error
              ? error.message
              : "Unable to load user activities"
          );
        }
      })
      .finally(() => {
        if (isMounted) {
          setActivitiesLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedUser?.id]);

  useEffect(() => {
    if (selectedUser) {
      updateUserForm.reset({
        firstName: selectedUser.firstName,
        lastName: selectedUser.lastName,
        email: selectedUser.email,
        phone: selectedUser.phone ?? "",
        role: selectedUser.role,
        status: selectedUser.status,
      });
    }
  }, [selectedUser, updateUserForm]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchUsers();
  };

  const handleCreateUser = async (values: AdminCreateUserFormData) => {
    setAdminMessage(null);
    setAdminError(null);
    try {
      setIsCreatingUser(true);
      await userService.createUser({
        ...values,
        phone: values.phone || undefined,
      });
      setAdminMessage("User created successfully");
      createUserForm.reset({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        role: "SELLER",
        status: "ACTIVE",
      });
      await fetchUsers();
    } catch (error) {
      setAdminError(
        error instanceof Error ? error.message : "Unable to create user"
      );
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleUpdateUser = async (values: AdminUpdateUserFormData) => {
    if (!selectedUser) return;
    setAdminMessage(null);
    setAdminError(null);
    try {
      setIsUpdatingUser(true);
      const updated = await userService.updateUser(selectedUser.id, {
        ...values,
        phone: values.phone || undefined,
      });
      setUsers((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      );
      setSelectedUser(updated);
      updateUserForm.reset({
        firstName: updated.firstName,
        lastName: updated.lastName,
        email: updated.email,
        phone: updated.phone ?? "",
        role: updated.role,
        status: updated.status,
      });
      if (authUser?.id === updated.id) {
        dispatch(setUser(updated));
      }
      setAdminMessage("User updated successfully");
    } catch (error) {
      setAdminError(
        error instanceof Error ? error.message : "Unable to update user"
      );
    } finally {
      setIsUpdatingUser(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedUser.email}?`
    );
    if (!confirmed) return;

    setAdminMessage(null);
    setAdminError(null);
    try {
      setIsDeletingUser(true);
      await userService.deleteUser(selectedUser.id);
      setAdminMessage("User deleted successfully");
      await fetchUsers();
    } catch (error) {
      setAdminError(
        error instanceof Error ? error.message : "Unable to delete user"
      );
    } finally {
      setIsDeletingUser(false);
    }
  };

  const statusSummary = useMemo(
    () =>
      users.reduce(
        (acc, item) => {
          acc[item.status] = (acc[item.status] ?? 0) + 1;
          return acc;
        },
        {
          ACTIVE: 0,
          INACTIVE: 0,
          PENDING: 0,
        } as Record<User["status"], number>
      ),
    [users]
  );

  const roleSummary = useMemo(
    () =>
      users.reduce(
        (acc, item) => {
          acc[item.role] = (acc[item.role] ?? 0) + 1;
          return acc;
        },
        {
          ADMIN: 0,
          SELLER: 0,
          CUSTOMER: 0,
        } as Record<User["role"], number>
      ),
    [users]
  );

  const totalPages =
    meta.totalPages ||
    Math.max(1, Math.ceil(meta.total / (meta.limit || PAGE_SIZE)));
  const from = users.length ? (page - 1) * PAGE_SIZE + 1 : 0;
  const to = users.length ? from + users.length - 1 : 0;
  const canDeleteSelected = !!selectedUser && authUser?.id !== selectedUser.id;
  const overviewCards = useMemo(
    () =>
      [
        {
          title: "Total users",
          value: meta.total,
          description: "Across all roles",
          icon: UsersIcon,
          accent: "bg-primary/10 text-primary",
        },
        {
          title: "Active accounts",
          value: statusSummary.ACTIVE,
          description: "Currently approved",
          icon: BadgeCheck,
          accent: "bg-green-100 text-green-700",
        },
        {
          title: "Pending review",
          value: statusSummary.PENDING,
          description: "Need verification",
          icon: AlertTriangle,
          accent: "bg-yellow-100 text-yellow-700",
        },
        {
          title: "Admin seats",
          value: roleSummary.ADMIN,
          description: "With elevated access",
          icon: Shield,
          accent: "bg-indigo-100 text-indigo-700",
        },
      ] satisfies Array<{
        title: string;
        value: number;
        description: string;
        icon: LucideIcon;
        accent: string;
      }>,
    [meta.total, roleSummary.ADMIN, statusSummary.ACTIVE, statusSummary.PENDING]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-muted-foreground">
            Admin Console
          </p>
          <h1 className="text-3xl font-semibold text-gray-900">
            User Management
          </h1>
          <p className="text-gray-500">
            Review, onboard, and manage every account from a single workspace.
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={isRefreshing || isLoadingUsers}
        >
          {isRefreshing || isLoadingUsers ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Refresh
        </Button>
      </div>

      {adminError && (
        <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4" />
          <span>{adminError}</span>
        </div>
      )}
      {adminMessage && (
        <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">
          <Shield className="h-4 w-4" />
          <span>{adminMessage}</span>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {overviewCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardDescription>{card.title}</CardDescription>
                <span
                  className={`rounded-full p-2 text-sm font-semibold ${card.accent}`}
                >
                  <Icon className="h-4 w-4" />
                </span>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold tracking-tight">
                  {card.value}
                </div>
                <p className="text-xs text-muted-foreground">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Directory</CardTitle>
            <CardDescription>
              Search and filter through verified users.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="md:col-span-1">
                <label className="text-sm font-medium text-gray-700">
                  Search
                </label>
                <div className="mt-1 flex items-center rounded-md border bg-white px-3">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Email, name, phone..."
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    className="border-0 pl-2 focus-visible:ring-0"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Role
                </label>
                <select
                  className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                  value={roleFilter}
                  onChange={(event) =>
                    setRoleFilter(event.target.value as typeof roleFilter)
                  }
                >
                  <option value="ALL">All roles</option>
                  <option value="ADMIN">Admin</option>
                  <option value="SELLER">Seller</option>
                  <option value="CUSTOMER">Customer</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value as typeof statusFilter)
                  }
                >
                  <option value="ALL">All statuses</option>
                  <option value="ACTIVE">Active</option>
                  <option value="PENDING">Pending</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50 text-xs font-medium uppercase text-gray-500">
                  <tr>
                    <th className="px-4 py-3 text-left">User</th>
                    <th className="px-4 py-3 text-left">Role</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {isLoadingUsers ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-6 text-center text-muted-foreground"
                      >
                        <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                        Loading users...
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-6 text-center text-muted-foreground"
                      >
                        No users found matching your filters.
                      </td>
                    </tr>
                  ) : (
                    users.map((item) => (
                      <tr
                        key={item.id}
                        className={`cursor-pointer transition-colors hover:bg-primary/5 ${
                          selectedUser?.id === item.id ? "bg-primary/10" : ""
                        }`}
                        onClick={() => setSelectedUser(item)}
                      >
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">
                            {item.firstName} {item.lastName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {item.email}
                          </div>
                        </td>
                        <td className="px-4 py-3 capitalize">
                          {item.role.toLowerCase()}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-semibold ${
                              statusBadgeStyles[item.status]
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t pt-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
              <span>
                Showing {from}-{to} of {meta.total} users
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() =>
                    setPage((prev) => Math.min(totalPages, prev + 1))
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Selected user</CardTitle>
            <CardDescription>
              Quick facts and the latest footprint for the highlighted account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedUser ? (
              <div className="space-y-4">
                <div className="rounded-md border bg-gray-50 p-4">
                  <div className="text-lg font-semibold text-gray-900">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {selectedUser.email}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        statusBadgeStyles[selectedUser.status]
                      }`}
                    >
                      {selectedUser.status}
                    </span>
                    <span className="rounded-full border border-gray-200 px-2 py-1 text-xs font-semibold text-gray-700">
                      {selectedUser.role}
                    </span>
                  </div>
                </div>
                <dl className="grid gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <dt>Phone</dt>
                    <dd className="font-medium text-gray-900">
                      {selectedUser.phone ?? "Not provided"}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt>Created</dt>
                    <dd className="font-medium text-gray-900">
                      {new Date(selectedUser.createdAt).toLocaleDateString()}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt>Last login</dt>
                    <dd className="font-medium text-gray-900">
                      {selectedUser.lastLoginAt
                        ? new Date(selectedUser.lastLoginAt).toLocaleString()
                        : "—"}
                    </dd>
                  </div>
                </dl>
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
                    <Activity className="h-4 w-4 text-primary" />
                    Recent activity
                  </div>
                  <div className="mt-3 space-y-3">
                    {activitiesLoading ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading activity log...
                      </div>
                    ) : activitiesError ? (
                      <p className="text-sm text-red-600">{activitiesError}</p>
                    ) : selectedActivities.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No recent activity on record.
                      </p>
                    ) : (
                      selectedActivities.map((activity) => (
                        <div
                          key={`${activity.id}-${activity.createdAt}`}
                          className="rounded-md border p-3 text-sm"
                        >
                          <p className="font-medium text-gray-900">
                            {activity.action}
                          </p>
                          {activity.description && (
                            <p className="text-muted-foreground">
                              {activity.description}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {new Date(activity.createdAt).toLocaleString()}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Select a user from the directory to preview their details and
                footprint.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Update account</CardTitle>
            <CardDescription>
              Adjust profile data, role, and status, or remove the account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedUser ? (
              <Form {...updateUserForm}>
                <form
                  onSubmit={updateUserForm.handleSubmit(handleUpdateUser)}
                  className="space-y-4"
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={updateUserForm.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={updateUserForm.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={updateUserForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={updateUserForm.control}
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
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={updateUserForm.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role</FormLabel>
                          <FormControl>
                            <select
                              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                              {...field}
                            >
                              <option value="ADMIN">Admin</option>
                              <option value="SELLER">Seller</option>
                              <option value="CUSTOMER">Customer</option>
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={updateUserForm.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <FormControl>
                            <select
                              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                              {...field}
                            >
                              <option value="ACTIVE">Active</option>
                              <option value="PENDING">Pending</option>
                              <option value="INACTIVE">Inactive</option>
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <Button type="submit" disabled={isUpdatingUser}>
                      {isUpdatingUser && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {isUpdatingUser ? "Saving..." : "Save changes"}
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      disabled={!canDeleteSelected || isDeletingUser}
                      onClick={handleDeleteUser}
                    >
                      {isDeletingUser ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="mr-2 h-4 w-4" />
                      )}
                      Delete user
                    </Button>
                  </div>
                  {!canDeleteSelected && (
                    <p className="text-xs text-muted-foreground">
                      You cannot delete the account you are currently signed in
                      with.
                    </p>
                  )}
                </form>
              </Form>
            ) : (
              <p className="text-sm text-muted-foreground">
                Select a user to view and edit their profile.
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Onboard a new user</CardTitle>
            <CardDescription>
              Provision access for admins, sellers, or customers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...createUserForm}>
              <form
                onSubmit={createUserForm.handleSubmit(handleCreateUser)}
                className="space-y-4"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={createUserForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First name</FormLabel>
                        <FormControl>
                          <Input placeholder="Jane" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createUserForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last name</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={createUserForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="jane@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createUserForm.control}
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
                <FormField
                  control={createUserForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Temporary password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Provide a secure password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={createUserForm.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <FormControl>
                          <select
                            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                            {...field}
                          >
                            <option value="ADMIN">Admin</option>
                            <option value="SELLER">Seller</option>
                            <option value="CUSTOMER">Customer</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createUserForm.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <FormControl>
                          <select
                            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                            {...field}
                          >
                            <option value="ACTIVE">Active</option>
                            <option value="PENDING">Pending</option>
                            <option value="INACTIVE">Inactive</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <p className="text-sm text-muted-foreground">
                    New users will receive onboarding instructions via email.
                  </p>
                  <Button type="submit" disabled={isCreatingUser}>
                    {isCreatingUser ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <UserPlus className="mr-2 h-4 w-4" />
                    )}
                    {isCreatingUser ? "Creating..." : "Create user"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <RoleGuard allowedRoles={["ADMIN"]}>
      <AdminManagementContent />
    </RoleGuard>
  );
}
