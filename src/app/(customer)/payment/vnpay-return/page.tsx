"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/lib/axios";
import { ApiResponse } from "@/types/auth";
import { Ticket } from "@/types/ticket";
import { ticketService } from "@/services/ticketService";
import {
  FiCheckCircle,
  FiXCircle,
  FiLoader,
  FiArrowRight,
} from "react-icons/fi";
import Link from "next/link";

export default function VNPayReturnPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    ticket?: Ticket;
    paymentInfo?: any;
  } | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get all VNPay params from URL
        const vnpParams: any = {};
        searchParams.forEach((value, key) => {
          vnpParams[key] = value;
        });

        // Call backend to verify and process payment
        const res = await api.get<
          ApiResponse<{
            success: boolean;
            message: string;
            ticket?: Ticket;
            paymentInfo?: any;
          }>
        >("/payment/vnpay-return", {
          params: vnpParams,
        });

        if (res.data.data) {
          setResult(res.data.data);
        }
      } catch (error: any) {
        setResult({
          success: false,
          message:
            error.response?.data?.message ||
            "Có lỗi xảy ra khi xử lý thanh toán",
        });
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center max-w-md w-full shadow-lg">
          <div className="flex justify-center mb-6">
            <FiLoader className="w-16 h-16 text-blue-600 animate-spin" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">
            Đang xử lý thanh toán
          </h2>
          <p className="text-slate-500">Vui lòng đợi trong giây lát...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center max-w-md w-full shadow-lg">
          <div className="flex justify-center mb-6">
            <FiXCircle className="w-16 h-16 text-rose-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Lỗi</h2>
          <p className="text-slate-500 mb-6">
            Không thể xử lý thông tin thanh toán
          </p>
          <Link
            href="/my-tickets"
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
          >
            Về trang vé của tôi
            <FiArrowRight />
          </Link>
        </div>
      </div>
    );
  }

  const { success, message, ticket, paymentInfo } = result;

  const user = typeof ticket?.userId === "object" ? ticket.userId : null;
  const seat = typeof ticket?.seatId === "object" ? ticket.seatId : null;
  const scheduling =
    typeof ticket?.schedulingId === "object" ? ticket.schedulingId : null;
  const promotion =
    typeof ticket?.promotionId === "object" ? ticket.promotionId : null;

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-6 lg:p-10">
      <div className="max-w-3xl mx-auto">
        {/* Result Card */}
        <div className="bg-white border border-slate-200 rounded-3xl shadow-lg overflow-hidden">
          {/* Header */}
          <div
            className={`p-8 text-center ${
              success
                ? "bg-gradient-to-br from-emerald-500 to-emerald-600"
                : "bg-gradient-to-br from-rose-500 to-rose-600"
            }`}
          >
            <div className="flex justify-center mb-4">
              {success ? (
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                  <FiCheckCircle className="w-12 h-12 text-white" />
                </div>
              ) : (
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                  <FiXCircle className="w-12 h-12 text-white" />
                </div>
              )}
            </div>
            <h1 className="text-3xl font-black text-white mb-2">
              {success ? "Thanh toán thành công!" : "Thanh toán thất bại"}
            </h1>
            <p className="text-white/90 text-lg">{message}</p>
          </div>

          {/* Ticket Details */}
          {success && ticket && (
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

              {/* Payment Transaction Details */}
              {paymentInfo && (
                <div className="mb-6">
                  <h3 className="text-lg font-black text-slate-900 mb-3">
                    Chi tiết giao dịch
                  </h3>
                  <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-slate-500">Mã GD:</span>
                        <span className="ml-2 font-bold text-slate-900">
                          {paymentInfo.transactionId}
                        </span>
                      </div>
                      {paymentInfo.vnpayTransactionNo && (
                        <div>
                          <span className="text-slate-500">Mã GD VNPay:</span>
                          <span className="ml-2 font-bold text-slate-900">
                            {paymentInfo.vnpayTransactionNo}
                          </span>
                        </div>
                      )}
                      {paymentInfo.bankCode && (
                        <div>
                          <span className="text-slate-500">Ngân hàng:</span>
                          <span className="ml-2 font-bold text-slate-900">
                            {paymentInfo.bankCode}
                          </span>
                        </div>
                      )}
                      {paymentInfo.paidAt && (
                        <div>
                          <span className="text-slate-500">
                            Thời gian thanh toán:
                          </span>
                          <span className="ml-2 font-bold text-slate-900">
                            {new Date(paymentInfo.paidAt).toLocaleString(
                              "vi-VN"
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
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

          {/* Failed Payment Actions */}
          {!success && (
            <div className="p-8">
              <div className="text-center mb-6">
                <p className="text-slate-600 mb-4">
                  Giao dịch không thành công. Vui lòng thử lại hoặc chọn
                  phương thức thanh toán khác.
                </p>
                {paymentInfo?.responseMessage && (
                  <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 mb-4">
                    <p className="text-sm text-rose-700">
                      {paymentInfo.responseMessage}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/my-tickets"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
                >
                  Về trang vé của tôi
                  <FiArrowRight />
                </Link>
                <Link
                  href="/scheduling"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-slate-200 text-slate-900 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                >
                  Đặt vé mới
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
