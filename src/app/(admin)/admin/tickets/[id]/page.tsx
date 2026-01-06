"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ticketService } from "@/services/ticketService";
import { schedulingService } from "@/services/schedulingService";
import { seatService } from "@/services/seatService";
import { Ticket, TicketStatus } from "@/types/ticket";
import { Scheduling } from "@/types/scheduling";
import { Seat } from "@/types/seat";
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
  FiTrendingUp,
  FiAlertTriangle,
  FiRefreshCw,
  FiDownload,
} from "react-icons/fi";
import Link from "next/link";
import Image from "next/image";

export default function AdminTicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id as string;

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  // Transfer modal state
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferData, setTransferData] = useState({
    newSchedulingId: "",
    newSeatId: "",
    reason: "",
  });
  
  // Transfer modal dropdown data - NO ROUTE SELECTION (must be same route)
  const [currentRouteId, setCurrentRouteId] = useState<string>("");
  const [schedulings, setSchedulings] = useState<Scheduling[]>([]);
  const [selectedSchedulingId, setSelectedSchedulingId] = useState<string>("");
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loadingSchedulings, setLoadingSchedulings] = useState(false);
  const [loadingSeats, setLoadingSeats] = useState(false);

  // Cancel modal state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  // Confirm payment modal state
  const [showConfirmPaymentModal, setShowConfirmPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"BANKING" | "CASH">("BANKING");

  // Check if ticket can be transferred (must be at least 3 hours before departure)
  const canTransfer = (): boolean => {
    if (!ticket || ticket.status !== TicketStatus.SUCCESS) return false;
    
    const departureDate = ticket.snapshot?.scheduling?.departureDate;
    if (!departureDate) return false;
    
    const now = new Date();
    const departure = new Date(departureDate);
    const hoursUntilDeparture = (departure.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    return hoursUntilDeparture >= 3;
  };

  useEffect(() => {
    if (!ticketId) return;
    loadTicket();
    
    // Cleanup QR code URL on unmount
    return () => {
      if (qrCodeUrl) {
        URL.revokeObjectURL(qrCodeUrl);
      }
    };
  }, [ticketId]);

  // Load schedulings of same route when transfer modal opens
  useEffect(() => {
    if (showTransferModal && ticket) {
      // Get routeId from snapshot (most reliable source)
      const routeId = ticket.snapshot?.route?.routeId;
      
      if (routeId) {
        setCurrentRouteId(routeId);
        setLoadingSchedulings(true);
        schedulingService
          .getSchedulingsByRoute(routeId)
          .then((allSchedulings) => {
            // Filter out the current scheduling and only show available ones with same price
            const currentSchedulingId = typeof ticket.schedulingId === 'string' 
              ? ticket.schedulingId 
              : ticket.schedulingId._id;
            
            // Get current ticket price from snapshot
            const currentPrice = ticket.snapshot?.scheduling?.price;
            
            const availableSchedulings = allSchedulings.filter(
              s => s._id !== currentSchedulingId && 
                   s.availableSeats > 0 &&
                   (!currentPrice || s.price === currentPrice)  // Must have same price
            );
            setSchedulings(availableSchedulings);
          })
          .catch(console.error)
          .finally(() => setLoadingSchedulings(false));
      }
    } else {
      // Reset when modal closes
      setCurrentRouteId("");
      setSchedulings([]);
      setSelectedSchedulingId("");
      setSeats([]);
    }
  }, [showTransferModal, ticket]);

  // Load seats when scheduling is selected
  useEffect(() => {
    if (selectedSchedulingId) {
      const selectedScheduling = schedulings.find(s => s._id === selectedSchedulingId);
      if (selectedScheduling && selectedScheduling.busIds && selectedScheduling.busIds.length > 0) {
        setLoadingSeats(true);
        // Get first bus from busIds array
        const firstBus = selectedScheduling.busIds[0];
        const busId = typeof firstBus === 'string' 
          ? firstBus 
          : firstBus._id;
        
        seatService
          .getSeatsByBusId(busId)
          .then((allSeats) => {
            // Filter only EMPTY seats
            const availableSeats = allSeats.filter(seat => seat.status === 'EMPTY');
            setSeats(availableSeats);
          })
          .catch(console.error)
          .finally(() => setLoadingSeats(false));
      }
      // Update transfer data
      setTransferData(prev => ({
        ...prev,
        newSchedulingId: selectedSchedulingId
      }));
    } else {
      setSeats([]);
    }
  }, [selectedSchedulingId, schedulings]);

  const loadTicket = () => {
    setLoading(true);
    ticketService
      .getTicketById(ticketId)
      .then(async (data) => {
        setTicket(data);
        
        // Load QR code if ticket is successful
        if (data.status === "SUCCESS") {
          try {
            const qrBlob = await ticketService.generateQRCode(data._id);
            const qrUrl = URL.createObjectURL(qrBlob);
            setQrCodeUrl(qrUrl);
          } catch (qrError) {
            console.error("Error loading QR code:", qrError);
          }
        }
      })
      .catch((err) => {
        console.error("Error fetching ticket:", err);
        setError(err.response?.data?.message || "Không thể tải thông tin vé");
      })
      .finally(() => setLoading(false));
  };

  const handleTransfer = async () => {
    if (!ticket?._id) return;
    if (!transferData.newSchedulingId || !transferData.newSeatId) {
      alert("Vui lòng nhập đầy đủ thông tin chuyến đi và ghế mới");
      return;
    }

    setActionLoading(true);
    try {
      await ticketService.transferTicket(ticket._id, transferData);
      alert("Chuyển vé thành công!");
      setShowTransferModal(false);
      loadTicket();
    } catch (err: any) {
      console.error("Transfer error:", err);
      alert(err.response?.data?.message || "Không thể chuyển vé");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!ticket?._id) return;

    if (!confirm(`Bạn có chắc chắn muốn hủy vé này?`)) return;

    setActionLoading(true);
    try {
      await ticketService.failTicket(ticket._id, cancelReason || undefined);
      alert("Hủy vé thành công!");
      setShowCancelModal(false);
      loadTicket();
    } catch (err: any) {
      console.error("Cancel error:", err);
      alert(err.response?.data?.message || "Không thể hủy vé");
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!ticket?._id) return;

    setActionLoading(true);
    try {
      await ticketService.updateTicketStatus(ticket._id, {
        status: "SUCCESS",
        paymentMethod,
      });
      alert("Xác nhận thanh toán thành công!");
      setShowConfirmPaymentModal(false);
      loadTicket();
    } catch (err: any) {
      console.error("Confirm payment error:", err);
      alert(err.response?.data?.message || "Không thể xác nhận thanh toán");
    } finally {
      setActionLoading(false);
    }
  };

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
            href="/admin/tickets"
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

  const getStatusBgColor = () => {
    switch (ticket.status) {
      case "SUCCESS":
        return "bg-emerald-50 border border-emerald-200";
      case "PENDING":
        return "bg-amber-50 border border-amber-200";
      case "FAILED":
        return "bg-rose-50 border border-rose-200";
      case "TRANSFER":
        return "bg-blue-50 border border-blue-200";
      default:
        return "bg-neutral-50 border border-neutral-200";
    }
  };

  const getStatusTextColor = () => {
    switch (ticket.status) {
      case "SUCCESS":
        return "text-emerald-900";
      case "PENDING":
        return "text-amber-900";
      case "FAILED":
        return "text-rose-900";
      case "TRANSFER":
        return "text-blue-900";
      default:
        return "text-neutral-900";
    }
  };

  const canTransferOrCancel = ticket.status === "SUCCESS" || ticket.status === "PENDING";
  const isPending = ticket.status === "PENDING";
  const isSuccess = ticket.status === "SUCCESS";

  return (
    <div className="min-h-screen bg-[#F9FAFB] py-10 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link
              href="/admin/tickets"
              className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold mb-4 transition-colors"
            >
              <FiArrowLeft /> Quay lại danh sách vé
            </Link>
            <h1 className="text-3xl font-bold text-neutral-900">
              Chi tiết vé
            </h1>
          </div>
          <button
            onClick={loadTicket}
            className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
          >
            <FiRefreshCw className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Status Banner with Actions */}
        <div
          className={`${getStatusBgColor()} rounded-xl p-8 mb-8 shadow-sm`}
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white rounded-xl shadow-sm flex items-center justify-center">
                {getStatusIcon()}
              </div>
              <div>
                <p className={`text-xs font-semibold uppercase tracking-wider ${getStatusTextColor()} opacity-70`}>
                  Trạng thái vé
                </p>
                <h2 className={`text-2xl font-bold mt-1 ${getStatusTextColor()}`}>{getStatusText()}</h2>
              </div>
            </div>
            {isPending && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowConfirmPaymentModal(true)}
                  className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-sm"
                >
                  <FiCheckCircle />
                  Xác nhận thanh toán
                </button>
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="px-5 py-2.5 bg-white border border-neutral-300 text-neutral-700 rounded-lg font-semibold hover:bg-neutral-50 transition-all flex items-center gap-2"
                >
                  <FiXCircle />
                  Hủy vé
                </button>
              </div>
            )}
            {isSuccess && (
              <div className="flex items-center gap-3">
                <div className="relative group">
                  <button
                    onClick={() => setShowTransferModal(true)}
                    disabled={!canTransfer()}
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-sm disabled:bg-slate-400 disabled:cursor-not-allowed disabled:hover:bg-slate-400"
                  >
                    <FiTrendingUp />
                    Chuyển vé
                  </button>
                  {!canTransfer() && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap shadow-lg z-10">
                      Vé sắp khởi hành, không thể chuyển vé
                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-800"></div>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleDownloadPDF}
                  disabled={downloadingPDF}
                  className="px-5 py-2.5 bg-white border border-neutral-300 text-neutral-700 rounded-lg font-semibold hover:bg-neutral-50 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <FiDownload />
                  {downloadingPDF ? "Đang tải..." : "Tải vé PDF"}
                </button>
              </div>
            )}
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
                <p className="text-base font-mono text-slate-700 break-all">
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

          {/* QR Code - Only show for SUCCESS tickets */}
          {ticket.status === "SUCCESS" && qrCodeUrl && (
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <FiDownload className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-black text-slate-900">
                  Mã QR vé
                </h3>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                  <Image
                    src={qrCodeUrl}
                    alt="QR Code"
                    width={200}
                    height={200}
                    className="w-48 h-48"
                  />
                </div>
                <p className="text-sm text-slate-500 mt-4 text-center">
                  Mã QR để kiểm tra vé
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl my-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <FiTrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-black text-slate-900">Chuyển vé</h3>
            </div>

            {/* Info about same route and price requirement */}
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Lưu ý:</strong> Chỉ có thể chuyển vé sang chuyến đi khác trên cùng tuyến đường và cùng mức giá ({ticket.snapshot?.scheduling?.price?.toLocaleString('vi-VN') || '0'} VNĐ).
              </p>
            </div>

            <div className="space-y-4 mb-6">
              {/* Scheduling Selection - Same Route and Price Only */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Chọn chuyến đi mới (cùng tuyến, cùng giá) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedSchedulingId}
                  onChange={(e) => setSelectedSchedulingId(e.target.value)}
                  disabled={loadingSchedulings}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-slate-100 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {loadingSchedulings 
                      ? "Đang tải..." 
                      : schedulings.length === 0 
                      ? "Không có chuyến đi nào phù hợp (cùng tuyến và cùng giá)" 
                      : "-- Chọn chuyến đi --"}
                  </option>
                  {schedulings.map((scheduling) => (
                    <option key={scheduling._id} value={scheduling._id}>
                      {new Date(scheduling.departureDate).toLocaleDateString('vi-VN')} - {scheduling.etd} 
                      ({scheduling.availableSeats} ghế trống)
                    </option>
                  ))}
                </select>
              </div>

              {/* Seat Selection */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Chọn ghế <span className="text-rose-500">*</span>
                </label>
                <select
                  value={transferData.newSeatId}
                  onChange={(e) =>
                    setTransferData({
                      ...transferData,
                      newSeatId: e.target.value,
                    })
                  }
                  disabled={!selectedSchedulingId || loadingSeats}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-slate-100 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {loadingSeats 
                      ? "Đang tải ghế..." 
                      : seats.length === 0 
                      ? "Không có ghế trống" 
                      : "-- Chọn ghế --"}
                  </option>
                  {seats.map((seat) => (
                    <option key={seat._id} value={seat._id}>
                      Ghế {seat.seatNo}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Lý do (tùy chọn)
                </label>
                <textarea
                  value={transferData.reason}
                  onChange={(e) =>
                    setTransferData({ ...transferData, reason: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Nhập lý do chuyển vé"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleTransfer}
                disabled={actionLoading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? "Đang xử lý..." : "Xác nhận chuyển"}
              </button>
              <button
                onClick={() => setShowTransferModal(false)}
                disabled={actionLoading}
                className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center">
                <FiAlertTriangle className="w-6 h-6 text-rose-600" />
              </div>
              <h3 className="text-2xl font-black text-slate-900">Hủy vé</h3>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Lý do hủy (tùy chọn)
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
                rows={3}
                placeholder="Nhập lý do hủy vé"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleCancel}
                disabled={actionLoading}
                className="flex-1 px-6 py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? "Đang xử lý..." : "Xác nhận hủy"}
              </button>
              <button
                onClick={() => setShowCancelModal(false)}
                disabled={actionLoading}
                className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Payment Modal */}
      {showConfirmPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                <FiCheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-black text-slate-900">
                Xác nhận thanh toán
              </h3>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Phương thức thanh toán <span className="text-rose-500">*</span>
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => setPaymentMethod("BANKING")}
                  className={`flex-1 px-4 py-3 rounded-xl font-bold transition-all border-2 ${
                    paymentMethod === "BANKING"
                      ? "bg-blue-50 border-blue-500 text-blue-700"
                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-400"
                  }`}
                >
                  Chuyển khoản
                </button>
                <button
                  onClick={() => setPaymentMethod("CASH")}
                  className={`flex-1 px-4 py-3 rounded-xl font-bold transition-all border-2 ${
                    paymentMethod === "CASH"
                      ? "bg-green-50 border-green-500 text-green-700"
                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-400"
                  }`}
                >
                  Tiền mặt
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Xác nhận rằng khách hàng đã thanh toán đầy đủ
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleConfirmPayment}
                disabled={actionLoading}
                className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? "Đang xử lý..." : "Xác nhận"}
              </button>
              <button
                onClick={() => setShowConfirmPaymentModal(false)}
                disabled={actionLoading}
                className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
