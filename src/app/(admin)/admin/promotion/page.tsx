"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { promotionService } from "@/services/promotionService";
import type { Promotion, CreatePromotionDto } from "@/types/promotion";
import {
  Loader2,
  Plus,
  Search,
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adminMessage, setAdminMessage] = useState<string | null>(null);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });

  const form = useForm<PromotionFormData>({
    resolver: zodResolver(promotionSchema),
    defaultValues: {
      name: "",
      type: "Default",
      startDate: "",
      expiryDate: "",
      value: 0,
      recurringMonth: undefined,
      recurringDay: undefined,
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

      // Backend returns paginated response
      const promotionsData = Array.isArray(response.data.data)
        ? response.data.data
        : [];

      // Filter by type on client side
      const filteredData =
        typeFilter === "all"
          ? promotionsData
          : promotionsData.filter((p) => p.type === typeFilter);

      setPromotions(filteredData);
      setTotal(response.total || 0);
      setTotalPages(response.totalPages || 1);

      // Fetch stats
      const statsData = await promotionService.getStats();
      setStats({
        total: statsData.total,
        active: statsData.active,
        inactive: statsData.inactive,
      });
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
    form.reset({
      name: "",
      type: "Default",
      startDate: "",
      expiryDate: "",
      value: 0,
      recurringMonth: undefined,
      recurringDay: undefined,
      description: "",
      isActive: true,
    });
    setIsModalOpen(true);
  };

  // Submit form
  const onSubmit = async (data: PromotionFormData) => {
    try {
      setAdminMessage(null);
      setAdminError(null);
      setIsSubmitting(true);

      const payload: CreatePromotionDto = {
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

      await promotionService.createPromotion(payload);
      setAdminMessage("Promotion created successfully");

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

  // Toggle active status
  const handleToggleActive = async (promotion: Promotion) => {
    try {
      if (promotion.isActive) {
        await promotionService.disablePromotion(promotion._id);
      } else {
        await promotionService.enablePromotion(promotion._id);
      }
      fetchPromotions();
    } catch (error) {
      console.error("Error toggling promotion status:", error);
    }
  };

  return (
    <div>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-100">
              Quản lý Khuyến mãi
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 mt-1">
              Tạo và quản lý các chương trình khuyến mãi
            </p>
          </div>
          <Button onClick={handleCreate} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Tạo khuyến mãi
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 border border-neutral-200 dark:border-neutral-700 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Tổng số
                </p>
                <p className="text-3xl font-bold text-neutral-800 dark:text-neutral-100 mt-1">
                  {stats.total}
                </p>
              </div>
              <Tag className="w-12 h-12 text-primary/30" />
            </div>
          </div>
          <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 border border-neutral-200 dark:border-neutral-700 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Đang hoạt động
                </p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {stats.active}
                </p>
              </div>
              <Power className="w-12 h-12 text-green-500/30" />
            </div>
          </div>
          <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 border border-neutral-200 dark:border-neutral-700 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Tạm dừng
                </p>
                <p className="text-3xl font-bold text-neutral-500 dark:text-neutral-400 mt-1">
                  {stats.inactive}
                </p>
              </div>
              <PowerOff className="w-12 h-12 text-neutral-400/30" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 border border-neutral-200 dark:border-neutral-700 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <Input
                type="text"
                placeholder="Tìm kiếm khuyến mãi..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                onClick={() => setStatusFilter("all")}
              >
                Tất cả
              </Button>
              <Button
                variant={statusFilter === "active" ? "default" : "outline"}
                onClick={() => setStatusFilter("active")}
              >
                Hoạt động
              </Button>
              <Button
                variant={statusFilter === "inactive" ? "default" : "outline"}
                onClick={() => setStatusFilter("inactive")}
              >
                Tạm dừng
              </Button>
            </div>
          </div>
        </div>

        {/* Promotions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách khuyến mãi</CardTitle>
            <CardDescription>
              Quản lý tất cả các chương trình khuyến mãi
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Table */}
            <div className="overflow-hidden rounded-md border">
              <table className="w-full text-sm">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">
                      Tên khuyến mãi
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">
                      Loại
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">
                      Giá trị
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">
                      Thời gian áp dụng
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">
                      Trạng thái
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-gray-700">
                      Hành động
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
                        <p>Không tìm thấy khuyến mãi nào</p>
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
                                {String(promo.recurringDay).padStart(2, "0")}/
                                {String(promo.recurringMonth).padStart(2, "0")}{" "}
                                hàng năm
                              </span>
                            </div>
                          ) : (
                            <div>
                              {new Date(promo.startDate).toLocaleDateString(
                                "vi-VN"
                              )}{" "}
                              -{" "}
                              {new Date(promo.expiryDate).toLocaleDateString(
                                "vi-VN"
                              )}
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
                            {promo.isActive ? "Hoạt động" : "Tạm dừng"}
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
                                  ? "Tắt khuyến mãi"
                                  : "Bật khuyến mãi"
                              }
                            >
                              {promo.isActive ? (
                                <PowerOff className="h-3.5 w-3.5" />
                              ) : (
                                <Power className="h-3.5 w-3.5" />
                              )}
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
                Hiển thị{" "}
                {promotions.length > 0 ? (page - 1) * PAGE_SIZE + 1 : 0}-
                {Math.min(page * PAGE_SIZE, total)} trong tổng số {total} khuyến
                mãi
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                >
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() =>
                    setPage((prev) => Math.min(totalPages, prev + 1))
                  }
                >
                  Sau
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Create/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-neutral-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 p-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">
                  Tạo khuyến mãi mới
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
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
                        <FormLabel>Tên khuyến mãi</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="VD: Giảm giá mùa hè" />
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
                        <FormLabel>Loại khuyến mãi</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
                          >
                            <option value="Default">Mặc định</option>
                            <option value="Recurring">Định kỳ</option>
                            <option value="Special">Đặc biệt</option>
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
                          <FormLabel>Ngày bắt đầu</FormLabel>
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
                          <FormLabel>Ngày kết thúc</FormLabel>
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
                        <FormLabel>Giá trị giảm giá (%)</FormLabel>
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
                            <div className="flex justify-between text-xs text-neutral-500">
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
                            <FormLabel>Tháng</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                max="12"
                                placeholder="1-12"
                                {...field}
                                value={field.value ?? ""}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value
                                      ? Number(e.target.value)
                                      : undefined
                                  )
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
                            <FormLabel>Ngày</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                max="31"
                                placeholder="1-31"
                                {...field}
                                value={field.value ?? ""}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value
                                      ? Number(e.target.value)
                                      : undefined
                                  )
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
                        <FormLabel>Mô tả (tùy chọn)</FormLabel>
                        <FormControl>
                          <textarea
                            {...field}
                            rows={3}
                            placeholder="Mô tả chi tiết về khuyến mãi..."
                            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
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
                            Kích hoạt ngay
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
                      Hủy
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Đang lưu...
                        </>
                      ) : (
                        "Tạo mới"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
