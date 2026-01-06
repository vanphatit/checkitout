"use client";
import { useState } from "react";
import Link from "next/link";
import { BookingSummaryProps } from "@/types/bus";
import { ticketService } from "@/services/ticketService";
import { FiLoader } from "react-icons/fi";

export default function BookingSummary({
  selectedSeats,
  price,
  data,
  routeData,
  schedulingId,
  etd,
  eta,
  distance,
  estimatedDuration,
}: BookingSummaryProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const routeName = routeData.name;

  const [from, to] = routeName.split(" - ");

  const total = selectedSeats.reduce((sum, seatId) => {
    const seat = data.find((x) => x.seatNo === seatId);
    return sum + (seat ? price : 0);
  }, 0);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const handleCheckout = async () => {
    if (selectedSeats.length === 0) return;

    try {
      setIsProcessing(true);

      // Get selected seat IDs
      const seatIds = selectedSeats
        .map((seatNo) => {
          const seat = data.find((s) => s.seatNo === seatNo);
          return seat?._id;
        })
        .filter(Boolean) as string[];

      if (seatIds.length === 0) {
        alert("Không tìm thấy thông tin ghế. Vui lòng thử lại.");
        return;
      }

      // For now, use first seat (or you can handle multiple seats differently)
      const seatId = seatIds[0];

      // Call createAndPay API
      const result = await ticketService.createAndPay({
        seatId,
        schedulingId,
        paymentMethod: "BANKING",
      });

      if (result.payment.success && result.payment.paymentUrl) {
        // Redirect to VNPay
        window.location.href = result.payment.paymentUrl;
      } else {
        alert("Không thể tạo link thanh toán. Vui lòng thử lại.");
      }
    } catch (error: any) {
      console.error("Checkout error:", error);
      alert(
        error.response?.data?.message ||
          "Có lỗi xảy ra khi tạo vé. Vui lòng thử lại."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-neutral-50 rounded-xl py-4 px-6 border border-neutral-200 shadow-sm">
      <div className="w-full space-y-2">
        {/* Destination */}
        <div className="flex items-center justify-between">
          <h1 className="text-lg text-neutral-600 font-medium">
            Lộ trình của bạn
          </h1>
          <Link href="/scheduling" className="text-sm text-primary font-medium">
            Thay đổi lộ trình
          </Link>
        </div>

        <div className="space-y-1">
          <p className="text-sm text-neutral-400">
            Từ <span className="font-medium text-neutral-600">{from}</span>
          </p>
          <p className="text-sm text-neutral-400">
            Đến <span className="font-medium text-neutral-600">{to}</span>
          </p>

          {etd && eta && (
            <div className="flex items-center gap-2">
              <h1 className="text-sm text-neutral-600">
                Bắt đầu <span className="font-medium">({etd})</span>
              </h1>
              <div className="flex-1 border-dashed border border-neutral-300" />
              <h1 className="text-sm text-neutral-600">
                Kết thúc <span className="font-medium">({eta})</span>
              </h1>
            </div>
          )}

          {distance && (
            <p className="text-sm text-neutral-500">
              Khoảng cách:{" "}
              <span className="font-medium text-neutral-600">{distance}km</span>
            </p>
          )}

          {estimatedDuration && (
            <p className="text-sm text-neutral-500">
              Thời gian:{" "}
              <span className="font-medium text-neutral-600">
                {formatDuration(estimatedDuration)}
              </span>
            </p>
          )}
        </div>

        {/* Selected seats */}
        <div className="space-y-3">
          <h1 className="text-lg text-neutral-600 font-medium">
            Chỗ ngồi được chọn
          </h1>

          {selectedSeats.length === 0 ? (
            <p className="text-sm text-neutral-500">
              Không có chỗ nào được chọn
            </p>
          ) : (
            <div className="flex gap-3 flex-wrap">
              {selectedSeats.map((seatId) => (
                <div
                  key={seatId}
                  className="w-9 h-9 bg-neutral-200/80 rounded-lg flex items-center justify-center text-base text-neutral-700 font-semibold"
                >
                  {seatId}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Fare */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-dashed border-l pl-2">
            <h3 className="text-sm text-neutral-500">Giá vé:</h3>
            <p className="text-sm text-neutral-600">
              {price.toLocaleString()} VND
            </p>
          </div>

          <div className="flex items-center justify-between">
            <h3 className="text-base text-neutral-500">Tổng giá</h3>
            <span className="text-xs text-neutral-500">(Gồm thuế)</span>
          </div>

          <p className="text-base text-neutral-700 font-semibold">
            {total.toLocaleString()} VND
          </p>
        </div>

        {/* Checkout */}
        {selectedSeats.length > 0 ? (
          <button
            onClick={handleCheckout}
            disabled={isProcessing}
            className="block w-full bg-primary hover:bg-primary/90 text-sm text-white py-2.5 rounded-lg text-center uppercase disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <FiLoader className="w-4 h-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              "Hoàn tất để thanh toán"
            )}
          </button>
        ) : (
          <div className="space-y-1">
            <button
              disabled
              className="w-full bg-primary text-white py-2.5 rounded-lg opacity-50 cursor-not-allowed"
            >
              Hoàn tất để thanh toán
            </button>
            <small className="text-xs text-neutral-600">
              Phải chọn ít nhất một chỗ ngồi để tiếp tục.
            </small>
          </div>
        )}
      </div>
    </div>
  );
}
