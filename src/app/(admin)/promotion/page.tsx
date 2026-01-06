"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { promotionService } from "@/services/promotionService";
import type {
  Promotion,
  CreatePromotionDto,
  UpdatePromotionDto,
} from "@/types/promotion";
import {
  Loader2,
  Plus,
  Search,
  Edit,
  Trash2,
  Tag,
  Calendar,
  Power,
  PowerOff,
  X,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
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

const PAGE_SIZE = 10;

// Validation schema
const promotionSchema = z
  .object({
    name: z.string().min(3, "Tên khuyến mãi phải có ít nhất 3 ký tự"),
    type: z
      .enum(["Default", "Recurring", "Special"])
      .refine((val) => val !== undefined, {
        message: "Vui lòng chọn loại khuyến mãi",
      }),
    startDate: z.string().min(1, "Vui lòng chọn ngày bắt đầu"),
    expiryDate: z.string().min(1, "Vui lòng chọn ngày kết thúc"),
    value: z
      .number()
      .min(0, "Giá trị phải >= 0")
      .max(100, "Giá trị phải <= 100"),
    recurringMonth: z.number().min(1).max(12).optional(),
    recurringDay: z.number().min(1).max(31).optional(),
    description: z.string().optional(),
    isActive: z.boolean(),
  })
  .refine(
    (data) => {
      if (data.type === "Recurring") {
        return (
          data.recurringMonth !== undefined && data.recurringDay !== undefined
        );
      }
      return true;
    },
    {
      message: "Khuyến mãi định kỳ cần có tháng và ngày",
      path: ["recurringMonth"],
    }
  );

type PromotionFormData = z.infer<typeof promotionSchema>;

export default function PromotionManagementPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [typeFilter, setTypeFilter] = useState<
    "all" | "Default" | "Recurring" | "Special"
  >("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adminMessage, setAdminMessage] = useState<string | null>(null);
  const [adminError, setAdminError] = useState<string | null>(null);

  const form = useForm<PromotionFormData>({
    resolver: zodResolver(promotionSchema),
    defaultValues: {
      name: "",
      type: "Default",
      startDate: "",
      expiryDate: "",
      value: 0,
      description: "",
      isActive: true,
    },
  });

  const selectedType = form.watch("type");

  // Debounce search
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 400);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [statusFilter, typeFilter, debouncedSearch]);

  // Fetch promotions
  const fetchPromotions = async () => {
    try {
      setAdminError(null);
      setIsLoading(true);
      const response = await promotionService.getPromotions({
        page,
        limit: PAGE_SIZE,
        sortBy: "createdAt",
        sortOrder: "desc",
        search: debouncedSearch || undefined,
        isActive:
          statusFilter === "all" ? undefined : statusFilter === "active",
      });

      // Backend returns nested structure: response.data.data
      const promotionsData = Array.isArray(response.data.data)
        ? response.data.data
        : [];

      // Filter by type on client side
      const filteredData =
        typeFilter === "all"
          ? promotionsData
          : promotionsData.filter((p) => p.type === typeFilter);

      setPromotions(filteredData);
      setTotal(response?.total || 0);
      setTotalPages(response?.totalPages || 1);
    } catch (error) {
      console.error("Error fetching promotions:", error);
      setAdminError("Unable to fetch promotions. Please try again.");
      setPromotions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchPromotions();
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchPromotions();
  }, [page, debouncedSearch, statusFilter, typeFilter]);

  // Open create modal
  const handleCreate = () => {
    setEditingPromotion(null);
    form.reset({
      name: "",
      type: "Default",
      startDate: "",
      expiryDate: "",
      value: 0,
      description: "",
      isActive: true,
    });
    setIsModalOpen(true);
  };

  // Open edit modal
  const handleEdit = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    form.reset({
      name: promotion.name,
      type: promotion.type,
      startDate: promotion.startDate.split("T")[0],
      expiryDate: promotion.expiryDate.split("T")[0],
      value: promotion.value,
      recurringMonth: promotion.recurringMonth,
      recurringDay: promotion.recurringDay,
      description: promotion.description || "",
      isActive: promotion.isActive,
    });
    setIsModalOpen(true);
  };

  // Submit form
  const onSubmit = async (data: PromotionFormData) => {
    try {
      setAdminMessage(null);
      setAdminError(null);
      setIsSubmitting(true);

      const payload: CreatePromotionDto | UpdatePromotionDto = {
        name: data.name,
        type: data.type,
        startDate: new Date(data.startDate).toISOString(),
        expiryDate: new Date(data.expiryDate).toISOString(),
        value: data.value,
        ...(data.type === "Recurring" && {
          recurringMonth: data.recurringMonth,
          recurringDay: data.recurringDay,
        }),
        description: data.description,
        isActive: data.isActive,
      };

      if (editingPromotion) {
        await promotionService.updatePromotion(
          editingPromotion._id,
          payload as UpdatePromotionDto
        );
        setAdminMessage("Promotion updated successfully");
      } else {
        await promotionService.createPromotion(payload as CreatePromotionDto);
        setAdminMessage("Promotion created successfully");
      }

      setIsModalOpen(false);
      fetchPromotions();
    } catch (error) {
      setAdminError(
        error instanceof Error ? error.message : "Unable to save promotion"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete promotion
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa khuyến mãi "${name}"?`)) return;

    try {
      setAdminError(null);
      await promotionService.deletePromotion(id);
      setAdminMessage("Promotion deleted successfully");
      fetchPromotions();
    } catch (error) {
      setAdminError(
        error instanceof Error ? error.message : "Unable to delete promotion"
      );
    }
  };

  // Toggle active status
  const handleToggleActive = async (promotion: Promotion) => {
    try {
      setAdminError(null);
      if (promotion.isActive) {
        await promotionService.disablePromotion(promotion._id);
        setAdminMessage(`Promotion "${promotion.name}" disabled`);
      } else {
        await promotionService.enablePromotion(promotion._id);
        setAdminMessage(`Promotion "${promotion.name}" enabled`);
      }
      fetchPromotions();
    } catch (error) {
      setAdminError(
        error instanceof Error
          ? error.message
          : "Unable to toggle promotion status"
      );
    }
  };

  // Stats
  const stats = {
    total: total,
    active: promotions.filter((p) => p.isActive).length,
    inactive: promotions.filter((p) => !p.isActive).length,
    recurring: promotions.filter((p) => p.type === "Recurring").length,
  };

  const from = (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatRecurringDate = (month?: number, day?: number) => {
    if (!month || !day) return "-";
    return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-muted-foreground">
            Admin Console
          </p>
          <h1 className="text-3xl font-semibold text-gray-900">
            Promotion Management
          </h1>
          <p className="text-gray-500">
            Create and manage promotional campaigns and discount codes.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleRefresh}
            variant="outline"
            disabled={isRefreshing || isLoading}
          >
            {isRefreshing || isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Refresh
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            New Promotion
          </Button>
        </div>
      </div>

      {/* Messages */}
      {adminError && (
        <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4" />
          <span>{adminError}</span>
        </div>
      )}
      {adminMessage && (
        <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">
          <Tag className="h-4 w-4" />
          <span>{adminMessage}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription>Total Promotions</CardDescription>
            <span className="rounded-full bg-primary/10 p-2">
              <Tag className="h-4 w-4 text-primary" />
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tracking-tight">
              {stats.total}
            </div>
            <p className="text-xs text-muted-foreground">All promotions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription>Active</CardDescription>
            <span className="rounded-full bg-green-100 p-2">
              <Power className="h-4 w-4 text-green-600" />
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tracking-tight text-green-600">
              {stats.active}
            </div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription>Inactive</CardDescription>
            <span className="rounded-full bg-gray-100 p-2">
              <PowerOff className="h-4 w-4 text-gray-600" />
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tracking-tight text-gray-600">
              {stats.inactive}
            </div>
            <p className="text-xs text-muted-foreground">Disabled</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription>Recurring</CardDescription>
            <span className="rounded-full bg-blue-100 p-2">
              <Calendar className="h-4 w-4 text-blue-600" />
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tracking-tight text-blue-600">
              {stats.recurring}
            </div>
            <p className="text-xs text-muted-foreground">Annual events</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Table */}
      <Card>
        <CardHeader>
          <CardTitle>Promotion Directory</CardTitle>
          <CardDescription>
            Search, filter, and manage all promotional campaigns.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="grid gap-3 md:grid-cols-4">
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700">
                Search
              </label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by name or description..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Type</label>
              <select
                className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                value={typeFilter}
                onChange={(e) =>
                  setTypeFilter(e.target.value as typeof typeFilter)
                }
              >
                <option value="all">All types</option>
                <option value="Default">Default</option>
                <option value="Recurring">Recurring</option>
                <option value="Special">Special</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as typeof statusFilter)
                }
              >
                <option value="all">All status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-md border">
            <table className="w-full text-sm">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Promotion
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Value
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Valid Period
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y bg-white">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                    </td>
                  </tr>
                ) : promotions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-12 text-center text-muted-foreground"
                    >
                      <Tag className="mx-auto mb-2 h-12 w-12 text-gray-300" />
                      <p>No promotions found matching your filters.</p>
                    </td>
                  </tr>
                ) : (
                  promotions.map((promo) => (
                    <tr
                      key={promo._id}
                      className="transition-colors hover:bg-gray-50"
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">
                          {promo.name}
                        </div>
                        {promo.description && (
                          <div className="text-xs text-muted-foreground line-clamp-1">
                            {promo.description}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-semibold ${promo.type === "Recurring"
                            ? "bg-blue-100 text-blue-700 border border-blue-200"
                            : promo.type === "Special"
                              ? "bg-purple-100 text-purple-700 border border-purple-200"
                              : "bg-gray-100 text-gray-700 border border-gray-200"
                            }`}
                        >
                          {promo.type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-primary">
                          {promo.value}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {promo.type === "Recurring" ? (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {formatRecurringDate(
                                promo.recurringMonth,
                                promo.recurringDay
                              )}{" "}
                              yearly
                            </span>
                          </div>
                        ) : (
                          <div>
                            {formatDate(promo.startDate)} -{" "}
                            {formatDate(promo.expiryDate)}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-semibold ${promo.isActive
                            ? "bg-green-100 text-green-700 border border-green-200"
                            : "bg-gray-100 text-gray-700 border border-gray-200"
                            }`}
                        >
                          {promo.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleActive(promo)}
                            title={
                              promo.isActive
                                ? "Disable promotion"
                                : "Enable promotion"
                            }
                          >
                            {promo.isActive ? (
                              <PowerOff className="h-3.5 w-3.5" />
                            ) : (
                              <Power className="h-3.5 w-3.5" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(promo)}
                            title="Edit promotion"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(promo._id, promo.name)}
                            className="text-red-600 hover:text-red-700 hover:border-red-600"
                            title="Delete promotion"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col gap-3 border-t pt-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
            <span>
              Showing {promotions.length > 0 ? from : 0}-{to} of {total}{" "}
              promotions
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

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingPromotion ? "Edit Promotion" : "Create New Promotion"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="p-6 space-y-6"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Promotion Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Summer Sale" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Promotion Type</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                        >
                          <option value="Default">Default</option>
                          <option value="Recurring">Recurring</option>
                          <option value="Special">Special</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="expiryDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expiry Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount Value (%)</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>0%</span>
                            <span className="font-semibold text-primary">
                              {field.value}%
                            </span>
                            <span>100%</span>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedType === "Recurring" && (
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="recurringMonth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Month</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              max="12"
                              placeholder="1-12"
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="recurringDay"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Day</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              max="31"
                              placeholder="1-31"
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <textarea
                          {...field}
                          rows={3}
                          placeholder="Describe the promotion..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="w-4 h-4 text-primary"
                          />
                        </FormControl>
                        <FormLabel className="!mt-0">
                          Activate immediately
                        </FormLabel>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : editingPromotion ? (
                      "Update"
                    ) : (
                      "Create"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      )}
    </div>
  );
}
