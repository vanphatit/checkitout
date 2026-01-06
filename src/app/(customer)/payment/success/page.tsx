"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ticketService } from "@/services/ticketService";
import { Ticket } from "@/types/ticket";
import {
  FiCheckCircle,
  FiLoader,
  FiArrowRight,
  FiDownload,
} from "react-icons/fi";
import Link from "next/link";
import Image from "next/image";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  const ticketId = searchParams.get("ticketId");
  const transactionId = searchParams.get("transactionId");

  useEffect(() => {
    const fetchTicket = async () => {
      if (!ticketId) {
        setLoading(false);
        return;
      }

      try {
        const data = await ticketService.getTicketById(ticketId);
        setTicket(data);

        // Load QR code
        try {
          const qrBlob = await ticketService.generateQRCode(ticketId);
          const qrUrl = URL.createObjectURL(qrBlob);
          setQrCodeUrl(qrUrl);
        } catch (qrError) {
          console.error("Error loading QR code:", qrError);
        }
      } catch (error) {
        console.error("Error fetching ticket:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();

    // Cleanup QR code URL on unmount
    return () => {
      if (qrCodeUrl) {
        URL.revokeObjectURL(qrCodeUrl);
      }
    };
  }, [ticketId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center max-w-md w-full shadow-lg">
          <div className="flex justify-center mb-6">
            <FiLoader className="w-16 h-16 text-blue-600 animate-spin" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">
            Đang tải thông tin vé
          </h2>
          <p className="text-slate-500">Vui lòng đợi trong giây lát...</p>
        </div>
      </div>
    );
  }

  const user = typeof ticket?.userId === "object" ? ticket.userId : null;
  const seat = typeof ticket?.seatId === "object" ? ticket.seatId : null;
  const scheduling =
    typeof ticket?.schedulingId === "object" ? ticket.schedulingId : null;
  const promotion =
    typeof ticket?.promotionId === "object" ? ticket.promotionId : null;

  const handleDownloadPDF = async () => {
    if (!ticket?._id) return;

    setDownloadingPDF(true);
    try {
      const blob = await ticketService.downloadTicketPDF(ticket._id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ticket-${ticket._id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error("PDF download error:", err);
      alert(err.response?.data?.message || "Không thể tải vé PDF");
    } finally {
      setDownloadingPDF(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-6 lg:p-10">
      <div className="max-w-3xl mx-auto">
        {/* Success Card */}
        <div className="bg-white border border-slate-200 rounded-3xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="p-8 text-center bg-gradient-to-br from-emerald-500 to-emerald-600">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                <FiCheckCircle className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-black text-white mb-2">
              Thanh toán thành công!
            </h1>
            <p className="text-white/90 text-lg">
              Vé của bạn đã được đặt thành công
            </p>
          </div>

          {/* Ticket Details */}
          {ticket && (
            <div className="p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-black text-slate-900 mb-4">
                  Thông tin vé
                </h2>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
                  {/* Ticket ID */}
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200">
                    <span className="text-sm text-slate-500">Mã vé</span>
                    <span className="text-lg font-black text-blue-600">
                      #{ticket._id.slice(-8).toUpperCase()}
                    </span>
                  </div>

                  {/* Customer Info */}
                  <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-slate-200">
                    <div>
                      <span className="text-sm text-slate-500 block mb-1">
                        Khách hàng
                      </span>
                      <span className="font-bold text-slate-900">
                        {user?.firstName} {user?.lastName}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-slate-500 block mb-1">
                        Số điện thoại
                      </span>
                      <span className="font-bold text-slate-900">
                        {user?.phone}
                      </span>
                    </div>
                  </div>

                  {/* Trip Info */}
                  <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-slate-200">
                    <div>
                      <span className="text-sm text-slate-500 block mb-1">
                        Số ghế
                      </span>
                      <span className="font-bold text-slate-900 text-lg">
                        {seat?.seatNo}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-slate-500 block mb-1">
                        Ngày khởi hành
                      </span>
                      <span className="font-bold text-slate-900">
                        {scheduling
                          ? new Date(
                            scheduling.departureDate
                          ).toLocaleDateString("vi-VN")
                          : "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-slate-500 block mb-1">
                        Giờ khởi hành
                      </span>
                      <span className="font-bold text-slate-900">
                        {scheduling?.etd || "N/A"}
                      </span>
                    </div>
                    {promotion && (
                      <div>
                        <span className="text-sm text-slate-500 block mb-1">
                          Khuyến mãi
                        </span>
                        <span className="font-bold text-emerald-600">
                          -{promotion.value}%
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Payment Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-slate-500 block mb-1">
                        Tổng tiền
                      </span>
                      <span className="font-black text-slate-900 text-2xl">
                        {ticketService.formatCurrency(ticket.totalPrice)}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-slate-500 block mb-1">
                        Phương thức
                      </span>
                      <span
                        className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-black uppercase border ${ticketService.getPaymentMethodColor(
                          ticket.paymentMethod
                        )}`}
                      >
                        {ticket.paymentMethod}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transaction Details */}
              {transactionId && (
                <div className="mb-6">
                  <h3 className="text-lg font-black text-slate-900 mb-3">
                    Chi tiết giao dịch
                  </h3>
                  <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                    <div className="grid grid-cols-1 gap-3 text-sm">
                      <div>
                        <span className="text-slate-500">Mã giao dịch:</span>
                        <span className="ml-2 font-bold text-slate-900">
                          {transactionId}
                        </span>
                      </div>
                      {ticket.paidAt && (
                        <div>
                          <span className="text-slate-500">
                            Thời gian thanh toán:
                          </span>
                          <span className="ml-2 font-bold text-slate-900">
                            {new Date(ticket.paidAt).toLocaleString("vi-VN")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* QR Code Section */}
              {qrCodeUrl && (
                <div className="mb-6">
                  <h3 className="text-lg font-black text-slate-900 mb-3">
                    Mã QR vé của bạn
                  </h3>
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col items-center">
                    <div className="bg-white p-4 rounded-xl shadow-sm">
                      <Image
                        src={qrCodeUrl}
                        alt="QR Code"
                        width={200}
                        height={200}
                        className="w-48 h-48"
                      />
                    </div>
                    <p className="text-sm text-slate-500 mt-3 text-center">
                      Quét mã QR này khi lên xe
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleDownloadPDF}
                  disabled={downloadingPDF}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {downloadingPDF ? (
                    <>
                      <FiLoader className="animate-spin" />
                      Đang tải...
                    </>
                  ) : (
                    <>
                      <FiDownload />
                      Tải vé PDF
                    </>
                  )}
                </button>
                <Link
                  href="/my-tickets"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
                >
                  Xem tất cả vé
                  <FiArrowRight />
                </Link>
                <Link
                  href="/"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-slate-200 text-slate-900 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                >
                  Về trang chủ
                </Link>
              </div>
            </div>
          )}

          {/* No Ticket Found */}
          {!ticket && !loading && (
            <div className="p-8 text-center">
              <p className="text-slate-600 mb-6">
                Không tìm thấy thông tin vé. Vui lòng kiểm tra lại.
              </p>
              <Link
                href="/my-tickets"
                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
              >
                Xem vé của tôi
                <FiArrowRight />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
