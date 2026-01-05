"use client";
import { useSearchParams } from "next/navigation";
import { FiXCircle, FiArrowRight } from "react-icons/fi";
import Link from "next/link";

export default function PaymentFailedPage() {
  const searchParams = useSearchParams();
  const transactionId = searchParams.get("transactionId");
  const message = searchParams.get("message") || "Thanh toán không thành công";

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <div className="bg-white border border-slate-200 rounded-3xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="p-8 text-center bg-gradient-to-br from-rose-500 to-rose-600">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                <FiXCircle className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-black text-white mb-2">
              Thanh toán thất bại
            </h1>
            <p className="text-white/90 text-lg">
              Giao dịch của bạn không thành công
            </p>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="mb-6">
              <div className="bg-rose-50 border border-rose-100 rounded-2xl p-6 mb-6">
                <h3 className="text-sm font-bold text-rose-900 mb-2">
                  Lý do:
                </h3>
                <p className="text-rose-700">{decodeURIComponent(message)}</p>
              </div>

              {transactionId && (
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-6">
                  <div className="text-sm">
                    <span className="text-slate-500">Mã giao dịch:</span>
                    <span className="ml-2 font-bold text-slate-900">
                      {transactionId}
                    </span>
                  </div>
                </div>
              )}

              <div className="text-center mb-6">
                <p className="text-slate-600 mb-2">
                  Vui lòng thử lại hoặc chọn phương thức thanh toán khác.
                </p>
                <p className="text-sm text-slate-500">
                  Nếu bạn cần hỗ trợ, vui lòng liên hệ với chúng tôi.
                </p>
              </div>
            </div>

            {/* Actions */}
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
        </div>
      </div>
    </div>
  );
}
