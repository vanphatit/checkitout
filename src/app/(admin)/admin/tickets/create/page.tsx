"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { schedulingService } from "@/services/schedulingService";
import { Scheduling } from "@/types/scheduling";
import { userService } from "@/services/userService";
import { seatService } from "@/services/seatService";
import { ticketService } from "@/services/ticketService";
import { User } from "@/types/auth";
import { Seat } from "@/types/seat";
import { BusType } from "@/types/bus";
import SeatLegend from "@/components/busseat/seat/SeatLegend";
import SeatGrid from "@/components/busseat/seat/SeatGrid";
import SeatSelectionWithSocket from "@/components/admin/SeatSelectionWithSocket";
import {
  SeatWebSocketProvider,
  useSeatWebSocketContext,
} from "@/components/providers/SeatWebSocketProvider";
import {
  FiArrowLeft,
  FiSearch,
  FiLoader,
  FiCalendar,
  FiUser,
  FiCheckCircle,
  FiCreditCard,
} from "react-icons/fi";

type Step = "search-scheduling" | "search-customer" | "select-seat" | "confirm";

export default function CreateTicketPage() {
  const router = useRouter();

  // Step management
  const [currentStep, setCurrentStep] = useState<Step>("search-scheduling");

  // Step 1: Search Scheduling
  const [searchQuery, setSearchQuery] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [schedulings, setSchedulings] = useState<Scheduling[]>([]);
  const [schedulingLoading, setSchedulingLoading] = useState(false);
  const [selectedScheduling, setSelectedScheduling] =
    useState<Scheduling | null>(null);

  // Step 2: Search/Create Customer
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [showCreateCustomer, setShowCreateCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  // Step 3: Select Seat
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [seatsLoading, setSeatsLoading] = useState(false);

  // Step 4: Confirm & Payment
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "BANKING">(
    "CASH"
  );
  const [creating, setCreating] = useState(false);
  const [createdTicket, setCreatedTicket] = useState<any>(null);

  // Handlers
  const handleSearchScheduling = async () => {
    setSchedulingLoading(true);
    try {
      const result = await schedulingService.getSchedulings({
        query: searchQuery || undefined,
        date: searchDate || undefined,
        page: 1,
        limit: 20,
      });
      setSchedulings(result.data);
    } catch (error: any) {
      alert(error.response?.data?.message || "Không thể tìm kiếm lịch trình");
    } finally {
      setSchedulingLoading(false);
    }
  };

  const handleSelectScheduling = async (scheduling: Scheduling) => {
    setSelectedScheduling(scheduling);
    setCurrentStep("search-customer");
  };

  const handleSearchCustomer = async () => {
    if (!customerSearch.trim()) {
      alert("Vui lòng nhập số điện thoại");
      return;
    }

    setCustomerLoading(true);
    try {
      // Use dedicated phone lookup endpoint
      const user = await userService.getUserByPhone(customerSearch);
      if (user) {
        // Found existing user - show info, DON'T auto-load seats
        setSelectedCustomer(user);
        setShowCreateCustomer(false);
        // Don't auto-load seats here - user needs to click "Continue" button
      } else {
        // User not found - show form to collect name info
        // Will auto-create user when ticket is created
        setShowCreateCustomer(true);
        setSelectedCustomer(null);
        // Pre-fill phone number
        setNewCustomer({
          firstName: "",
          lastName: "",
          email: "",
          phone: customerSearch,
        });
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : (error as { response?: { data?: { message?: string } } })?.response
              ?.data?.message || "Không thể tìm kiếm khách hàng";
      alert(errorMessage);
    } finally {
      setCustomerLoading(false);
    }
  };

  const handleCreateCustomer = async () => {
    if (!newCustomer.phone.trim()) {
      alert("Vui lòng nhập số điện thoại");
      return;
    }

    // Don't create user here - just save info and proceed to seat selection
    // BE will auto-create user with PRE_REGISTERED status when ticket is created
    const tempUser: User = {
      id: "temp",
      firstName: newCustomer.firstName || "Guest",
      lastName: newCustomer.lastName || "Customer",
      email: newCustomer.email || "",
      phone: newCustomer.phone,
      role: "CUSTOMER",
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setSelectedCustomer(tempUser);
    setShowCreateCustomer(false);
    loadSeats();
  };

  const loadSeats = async () => {
    if (!selectedScheduling?.busIds?.[0]?._id) return;

    setSeatsLoading(true);
    setCurrentStep("select-seat");
    try {
      const result = await seatService.getSeatsByBusId(
        selectedScheduling.busIds[0]._id
      );
      setSeats(result);
    } catch (error: any) {
      alert(error.response?.data?.message || "Không thể tải danh sách ghế");
    } finally {
      setSeatsLoading(false);
    }
  };

  const handleSelectSeat = (seatNo: string) => {
    const seat = seats.find((s) => s.seatNo === seatNo);
    if (!seat || seat.status !== "EMPTY") return;
    setSelectedSeat(seat);
  };

  const handleCreateTicket = async () => {
    if (!selectedSeat || !selectedScheduling || !selectedCustomer) {
      alert("Thiếu thông tin để tạo vé");
      return;
    }

    if (!selectedCustomer.phone) {
      alert("Thiếu số điện thoại khách hàng");
      return;
    }

    setCreating(true);
    try {
      // Send phone, firstName, lastName - BE will auto-create user if not exists
      const ticket = await ticketService.createTicket({
        seatId: selectedSeat._id,
        schedulingId: selectedScheduling._id,
        phone: selectedCustomer.phone,
        firstName: selectedCustomer.firstName,
        lastName: selectedCustomer.lastName,
        paymentMethod,
      });
      setCreatedTicket(ticket);
    } catch (error: any) {
      alert(error.response?.data?.message || "Không thể tạo vé");
    } finally {
      setCreating(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!createdTicket) return;

    setCreating(true);
    try {
      await ticketService.updateTicketStatus(createdTicket._id, {
        status: "SUCCESS",
        paymentMethod,
      });
      alert("Xác nhận thanh toán thành công!");
      router.push(`/admin/tickets/${createdTicket._id}`);
    } catch (error: any) {
      alert(error.response?.data?.message || "Không thể xác nhận thanh toán");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] py-10 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/tickets"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold mb-4 transition-colors"
          >
            <FiArrowLeft /> Quay lại danh sách vé
          </Link>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Tạo vé mới
          </h1>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-10">
          <div className="flex items-center gap-3">
            <StepIndicator
              label="Tìm chuyến đi"
              active={currentStep === "search-scheduling"}
              completed={["search-customer", "select-seat", "confirm"].includes(
                currentStep
              )}
            />
            <div className="w-12 h-1 bg-slate-200" />
            <StepIndicator
              label="Tìm khách hàng"
              active={currentStep === "search-customer"}
              completed={["select-seat", "confirm"].includes(currentStep)}
            />
            <div className="w-12 h-1 bg-slate-200" />
            <StepIndicator
              label="Chọn ghế"
              active={currentStep === "select-seat"}
              completed={currentStep === "confirm"}
            />
            <div className="w-12 h-1 bg-slate-200" />
            <StepIndicator
              label="Xác nhận"
              active={currentStep === "confirm"}
              completed={false}
            />
          </div>
        </div>

        {/* Step 1: Search Scheduling */}
        {currentStep === "search-scheduling" && (
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
            <h2 className="text-2xl font-black text-slate-900 mb-6">
              Tìm kiếm chuyến đi
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Tên tuyến đường
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="VD: Hà Nội - Hải Phòng"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Ngày khởi hành
                </label>
                <input
                  type="date"
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <button
              onClick={handleSearchScheduling}
              disabled={schedulingLoading}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {schedulingLoading ? (
                <>
                  <FiLoader className="animate-spin" />
                  Đang tìm kiếm...
                </>
              ) : (
                <>
                  <FiSearch />
                  Tìm kiếm chuyến đi
                </>
              )}
            </button>

            {schedulings.length > 0 && (
              <div className="mt-8 space-y-3">
                <h3 className="text-lg font-bold text-slate-900">
                  Kết quả tìm kiếm ({schedulings.length})
                </h3>
                {schedulings.map((scheduling) => (
                  <button
                    key={scheduling._id}
                    onClick={() => handleSelectScheduling(scheduling)}
                    className="w-full text-left bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl p-5 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-900 mb-1">
                          {scheduling.routeId?.name || "N/A"}
                        </h4>
                        <p className="text-sm text-slate-600">
                          {new Date(
                            scheduling.departureDate
                          ).toLocaleDateString("vi-VN")}{" "}
                          - {scheduling.etd}
                        </p>
                        <p className="text-sm text-slate-500">
                          Xe: {scheduling.busIds?.[0]?.plateNo} | Ghế trống:{" "}
                          {scheduling.availableSeats || 0}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-blue-600">
                          {ticketService.formatCurrency(scheduling.price || 0)}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {schedulings.length === 0 && searchQuery && !schedulingLoading && (
              <div className="mt-8 text-center py-10">
                <p className="text-slate-400">Không tìm thấy chuyến đi nào</p>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Search/Create Customer */}
        {currentStep === "search-customer" && !showCreateCustomer && (
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-slate-900">
                Tìm kiếm khách hàng
              </h2>
              <button
                onClick={() => {
                  setCurrentStep("search-scheduling");
                  setSelectedCustomer(null);
                  setCustomerSearch("");
                }}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-all flex items-center gap-2"
              >
                <FiArrowLeft />
                Quay lại
              </button>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Số điện thoại khách hàng{" "}
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearchCustomer()}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập số điện thoại (VD: 0919121299)"
              />
            </div>
            <button
              onClick={handleSearchCustomer}
              disabled={customerLoading}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {customerLoading ? (
                <>
                  <FiLoader className="animate-spin" />
                  Đang tìm kiếm...
                </>
              ) : (
                <>
                  <FiSearch />
                  Tìm kiếm khách hàng
                </>
              )}
            </button>

            {selectedCustomer && (
              <div className="mt-8">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <FiCheckCircle className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold text-blue-900">
                      Người dùng đã tồn tại trong hệ thống
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-blue-600 font-semibold mb-1">
                        Họ tên
                      </p>
                      <p className="text-base font-bold text-blue-900">
                        {selectedCustomer.firstName} {selectedCustomer.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-600 font-semibold mb-1">
                        Số điện thoại
                      </p>
                      <p className="text-base font-bold text-blue-900">
                        {selectedCustomer.phone}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-600 font-semibold mb-1">
                        Email
                      </p>
                      <p className="text-base font-bold text-blue-900">
                        {selectedCustomer.email || (
                          <span className="text-slate-400 italic">Chưa có</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => {
                      setSelectedCustomer(null);
                      setCustomerSearch("");
                    }}
                    className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                  >
                    <FiArrowLeft />
                    Tìm lại
                  </button>
                  <button
                    onClick={loadSeats}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                  >
                    Tiếp tục chọn ghế
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Create Customer Form */}
        {currentStep === "search-customer" && showCreateCustomer && (
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-black text-amber-900">
                  ℹ️ Khách hàng chưa có trong hệ thống
                </h2>
                <button
                  onClick={() => {
                    setShowCreateCustomer(false);
                    setCustomerSearch("");
                  }}
                  className="px-3 py-1.5 bg-white text-amber-700 rounded-lg font-semibold hover:bg-amber-100 transition-all flex items-center gap-1 text-sm border border-amber-300"
                >
                  <FiArrowLeft className="w-4 h-4" />
                  Tìm lại
                </button>
              </div>
              <p className="text-sm text-amber-700">
                Vui lòng nhập thông tin khách hàng. Hệ thống sẽ tự động tạo tài
                khoản khi đặt vé.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 mb-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Số điện thoại <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  value={newCustomer.phone}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, phone: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập số điện thoại"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Họ
                  </label>
                  <input
                    type="text"
                    value={newCustomer.firstName}
                    onChange={(e) =>
                      setNewCustomer({
                        ...newCustomer,
                        firstName: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tùy chọn"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Tên
                  </label>
                  <input
                    type="text"
                    value={newCustomer.lastName}
                    onChange={(e) =>
                      setNewCustomer({
                        ...newCustomer,
                        lastName: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tùy chọn"
                  />
                </div>
              </div>
            </div>
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl p-3 mb-6">
              ℹ️ Nếu không nhập họ tên, hệ thống sẽ đặt mặc định là "Guest
              Customer"
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleCreateCustomer}
                disabled={!newCustomer.phone.trim()}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                Tiếp tục chọn ghế
              </button>
              <button
                onClick={() => {
                  setShowCreateCustomer(false);
                  setCustomerSearch("");
                }}
                className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all"
              >
                Hủy
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Select Seat */}
        {currentStep === "select-seat" &&
          selectedScheduling &&
          selectedCustomer && (
            <SeatSelectionWithSocket
              scheduling={selectedScheduling}
              customer={selectedCustomer}
              onBack={() => {
                setCurrentStep("search-customer");
                setSeats([]);
                setSelectedSeat(null);
              }}
              onContinue={(seat) => {
                setSelectedSeat(seat);
                setCurrentStep("confirm");
              }}
            />
          )}

        {/* Step 4: Confirm */}
        {currentStep === "confirm" && !createdTicket && (
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-slate-900">
                Xác nhận thông tin
              </h2>
              <button
                onClick={() => {
                  setCurrentStep("select-seat");
                }}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-all flex items-center gap-2"
              >
                <FiArrowLeft />
                Quay lại
              </button>
            </div>
            <div className="space-y-6 mb-8">
              <div className="bg-slate-50 rounded-xl p-5">
                <h3 className="font-bold text-slate-900 mb-3">Chuyến đi</h3>
                <p className="text-slate-700">
                  {selectedScheduling?.routeId?.name}
                </p>
                <p className="text-sm text-slate-500">
                  {selectedScheduling &&
                    new Date(
                      selectedScheduling.departureDate
                    ).toLocaleDateString("vi-VN")}{" "}
                  - {selectedScheduling?.etd}
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-5">
                <h3 className="font-bold text-slate-900 mb-3">Khách hàng</h3>
                <p className="text-slate-700">
                  {selectedCustomer?.firstName} {selectedCustomer?.lastName}
                </p>
                <p className="text-sm text-slate-500">
                  {selectedCustomer?.phone}
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-5">
                <h3 className="font-bold text-slate-900 mb-3">Ghế</h3>
                <p className="text-slate-700">{selectedSeat?.seatNo}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-5">
                <h3 className="font-bold text-slate-900 mb-3">
                  Phương thức thanh toán
                </h3>
                <div className="flex gap-3">
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
                </div>
              </div>
              <div className="bg-blue-50 rounded-xl p-5">
                <h3 className="font-bold text-blue-900 mb-2">Tổng tiền</h3>
                <p className="text-3xl font-black text-blue-600">
                  {ticketService.formatCurrency(selectedScheduling?.price || 0)}
                </p>
              </div>
            </div>
            <button
              onClick={handleCreateTicket}
              disabled={creating}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50"
            >
              {creating ? "Đang tạo vé..." : "Tạo vé"}
            </button>
          </div>
        )}

        {/* Created Ticket - Confirm Payment */}
        {createdTicket && (
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                <FiCheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-black text-slate-900">
                Vé đã được tạo thành công!
              </h2>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
              <p className="text-amber-800 font-bold mb-2">
                Vé đang ở trạng thái PENDING
              </p>
              <p className="text-sm text-amber-700">
                Vui lòng xác nhận thanh toán để hoàn tất vé
              </p>
            </div>
            <div className="space-y-3 mb-8">
              <div className="flex justify-between">
                <span className="text-slate-600">Mã vé:</span>
                <span className="font-mono font-bold">{createdTicket._id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Trạng thái:</span>
                <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-sm font-bold">
                  PENDING
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Tổng tiền:</span>
                <span className="font-bold text-lg">
                  {ticketService.formatCurrency(createdTicket.totalPrice)}
                </span>
              </div>
            </div>
            <button
              onClick={handleConfirmPayment}
              disabled={creating}
              className="w-full px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {creating ? (
                <>
                  <FiLoader className="animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <FiCreditCard />
                  Xác nhận thanh toán
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function StepIndicator({
  label,
  active,
  completed,
}: {
  label: string;
  active: boolean;
  completed: boolean;
}) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
          completed
            ? "bg-emerald-500 text-white"
            : active
            ? "bg-blue-600 text-white"
            : "bg-slate-200 text-slate-400"
        }`}
      >
        {completed ? <FiCheckCircle /> : active ? "●" : "○"}
      </div>
      <span
        className={`text-xs mt-2 font-bold ${
          active ? "text-blue-600" : "text-slate-400"
        }`}
      >
        {label}
      </span>
    </div>
  );
}
