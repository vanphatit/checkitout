"use client";
import { useSearchParams } from "next/navigation";
import { FiAlertTriangle, FiArrowRight } from "react-icons/fi";
import Link from "next/link";
import { Suspense } from "react";

function PaymentErrorContent() {
  const searchParams = useSearchParams();
  const message =
    searchParams.get("message") || "Có lỗi xảy ra trong quá trình xử lý";

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <div className="bg-white border border-slate-200 rounded-3xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="p-8 text-center bg-gradient-to-br from-amber-500 to-amber-600">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                <FiAlertTriangle className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-black text-white mb-2">
              Có lỗi xảy ra
            </h1>
            <p className="text-white/90 text-lg">
              Không thể xử lý thanh toán của bạn
            </p>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="mb-6">
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 mb-6">
                <h3 className="text-sm font-bold text-amber-900 mb-2">
                  Chi tiết lỗi:
                </h3>
                <p className="text-amber-700">{decodeURIComponent(message)}</p>
              </div>

              <div className="text-center mb-6">
                <p className="text-slate-600 mb-2">
                  Vui lòng thử lại sau hoặc liên hệ với bộ phận hỗ trợ.
                </p>
                <p className="text-sm text-slate-500">
                  Chúng tôi xin lỗi vì sự bất tiện này.
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
                href="/"
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-slate-200 text-slate-900 rounded-xl font-bold hover:bg-slate-50 transition-colors"
              >
                Về trang chủ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    }>
      <PaymentErrorContent />
    </Suspense>
  );
}
