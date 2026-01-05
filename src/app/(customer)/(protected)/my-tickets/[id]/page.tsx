"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ticketService } from "@/services/ticketService";
import { Ticket } from "@/types/ticket";
import {
  FiLoader,
  FiArrowLeft,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiUser,
  FiMapPin,
  FiCalendar,
  FiCreditCard,
  FiTag,
  FiTrendingUp,
  FiDownload,
} from "react-icons/fi";
import Link from "next/link";

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id as string;

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payingNow, setPayingNow] = useState(false);
  const [downloadingQR, setDownloadingQR] = useState(false);

  useEffect(() => {
    if (!ticketId) return;

    ticketService
      .getTicketById(ticketId)
      .then((data) => {
        setTicket(data);
      })
      .catch((err) => {
        console.error("Error fetching ticket:", err);
        setError(err.response?.data?.message || "Không thể tải thông tin vé");
      })
      .finally(() => setLoading(false));
  }, [ticketId]);

  const handlePayNow = async () => {
    if (!ticket?._id) return;

    setPayingNow(true);
    try {
      const payment = await ticketService.createPaymentUrl(ticket._id);
      if (payment.paymentUrl) {
        window.location.href = payment.paymentUrl;
      }
    } catch (err: any) {
      console.error("Payment error:", err);
      alert(err.response?.data?.message || "Không thể tạo thanh toán");
      setPayingNow(false);
    }
  };

  const handleDownloadQR = async () => {
    if (!ticket?._id) return;

    setDownloadingQR(true);
    try {
      const blob = await ticketService.generateQRCode(ticket._id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ticket-${ticket._id}-qrcode.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error("QR download error:", err);
      alert(err.response?.data?.message || "Không thể tải QR code");
    } finally {
      setDownloadingQR(false);
    }
  };

  // Extract populated data
  const user = ticket && typeof ticket.userId === "object" ? ticket.userId : null;
  const seat = ticket && typeof ticket.seatId === "object" ? ticket.seatId : null;
  const scheduling = ticket && typeof ticket.schedulingId === "object" ? ticket.schedulingId : null;
  const promotion = ticket && typeof ticket.promotionId === "object" ? ticket.promotionId : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <FiLoader className="w-12 h-12 text-blue-500 animate-spin" />
          <p className="text-slate-600 font-bold">Đang tải thông tin vé...</p>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-lg border border-slate-200">
          <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiXCircle className="w-10 h-10 text-rose-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-3">
            Lỗi tải vé
          </h2>
          <p className="text-slate-600 mb-8">{error}</p>
          <Link
            href="/my-tickets"
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all"
          >
            <FiArrowLeft /> Quay lại danh sách vé
          </Link>
        </div>
      </div>
    );
  }

  const getStatusIcon = () => {
    switch (ticket.status) {
      case "SUCCESS":
        return <FiCheckCircle className="w-8 h-8 text-emerald-500" />;
      case "PENDING":
        return <FiClock className="w-8 h-8 text-amber-500" />;
      case "FAILED":
        return <FiXCircle className="w-8 h-8 text-rose-500" />;
      case "TRANSFER":
        return <FiTrendingUp className="w-8 h-8 text-blue-500" />;
      default:
        return <FiCheckCircle className="w-8 h-8 text-slate-500" />;
    }
  };

  const getStatusText = () => {
    switch (ticket.status) {
      case "SUCCESS":
        return "Đã thanh toán";
      case "PENDING":
        return "Chờ thanh toán";
      case "FAILED":
        return "Thanh toán thất bại";
      case "TRANSFER":
        return "Đã chuyển vé";
      default:
        return ticket.status;
    }
  };

  const getStatusGradient = () => {
    switch (ticket.status) {
      case "SUCCESS":
        return "from-emerald-500 to-emerald-600";
      case "PENDING":
        return "from-amber-500 to-amber-600";
      case "FAILED":
        return "from-rose-500 to-rose-600";
      case "TRANSFER":
        return "from-blue-500 to-blue-600";
      default:
        return "from-slate-500 to-slate-600";
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] py-10 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/my-tickets"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold mb-4 transition-colors"
          >
            <FiArrowLeft /> Quay lại danh sách vé
          </Link>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Chi tiết vé
          </h1>
        </div>

        {/* Status Banner */}
        <div
          className={`bg-gradient-to-r ${getStatusGradient()} rounded-3xl p-8 text-white mb-8 shadow-lg`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                {getStatusIcon()}
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-wider opacity-90">
                  Trạng thái vé
                </p>
                <h2 className="text-3xl font-black mt-1">{getStatusText()}</h2>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {ticket.status === "SUCCESS" && (
                <button
                  onClick={handleDownloadQR}
                  disabled={downloadingQR}
                  className="px-6 py-3 bg-white text-emerald-600 rounded-xl font-bold hover:bg-emerald-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {downloadingQR ? (
                    <>
                      <FiLoader className="animate-spin" />
                      Đang tải...
                    </>
                  ) : (
                    <>
                      <FiDownload />
                      Tải mã QR
                    </>
                  )}
                </button>
              )}
              {ticket.status === "PENDING" && (
                <button
                  onClick={handlePayNow}
                  disabled={payingNow}
                  className="px-6 py-3 bg-white text-amber-600 rounded-xl font-bold hover:bg-amber-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {payingNow ? (
                    <>
                      <FiLoader className="animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <FiCreditCard />
                      Thanh toán ngay
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Customer Info */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <FiUser className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-black text-slate-900">
                Thông tin khách hàng
              </h3>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Họ tên
                </p>
                <p className="text-base font-bold text-slate-900">
                  {user ? `${user.firstName} ${user.lastName}` : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Email
                </p>
                <p className="text-base text-slate-700">
                  {user?.email || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Số điện thoại
                </p>
                <p className="text-base text-slate-700">
                  {user?.phone || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Trip Info */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                <FiMapPin className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-black text-slate-900">
                Thông tin chuyến đi
              </h3>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Số ghế
                </p>
                <p className="text-base font-bold text-slate-900">
                  {seat?.seatNo || "N/A"}
                </p>
              </div>
              {scheduling && (
                <>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Ngày khởi hành
                    </p>
                    <p className="text-base text-slate-700">
                      {new Date(
                        scheduling.departureDate
                      ).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Giờ khởi hành
                    </p>
                    <p className="text-base text-slate-700">
                      {scheduling.etd}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                <FiCreditCard className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-black text-slate-900">
                Thông tin thanh toán
              </h3>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Tổng tiền
                </p>
                <p className="text-2xl font-black text-slate-900">
                  {ticketService.formatCurrency(ticket.totalPrice)}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Phương thức
                </p>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider border ${ticketService.getPaymentMethodColor(
                    ticket.paymentMethod
                  )}`}
                >
                  {ticket.paymentMethod}
                </span>
              </div>
              {promotion && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Khuyến mãi
                  </p>
                  <p className="text-base text-emerald-600 font-bold">
                    {promotion.name} (-{promotion.value}%)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Booking Info */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                <FiCalendar className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-black text-slate-900">
                Thông tin đặt vé
              </h3>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Mã vé
                </p>
                <p className="text-base font-mono text-slate-700">
                  {ticket._id}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Ngày tạo
                </p>
                <p className="text-base text-slate-700">
                  {new Date(ticket.createdAt).toLocaleDateString("vi-VN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Cập nhật lần cuối
                </p>
                <p className="text-base text-slate-700">
                  {new Date(ticket.updatedAt).toLocaleDateString("vi-VN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
