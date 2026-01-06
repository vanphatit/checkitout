"use client";
import { useEffect, useState } from "react";
import { ticketService } from "@/services/ticketService";
import {
  TicketsAnalyticsResponse,
  TicketStatus,
  PaymentMethod,
  SellerTicketStats,
} from "@/types/ticket";
import Link from "next/link";
import {
  FiRefreshCw,
  FiChevronLeft,
  FiChevronRight,
  FiFilter,
  FiDollarSign,
  FiShoppingCart,
  FiTrendingUp,
  FiEye,
  FiPlus,
  FiSearch,
  FiX,
} from "react-icons/fi";

type Props = {
  page: number;
  status: string;
  period: string;
  paymentMethod: string;
  search?: string;
};

export default function TicketManagementClient({
  page,
  status,
  period,
  paymentMethod,
  search,
}: Props) {
  const [response, setResponse] = useState<TicketsAnalyticsResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(search || "");
  const [sellerStats, setSellerStats] = useState<SellerTicketStats | null>(null);

  const currentPage = page || 1;
  const statusFilter = status || "";
  const periodFilter = period || "";
  const paymentFilter = paymentMethod || "";
  const searchQuery = search || "";

  useEffect(() => {
    setLoading(true);

    const params: any = {
      page: currentPage,
      limit: 10,
    };

    // Nếu có search query (email hoặc phone), không áp dụng các filter khác
    if (searchQuery) {
      // Kiểm tra xem search query là email hay phone
      if (searchQuery.includes("@")) {
        params.email = searchQuery;
      } else {
        params.phone = searchQuery;
      }
    } else {
      // Chỉ áp dụng các filter khi không có search
      if (statusFilter) params.status = statusFilter as TicketStatus;
      if (periodFilter) params.period = periodFilter as any;
      if (paymentFilter) params.paymentMethod = paymentFilter as PaymentMethod;
    }

    // Fetch tickets data
    ticketService
      .getAllTickets(params)
      .then((res) => {
        setResponse(res);
      })
      .finally(() => setLoading(false));

    // Fetch seller stats
    ticketService
      .getSellerStats()
      .then((stats: any) => {
        setSellerStats(stats);
      })
      .catch((error) => {
        console.error("Failed to fetch seller stats:", error);
      });
  }, [currentPage, statusFilter, periodFilter, paymentFilter, searchQuery]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] p-6 lg:p-10">
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-400">Loading...</div>
        </div>
      </div>
    );
  }

  const tickets = response?.tickets || [];
  const summary = response?.summary || {
    totalRevenue: 0,
    ticketCount: 0,
    averageTicketPrice: 0,
  };
  const pagination = response?.pagination || {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  };

  return (
    <div>
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h2 className="text-3xl font-bold text-neutral-900">Quản lý vé</h2>
          <p className="text-sm text-neutral-500 mt-1">
            Quản lý và theo dõi tất cả vé trong hệ thống
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/tickets/create"
            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md flex items-center gap-2"
          >
            <FiPlus className="w-5 h-5" />
            Tạo vé mới
          </Link>
          <Link
            href="/admin/tickets"
            className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
          >
            <FiRefreshCw className="w-5 h-5 text-slate-600" />
          </Link>
        </div>
      </div>

      {/* --- TICKET STATUS BREAKDOWN --- */}
      {sellerStats && sellerStats.ticketsByStatus && (
        <div className="bg-white rounded-lg border border-neutral-200 p-6 shadow-sm mb-8">
          <h3 className="text-sm font-bold text-neutral-700 mb-4 uppercase tracking-wider">
            Phân bổ trạng thái vé ( {sellerStats.ticketCount} vé)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Success */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                  Thành công
                </span>
                <span className="text-sm font-bold text-emerald-900">
                  {sellerStats.ticketsByStatus.success}
                </span>
              </div>
              <div className="relative w-full h-3 bg-emerald-100 rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${(sellerStats.ticketsByStatus.success /
                      sellerStats.ticketCount) *
                      100
                      }%`,
                  }}
                />
              </div>
              <span className="text-xs text-neutral-500">
                {(
                  (sellerStats.ticketsByStatus.success /
                    sellerStats.ticketCount) *
                  100
                ).toFixed(1)}
                %
              </span>
            </div>

            {/* Pending */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
                  Chờ thanh toán
                </span>
                <span className="text-sm font-bold text-amber-900">
                  {sellerStats.ticketsByStatus.pending}
                </span>
              </div>
              <div className="relative w-full h-3 bg-amber-100 rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${(sellerStats.ticketsByStatus.pending /
                      sellerStats.ticketCount) *
                      100
                      }%`,
                  }}
                />
              </div>
              <span className="text-xs text-neutral-500">
                {(
                  (sellerStats.ticketsByStatus.pending /
                    sellerStats.ticketCount) *
                  100
                ).toFixed(1)}
                %
              </span>
            </div>

            {/* Failed */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider">
                  Thất bại
                </span>
                <span className="text-sm font-bold text-rose-900">
                  {sellerStats.ticketsByStatus.failed}
                </span>
              </div>
              <div className="relative w-full h-3 bg-rose-100 rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-rose-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${(sellerStats.ticketsByStatus.failed /
                      sellerStats.ticketCount) *
                      100
                      }%`,
                  }}
                />
              </div>
              <span className="text-xs text-neutral-500">
                {(
                  (sellerStats.ticketsByStatus.failed /
                    sellerStats.ticketCount) *
                  100
                ).toFixed(1)}
                %
              </span>
            </div>

            {/* Transfer */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
                  Đã chuyển
                </span>
                <span className="text-sm font-bold text-blue-900">
                  {sellerStats.ticketsByStatus.transfer}
                </span>
              </div>
              <div className="relative w-full h-3 bg-blue-100 rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${(sellerStats.ticketsByStatus.transfer /
                      sellerStats.ticketCount) *
                      100
                      }%`,
                  }}
                />
              </div>
              <span className="text-xs text-neutral-500">
                {(
                  (sellerStats.ticketsByStatus.transfer /
                    sellerStats.ticketCount) *
                  100
                ).toFixed(1)}
                %
              </span>
            </div>
          </div>
        </div>
      )}

      {/* --- SEARCH BOX --- */}
      <div className="mb-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const formData = new FormData(form);
            const search = formData.get("search") as string;
            window.location.href = search
              ? `/admin/tickets?search=${encodeURIComponent(search)}`
              : "/admin/tickets";
          }}
        >
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                <FiSearch className="w-5 h-5" />
              </div>
              <input
                type="text"
                name="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Tìm kiếm theo email hoặc số điện thoại khách hàng..."
                className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    if (searchQuery) {
                      window.location.href = "/admin/tickets";
                    }
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  <FiX className="w-5 h-5" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-sm flex items-center gap-2"
            >
              <FiSearch className="w-4 h-4" />
              Tìm kiếm
            </button>
          </div>
          {searchQuery && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-sm text-neutral-600">
                Kết quả tìm kiếm cho:
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold">
                {searchQuery}
              </span>
              <button
                onClick={() => {
                  setSearchInput("");
                  window.location.href = "/admin/tickets";
                }}
                className="text-sm text-blue-600 hover:text-blue-800 font-semibold"
              >
                Xóa bộ lọc
              </button>
            </div>
          )}
        </form>
      </div>

      {/* --- FILTERS --- */}
      {!searchQuery && (
        <div className="mt-8 mb-4 flex flex-col gap-4">
          {/* Period Filter */}
          <div className="flex items-center gap-2 w-full overflow-x-auto pb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2 ml-1 flex items-center gap-1">
              <FiFilter /> Thời gian:
            </span>
            {[
              { value: "today", label: "Hôm nay" },
              { value: "thisMonth", label: "Tháng này" },
              { value: "thisYear", label: "Năm này" },
              { value: "allTime", label: "Tất cả" },
            ].map((p) => (
              <Link
                key={p.value}
                href={`?period=${p.value}&status=${statusFilter}&paymentMethod=${paymentFilter}`}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all border whitespace-nowrap
                ${periodFilter === p.value
                    ? "bg-slate-900 text-white border-slate-900 shadow-md"
                    : "bg-white text-slate-500 border-slate-200 hover:border-slate-400"
                  }`}
              >
                {p.label}
              </Link>
            ))}
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            {/* Status Filter */}
            <div className="flex items-center gap-2 w-full overflow-x-auto pb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2 ml-1 flex items-center gap-1">
                Trạng thái:
              </span>
              {[
                { value: "SUCCESS", label: "Thành công" },
                { value: "PENDING", label: "Chờ thanh toán" },
                { value: "FAILED", label: "Thất bại" },
                { value: "TRANSFER", label: "Đã chuyển" },
              ].map((s) => (
                <Link
                  key={s.value}
                  href={`?status=${s.value}&period=${periodFilter}&paymentMethod=${paymentFilter}`}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all border whitespace-nowrap
                  ${statusFilter === s.value
                      ? "bg-slate-900 text-white border-slate-900 shadow-md"
                      : "bg-white text-slate-500 border-slate-200 hover:border-slate-400"
                    }`}
                >
                  {s.label}
                </Link>
              ))}
            </div>

            {/* Payment Method Filter */}
            <div className="flex items-center gap-2 w-full overflow-x-auto pb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2 ml-1 flex items-center gap-1">
                Thanh toán:
              </span>
              {[
                { value: "", label: "Tất cả" },
                { value: "BANKING", label: "Chuyển khoản" },
                { value: "CASH", label: "Tiền mặt" },
              ].map((pm) => (
                <Link
                  key={pm.value}
                  href={`?paymentMethod=${pm.value}&status=${statusFilter}&period=${periodFilter}`}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all border whitespace-nowrap
                  ${paymentFilter === pm.value
                      ? "bg-slate-900 text-white border-slate-900 shadow-md"
                      : "bg-white text-slate-500 border-slate-200 hover:border-slate-400"
                    }`}
                >
                  {pm.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- DATA TABLE --- */}
      <div className="bg-white border border-slate-200 rounded-[24px] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="p-5 text-[11px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  Khách hàng
                </th>
                <th className="p-5 text-[11px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  Ghế & Chuyến đi
                </th>
                <th className="p-5 text-[11px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 text-right">
                  Giá vé
                </th>
                <th className="p-5 text-[11px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 text-center">
                  Thanh toán
                </th>
                <th className="p-5 text-[11px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 text-center">
                  Trạng thái
                </th>
                <th className="p-5 text-[11px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 text-center">
                  Ngày tạo
                </th>
                <th className="p-5 text-[11px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 text-center">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {tickets.length > 0 ? (
                tickets.map((ticket) => (
                  <tr
                    key={ticket._id}
                    className="group hover:bg-blue-50/30 transition-all duration-200"
                  >
                    <td className="p-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900">
                          {ticket.user?.name || "N/A"}
                        </span>
                        <span className="text-xs text-slate-500">
                          {ticket.user?.email || "N/A"}
                        </span>
                        <span className="text-xs text-slate-400">
                          {ticket.user?.phone || "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-bold text-slate-700">
                          Ghế: {ticket.seat || "N/A"}
                        </span>
                        <span className="text-xs text-slate-500">
                          {ticket.scheduling
                            ? `${new Date(
                              ticket.scheduling.departureDate
                            ).toLocaleDateString("vi-VN")} - ${ticket.scheduling.etd
                            }`
                            : "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-base font-bold text-slate-900">
                          {ticketService.formatCurrency(ticket.totalPrice)}
                        </span>
                        {ticket.promotion && (
                          <span className="text-xs text-emerald-600">
                            -{ticket.promotion.value}%
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex justify-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border
                          ${ticketService.getPaymentMethodColor(
                            ticket.paymentMethod
                          )}`}
                        >
                          {ticket.paymentMethod}
                        </span>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex justify-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border
                          ${ticketService.getStatusColor(ticket.status)}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${ticket.status === "SUCCESS"
                              ? "bg-emerald-500 animate-pulse"
                              : ticket.status === "PENDING"
                                ? "bg-amber-500 animate-pulse"
                                : ticket.status === "FAILED"
                                  ? "bg-rose-500"
                                  : "bg-blue-500"
                              }`}
                          />
                          {ticket.status}
                        </span>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex flex-col items-center">
                        <span className="text-xs text-slate-500">
                          {new Date(ticket.createdAt).toLocaleDateString(
                            "vi-VN"
                          )}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(ticket.createdAt).toLocaleTimeString(
                            "vi-VN",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex justify-center">
                        <Link
                          href={`/admin/tickets/${ticket._id}`}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 transition-all border border-blue-100"
                        >
                          <FiEye />
                          Xem chi tiết
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 text-3xl">
                        🎫
                      </div>
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
                        Không tìm thấy vé nào
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* --- PAGINATION --- */}
        <div className="px-6 py-5 flex items-center justify-between bg-slate-50/50 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Trang {pagination.page} / {pagination.totalPages} (Tổng:{" "}
            {pagination.total} vé)
          </span>

          <nav className="flex items-center gap-2">
            <Link
              href={`?page=${pagination.hasPrevPage ? currentPage - 1 : 1
                }&status=${statusFilter}&period=${periodFilter}&paymentMethod=${paymentFilter}`}
              className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-all ${!pagination.hasPrevPage
                ? "opacity-30 pointer-events-none"
                : "bg-white hover:border-slate-900 shadow-sm"
                }`}
            >
              <FiChevronLeft />
            </Link>

            <Link
              href={`?page=${pagination.hasNextPage ? currentPage + 1 : pagination.totalPages
                }&status=${statusFilter}&period=${periodFilter}&paymentMethod=${paymentFilter}`}
              className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-all ${!pagination.hasNextPage
                ? "opacity-30 pointer-events-none"
                : "bg-white hover:border-slate-900 shadow-sm"
                }`}
            >
              <FiChevronRight />
            </Link>
          </nav>
        </div>
      </div>
    </div>
  );
}
