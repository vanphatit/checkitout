"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ticketService } from "@/services/ticketService";
import { Ticket, TicketStatus } from "@/types/ticket";
import Link from "next/link";
import {
  FiRefreshCw,
  FiFilter,
  FiClock,
  FiCheckCircle,
  FiCreditCard,
  FiEye,
  FiPlus,
} from "react-icons/fi";

export default function MyTicketsPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [payingTicketId, setPayingTicketId] = useState<string | null>(null);

  const handlePayNow = async (ticketId: string) => {
    try {
      setPayingTicketId(ticketId);
      const result = await ticketService.createPaymentUrl(ticketId);
      if (result.success && result.paymentUrl) {
        // Redirect to VNPay
        window.location.href = result.paymentUrl;
      }
    } catch (error: any) {
      alert(
        error.response?.data?.message ||
          "Không thể tạo link thanh toán. Vui lòng thử lại."
      );
      setPayingTicketId(null);
    }
  };

  useEffect(() => {
    setLoading(true);

    ticketService
      .getMyTickets(statusFilter ? { status: statusFilter } : undefined)
      .then((res) => {
        setTickets(res);
      })
      .finally(() => setLoading(false));
  }, [statusFilter]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] p-6 lg:p-10">
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-400">Đang tải...</div>
        </div>
      </div>
    );
  }

  const successTickets = tickets.filter((t) => t.status === "SUCCESS");
  const pendingTickets = tickets.filter((t) => t.status === "PENDING");
  const totalSpent = successTickets.reduce(
    (sum, ticket) => sum + ticket.totalPrice,
    0
  );

  return (
    <div>
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h2 className="text-3xl font-bold text-neutral-900">
            Vé của tôi
          </h2>
          <p className="text-sm text-neutral-500 mt-1">
            Quản lý và theo dõi các vé đã đặt
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/scheduling")}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
          >
            <FiPlus className="w-5 h-5" />
            Tạo vé mới
          </button>
          <button
            onClick={() => window.location.reload()}
            className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
          >
            <FiRefreshCw className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </div>

      {/* --- SUMMARY STATS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-neutral-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <FiCheckCircle className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Vé đã thanh toán
            </h3>
          </div>
          <p className="text-2xl font-bold text-neutral-900">{successTickets.length}</p>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-amber-50 rounded-lg">
              <FiClock className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Chờ thanh toán
            </h3>
          </div>
          <p className="text-2xl font-bold text-neutral-900">{pendingTickets.length}</p>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <FiCheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Tổng chi tiêu
            </h3>
          </div>
          <p className="text-2xl font-bold text-neutral-900">
            {ticketService.formatCurrency(totalSpent)}
          </p>
        </div>
      </div>

      {/* --- FILTERS --- */}
      <div className="mt-8 mb-4 flex items-center gap-2 w-full overflow-x-auto pb-2">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2 ml-1 flex items-center gap-1">
          <FiFilter /> Lọc:
        </span>
        {[
          { value: "", label: "Tất cả" },
          { value: "SUCCESS", label: "Đã thanh toán" },
          { value: "PENDING", label: "Chờ thanh toán" },
          { value: "FAILED", label: "Thất bại" },
          { value: "TRANSFER", label: "Đã chuyển" },
        ].map((s) => (
          <button
            key={s.value}
            onClick={() => setStatusFilter(s.value)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all border whitespace-nowrap
              ${
                statusFilter === s.value
                  ? "bg-slate-900 text-white border-slate-900 shadow-md"
                  : "bg-white text-slate-500 border-slate-200 hover:border-slate-400"
              }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* --- TICKETS LIST --- */}
      <div className="space-y-4">
        {tickets.length > 0 ? (
          tickets.map((ticket) => {
            const user =
              typeof ticket.userId === "object" ? ticket.userId : null;
            const seat =
              typeof ticket.seatId === "object" ? ticket.seatId : null;
            const scheduling =
              typeof ticket.schedulingId === "object"
                ? ticket.schedulingId
                : null;
            const promotion =
              typeof ticket.promotionId === "object"
                ? ticket.promotionId
                : null;

            return (
              <div
                key={ticket._id}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left: Ticket Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center font-bold text-blue-600 text-sm">
                        {seat?.seatNo || "N/A"}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">
                          Vé xe #{ticket._id.slice(-8)}
                        </h3>
                        <p className="text-sm text-slate-500">
                          {scheduling
                            ? `${new Date(
                                scheduling.departureDate
                              ).toLocaleDateString("vi-VN")} - ${
                                scheduling.etd
                              }`
                            : "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-slate-400">Ghế:</span>
                        <span className="ml-2 font-bold text-slate-700">
                          {seat?.seatNo || "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400">Thanh toán:</span>
                        <span
                          className={`ml-2 px-2 py-0.5 rounded text-xs font-bold ${ticketService.getPaymentMethodColor(
                            ticket.paymentMethod
                          )}`}
                        >
                          {ticket.paymentMethod}
                        </span>
                      </div>
                      {promotion && (
                        <div>
                          <span className="text-slate-400">Khuyến mãi:</span>
                          <span className="ml-2 text-emerald-600 font-bold">
                            -{promotion.value}%
                          </span>
                        </div>
                      )}
                      <div>
                        <span className="text-slate-400">Ngày đặt:</span>
                        <span className="ml-2 font-bold text-slate-700">
                          {new Date(ticket.createdAt).toLocaleDateString(
                            "vi-VN"
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Price & Status */}
                  <div className="flex flex-col items-end gap-3">
                    <div className="text-right">
                      <p className="text-2xl font-black text-slate-900">
                        {ticketService.formatCurrency(ticket.totalPrice)}
                      </p>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border ${ticketService.getStatusColor(
                        ticket.status
                      )}`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          ticket.status === "SUCCESS"
                            ? "bg-emerald-500 animate-pulse"
                            : ticket.status === "PENDING"
                            ? "bg-amber-500 animate-pulse"
                            : ticket.status === "FAILED"
                            ? "bg-rose-500"
                            : "bg-blue-500"
                        }`}
                      />
                      {ticket.status === "SUCCESS"
                        ? "Đã thanh toán"
                        : ticket.status === "PENDING"
                        ? "Chờ thanh toán"
                        : ticket.status === "FAILED"
                        ? "Thất bại"
                        : "Đã chuyển"}
                    </span>

                    {/* View Details Button */}
                    <Link
                      href={`/my-tickets/${ticket._id}`}
                      className="inline-flex items-center gap-2 px-5 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all border border-slate-200"
                    >
                      <FiEye className="w-4 h-4" />
                      Xem chi tiết
                    </Link>

                    {ticket.status === "PENDING" && (
                      <>
                        <p className="text-xs text-amber-600 text-center">
                          Hết hạn:{" "}
                          {new Date(ticket.expiredTime).toLocaleString(
                            "vi-VN"
                          )}
                        </p>
                        <button
                          onClick={() => handlePayNow(ticket._id)}
                          disabled={payingTicketId === ticket._id}
                          className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {payingTicketId === ticket._id ? (
                            <>
                              <FiClock className="w-4 h-4 animate-spin" />
                              Đang xử lý...
                            </>
                          ) : (
                            <>
                              <FiCreditCard className="w-4 h-4" />
                              Thanh toán ngay
                            </>
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Transfer Description */}
                {ticket.transferDescription && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                    <p className="text-xs text-blue-700">
                      {ticket.transferDescription}
                    </p>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl p-20 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 text-4xl">
                🎫
              </div>
              <div>
                <p className="text-slate-900 font-bold text-lg mb-1">
                  Chưa có vé nào
                </p>
                <p className="text-slate-400 text-sm">
                  Bạn chưa đặt vé nào. Hãy đặt vé ngay!
                </p>
              </div>
              <Link
                href="/scheduling"
                className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
              >
                Đặt vé ngay
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
