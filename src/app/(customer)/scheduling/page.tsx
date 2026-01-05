"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Scheduling } from "@/types/scheduling";
import { schedulingService } from "@/services/schedulingService";
import { SchedulingList } from "@/components/scheduling";
import { getCurrentDate } from "@/lib/formatters";
import Container from "@/components/layout/Container";
import { Calendar, Loader2 } from "lucide-react";
import { TbArrowsExchange } from "react-icons/tb";
import { FaMapMarkedAlt, FaSearch } from "react-icons/fa";
import { StationAutocomplete } from "@/components/search/StationAutocomplete";

export default function SchedulingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [schedulings, setSchedulings] = useState<Scheduling[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Search form state - initialize from URL params
  const [fromLocation, setFromLocation] = useState(
    searchParams.get("from") || ""
  );
  const [toLocation, setToLocation] = useState(searchParams.get("to") || "");
  const [selectedDate, setSelectedDate] = useState(
    searchParams.get("date") || getCurrentDate()
  );

  // Update state when URL params change
  useEffect(() => {
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const date = searchParams.get("date");

    if (from) setFromLocation(from);
    if (to) setToLocation(to);
    if (date) setSelectedDate(date);
  }, [searchParams]);

  const fetchSchedulings = useCallback(
    async (
      pageNum: number,
      date: string,
      from?: string,
      to?: string,
      reset: boolean = false
    ) => {
      if (isLoading) return;

      setIsLoading(true);
      setError(null);
      try {
        const result = await schedulingService.getSchedulings({
          date,
          page: pageNum,
          limit: 10,
        });

        // Filter by from/to based on route name (client-side filtering)
        let filtered = result.data;
        if (from || to) {
          filtered = filtered.filter((s) => {
            const routeName = s.routeId?.name?.toLowerCase() || "";
            const matchFrom = !from || routeName.includes(from.toLowerCase());
            const matchTo = !to || routeName.includes(to.toLowerCase());
            return matchFrom && matchTo;
          });
        }

        setSchedulings((prev) => (reset ? filtered : [...prev, ...filtered]));
        setHasMore(pageNum < result.pagination.totalPages);
      } catch (err) {
        console.error("Error fetching schedulings:", err);
        setError("Không thể tải danh sách lịch trình. Vui lòng thử lại.");
        if (reset) setSchedulings([]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading]
  );

  useEffect(() => {
    setPage(1);
    setSchedulings([]);
    setHasMore(true);
    fetchSchedulings(1, selectedDate, fromLocation, toLocation, true);
  }, [selectedDate]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchSchedulings(
            nextPage,
            selectedDate,
            fromLocation,
            toLocation,
            false
          );
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
  }, [
    hasMore,
    isLoading,
    page,
    selectedDate,
    fromLocation,
    toLocation,
    fetchSchedulings,
  ]);

  const handleCardClick = (schedulingId: string) => {
    router.push(`/bus/${schedulingId}`);
  };

  const handleSwap = () => {
    const temp = fromLocation;
    setFromLocation(toLocation);
    setToLocation(temp);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSchedulings([]);
    setHasMore(true);
    fetchSchedulings(1, selectedDate, fromLocation, toLocation, true);
  };

  return (
    <div className="min-h-screen py-8 bg-neutral-50 dark:bg-neutral-900">
      <Container>
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
              Lịch trình xe
            </h1>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400">
            Tìm kiếm và đặt vé xe khách cho chuyến đi của bạn
          </p>
        </div>

        {/* Search Bar - Same layout as Home */}
        <form
          onSubmit={handleSearch}
          className="w-full bg-neutral-50/20 border-2 border-neutral-300 dark:border-neutral-600 shadow-lg rounded-xl p-5"
        >
          <div className="w-full flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="lg:w-[60%] flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-5 relative">
              <div className="w-full lg:w-1/2">
                <StationAutocomplete
                  value={fromLocation}
                  onChange={setFromLocation}
                  placeholder="Điểm xuất phát..."
                  icon={<FaMapMarkedAlt className="w-5 h-5" />}
                />
              </div>

              <div className="w-full lg:w-1/2">
                <StationAutocomplete
                  value={toLocation}
                  onChange={setToLocation}
                  placeholder="Điểm đến..."
                  icon={<FaMapMarkedAlt className="w-5 h-5" />}
                />
              </div>

              <button
                type="button"
                onClick={handleSwap}
                className="lg:absolute lg:w-11 w-full lg:h-6 h-11 lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 rounded-full flex items-center justify-center bg-primary text-neutral-50 hover:bg-primary/90 transition-colors"
                aria-label="Swap routes"
              >
                <TbArrowsExchange className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 h-14 flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-5">
              <label className="flex-1 h-14 border-neutral-300 bg-white/70 dark:bg-neutral-700/70 text-base text-neutral-700 dark:text-neutral-200 font-medium px-5 flex items-center gap-x-1 rounded-lg">
                <span className="sr-only">Date</span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="flex-1 h-full border-none bg-transparent focus:outline-none"
                />
              </label>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full lg:w-fit px-5 h-14 bg-primary hover:bg-transparent border-2 border-primary rounded-xl text-base font-medium text-neutral-50 flex items-center justify-center gap-x-2 hover:text-primary ease-in-out duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaSearch />
                {isLoading ? "Đang tìm..." : "Search"}
              </button>
            </div>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Scheduling List */}
        <div className="mt-8">
          <SchedulingList
            schedulings={schedulings}
            isLoading={isLoading && page === 1}
            onCardClick={handleCardClick}
          />

          {/* Infinite scroll trigger */}
          {hasMore && (
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

          {!hasMore && schedulings.length > 0 && (
            <div className="text-center py-8">
              <p className="text-neutral-500 dark:text-neutral-400">
                Đã hiển thị tất cả lịch trình
              </p>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
