"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { RouteData } from "@/types/route";
import { routeService } from "@/services/routeService";
import Container from "@/components/layout/Container";
import {
  Route,
  Loader2,
  Clock,
  TrendingUp,
  Activity,
  CheckCircle,
  XCircle,
  Trash2,
  BusFront,
} from "lucide-react";
import { FaSearch } from "react-icons/fa";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function RoutePage() {
  const router = useRouter();
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredRoutes, setFilteredRoutes] = useState<RouteData[]>([]);

  // Stats state
  const [stats, setStats] = useState<{
    total: number;
    active: number;
    inactive: number;
    deleted: number;
  } | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const result = await routeService.getRouteStats();
      setStats(result);
    } catch (err) {
      console.error("Error fetching route stats:", err);
    }
  }, []);

  const fetchRoutes = useCallback(
    async (pageNum: number, reset: boolean = false) => {
      if (isLoading) return;

      setIsLoading(true);
      setError(null);
      try {
        const result = await routeService.getAllRoutesPaginated({
          page: pageNum,
          limit: 10,
          includeDeleted: false,
        });

        setRoutes((prev) => (reset ? result.data : [...prev, ...result.data]));

        if (result.pagination) {
          setHasMore(pageNum < result.pagination.totalPages);
        } else {
          setHasMore(false);
        }
      } catch (err) {
        console.error("Error fetching routes:", err);
        setError("Không thể tải danh sách tuyến đường. Vui lòng thử lại.");
        if (reset) setRoutes([]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading]
  );

  useEffect(() => {
    fetchStats();
    fetchRoutes(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter routes based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredRoutes(routes);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = routes.filter((route) => {
        const routeName = route.name?.toLowerCase() || "";
        const description = route.description?.toLowerCase() || "";
        const origin = route.stationIds[0]?.name?.toLowerCase() || "";
        const destination =
          route.stationIds[route.stationIds.length - 1]?.name?.toLowerCase() ||
          "";

        return (
          routeName.includes(query) ||
          description.includes(query) ||
          origin.includes(query) ||
          destination.includes(query)
        );
      });
      setFilteredRoutes(filtered);
    }
  }, [searchQuery, routes]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchRoutes(nextPage, false);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isLoading, page, fetchRoutes]);

  const handleRouteClick = (route: RouteData) => {
    const origin = route.stationIds[0]?.name || "";
    const destination =
      route.stationIds[route.stationIds.length - 1]?.name || "";

    // Navigate to scheduling page with station names as query params
    router.push(
      `/scheduling?from=${encodeURIComponent(origin)}&to=${encodeURIComponent(
        destination
      )}`
    );
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return "N/A";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="min-h-screen py-8 bg-neutral-50 dark:bg-neutral-900">
      <Container>
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Route className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
              Tuyến đường
            </h1>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400">
            Khám phá các tuyến xe khách phổ biến và đặt vé ngay
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <Input
              type="text"
              placeholder="Tìm kiếm tuyến đường, điểm đi, điểm đến..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-base border-0 bg-white/70 dark:bg-neutral-700/70 focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Routes List */}
        {isLoading && page === 1 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <p className="text-neutral-600 dark:text-neutral-400">
              Đang tải tuyến đường...
            </p>
          </div>
        ) : filteredRoutes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-4">
              <Route className="w-8 h-8 text-neutral-400" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-300 mb-2">
              Không tìm thấy tuyến đường
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 max-w-md">
              {searchQuery
                ? "Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc"
                : "Chưa có tuyến đường nào"}
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
              Tìm thấy{" "}
              <span className="font-semibold">{filteredRoutes.length}</span>{" "}
              tuyến đường
            </p>
            <div className="space-y-4">
              {filteredRoutes.map((route) => {
                const origin = route.stationIds[0];
                const destination =
                  route.stationIds[route.stationIds.length - 1];

                return (
                  <div
                    key={route._id}
                    onClick={() => handleRouteClick(route)}
                    className="bg-white dark:bg-neutral-800 rounded-lg border-2 border-neutral-200 dark:border-neutral-700 p-6 hover:shadow-lg hover:border-primary dark:hover:border-primary transition-all cursor-pointer group"
                  >
                    <div className="space-y-4">
                      {/* Route Name and Status */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white line-clamp-1 mb-1">
                            {route.name}
                          </h3>
                          {route.description && (
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
                              {route.description}
                            </p>
                          )}
                        </div>
                        {route.isActive ? (
                          <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full font-medium whitespace-nowrap">
                            Hoạt động
                          </span>
                        ) : (
                          <span className="text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 px-3 py-1 rounded-full font-medium whitespace-nowrap">
                            Tạm dừng
                          </span>
                        )}
                      </div>

                      {/* Origin -> Destination with Bus Animation */}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 flex-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
                              {origin?.name || "N/A"}
                            </p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                              {origin?.address || ""}
                            </p>
                          </div>
                        </div>

                        {/* Animated Route Line */}
                        <div className="flex-1 flex items-center justify-center relative max-w-[200px]">
                          <div className="h-px bg-neutral-300 dark:bg-neutral-600 flex-1"></div>

                          <div className="relative mx-2">
                            <BusFront className="w-5 h-5 text-primary animate-pulse group-hover:animate-bounce" />
                          </div>

                          <div className="h-px bg-neutral-300 dark:bg-neutral-600 flex-1"></div>

                          {/* Arrow */}
                          <div className="absolute right-0 w-0 h-0 border-t-4 border-t-transparent border-l-4 border-l-neutral-300 dark:border-l-neutral-600 border-b-4 border-b-transparent"></div>
                        </div>

                        <div className="flex items-center gap-2 flex-1 justify-end">
                          <div className="min-w-0 text-right">
                            <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
                              {destination?.name || "N/A"}
                            </p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                              {destination?.address || ""}
                            </p>
                          </div>
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        </div>
                      </div>

                      {/* Route Details */}
                      <div className="flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-neutral-700">
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                            <TrendingUp className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              {route.distance ? `${route.distance} km` : "N/A"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              {formatDuration(route.estimatedDuration)}
                            </span>
                          </div>
                          {route.etd && (
                            <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                              <Clock className="w-4 h-4" />
                              <span className="text-sm">
                                Khởi hành:{" "}
                                <span className="font-medium">{route.etd}</span>
                              </span>
                            </div>
                          )}
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          className="border-2 border-primary text-primary hover:bg-primary hover:text-white transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRouteClick(route);
                          }}
                        >
                          Xem lịch trình
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Infinite scroll trigger */}
        {hasMore && !searchQuery && (
          <div ref={observerTarget} className="flex justify-center py-8">
            {isLoading && page > 1 && (
              <div className="flex items-center gap-2">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
                <p className="text-neutral-600 dark:text-neutral-400">
                  Đang tải thêm...
                </p>
              </div>
            )}
          </div>
        )}

        {!hasMore && routes.length > 0 && !searchQuery && (
          <div className="text-center py-8">
            <p className="text-neutral-500 dark:text-neutral-400">
              Đã hiển thị tất cả tuyến đường
            </p>
          </div>
        )}
      </Container>
    </div>
  );
}
