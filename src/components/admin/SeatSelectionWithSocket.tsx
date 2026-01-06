"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { SeatWebSocketProvider, useSeatWebSocketContext } from "@/components/providers/SeatWebSocketProvider";
import SeatLegend from "@/components/busseat/seat/SeatLegend";
import SeatGrid from "@/components/busseat/seat/SeatGrid";
import { Seat } from "@/types/seat";
import { BusType } from "@/types/bus";
import { Scheduling } from "@/types/scheduling";
import { User } from "@/types/auth";
import { seatService } from "@/services/seatService";
import { ticketService } from "@/services/ticketService";
import { FiArrowLeft, FiLoader } from "react-icons/fi";

interface SeatSelectionWithSocketProps {
    scheduling: Scheduling;
    customer: User;
    onBack: () => void;
    onContinue: (seat: Seat) => void;
}

function SeatSelectionContent({ scheduling, customer, onBack, onContinue }: SeatSelectionWithSocketProps) {
    const [seats, setSeats] = useState<Seat[]>([]);
    const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
    const [seatsLoading, setSeatsLoading] = useState(true);

    const { lockSeat, unlockSeat, isSeatLockedByOthers, isSeatLockedByMe, isConnected, updateTrigger } = useSeatWebSocketContext();

    useEffect(() => {
        loadSeats();
    }, [scheduling]);

    useEffect(() => {
        if (selectedSeat) {
            console.log("🎨 Selected seat changed:", selectedSeat.seatNo);
        }
    }, [selectedSeat]);

    const loadSeats = async () => {
        if (!scheduling?.busIds?.[0]?._id) return;

        setSeatsLoading(true);
        try {
            const result = await seatService.getSeatsByBusId(scheduling.busIds[0]._id);
            setSeats(result);
        } catch (error: any) {
            alert(error.response?.data?.message || "Không thể tải danh sách ghế");
        } finally {
            setSeatsLoading(false);
        }
    };

    const handleSelectSeat = useCallback((seatNo: string) => {
        console.log("🎯 handleSelectSeat called:", seatNo, "current selectedSeat:", selectedSeat?.seatNo);
        const seat = seats.find(s => s.seatNo === seatNo);
        if (!seat) return;

        // Check if seat is locked by others
        if (isSeatLockedByOthers(seatNo)) {
            alert("Ghế này đang được chọn bởi người khác");
            return;
        }

        // Check if seat is booked
        if (seat.status === "SOLD") {
            alert("Ghế này đã được đặt");
            return;
        }

        // If already selected this seat, unselect it
        if (selectedSeat?.seatNo === seatNo) {
            unlockSeat(seatNo);
            setSelectedSeat(null);
            console.log("✖️ Unselected seat:", seatNo);
            return;
        }

        // Unlock previous seat if any
        if (selectedSeat) {
            unlockSeat(selectedSeat.seatNo);
        }

        // Lock new seat
        lockSeat(seatNo, customer.id);
        setSelectedSeat(seat);
        console.log("✅ Selected seat:", seatNo, "selectedSeats will be:", [seatNo]);
    }, [seats, selectedSeat, isSeatLockedByOthers, unlockSeat, lockSeat, customer.id]);

    // Get combined seat status (booked OR locked by others)
    const getSeatStatus = useCallback((seat: Seat): "EMPTY" | "SOLD" | "LOCKED" => {
        if (seat.status === "SOLD") return "SOLD";
        if (isSeatLockedByOthers(seat.seatNo)) return "LOCKED";
        return "EMPTY";
    }, [isSeatLockedByOthers]);

    // Transform seats with WebSocket lock status - MUST use useMemo to trigger re-render when locks change
    const seatsWithLockStatus = useMemo(() => {
        console.log("🔄 Recalculating seatsWithLockStatus, updateTrigger:", updateTrigger);
        return seats.map(seat => ({
            ...seat,
            status: getSeatStatus(seat),
            isLockedByOthers: isSeatLockedByOthers(seat.seatNo),
            isLockedByMe: isSeatLockedByMe(seat.seatNo),
        }));
    }, [seats, getSeatStatus, isSeatLockedByOthers, isSeatLockedByMe, updateTrigger]);

    if (seatsLoading) {
        return (
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
                <div className="flex justify-center py-10">
                    <FiLoader className="w-10 h-10 text-blue-500 animate-spin" />
                </div>
            </div>
        );
    }

    if (!scheduling.busIds?.[0]) {
        return (
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
                <p className="text-center text-slate-500">Không thể tải thông tin ghế</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-black text-slate-900">Chọn ghế</h2>
                    {isConnected && (
                        <p className="text-xs text-green-600 mt-1">🟢 Đang kết nối real-time</p>
                    )}
                    {!isConnected && (
                        <p className="text-xs text-amber-600 mt-1">🟡 Đang kết nối lại...</p>
                    )}
                </div>
                <button
                    onClick={() => {
                        if (selectedSeat) {
                            unlockSeat(selectedSeat.seatNo);
                        }
                        onBack();
                    }}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-all flex items-center gap-2"
                >
                    <FiArrowLeft />
                    Quay lại
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-10">
                {/* LEFT – SEAT AREA */}
                <div className="col-span-1 md:col-span-3 w-full flex flex-col items-stretch shadow-sm rounded-xl p-3 border border-neutral-200 space-y-6">
                    <SeatLegend />
                    <SeatGrid
                        type={scheduling.busIds[0].type as BusType}
                        data={seatsWithLockStatus}
                        selectedSeats={selectedSeat ? [selectedSeat.seatNo] : []}
                        onSeatClick={handleSelectSeat}
                    />
                </div>

                {/* RIGHT – BOOKING INFO */}
                <div className="col-span-1 md:col-span-2 w-full">
                    <div className="bg-slate-50 rounded-xl p-6 sticky top-6">
                        <h3 className="text-lg font-black text-slate-900 mb-4">
                            Thông tin đặt vé
                        </h3>

                        {/* Route Info */}
                        <div className="mb-4 pb-4 border-b border-slate-200">
                            <p className="text-xs text-slate-500 mb-1">Tuyến đường</p>
                            <p className="font-bold text-slate-900">
                                {scheduling.routeId?.name}
                            </p>
                            <p className="text-sm text-slate-600 mt-1">
                                {new Date(scheduling.departureDate).toLocaleDateString("vi-VN")} • {scheduling.etd}
                            </p>
                        </div>

                        {/* Customer Info */}
                        <div className="mb-4 pb-4 border-b border-slate-200">
                            <p className="text-xs text-slate-500 mb-1">Khách hàng</p>
                            <p className="font-bold text-slate-900">
                                {customer.firstName} {customer.lastName}
                            </p>
                            <p className="text-sm text-slate-600">{customer.phone}</p>
                        </div>

                        {/* Selected Seat */}
                        <div className="mb-4 pb-4 border-b border-slate-200">
                            <p className="text-xs text-slate-500 mb-1">Ghế đã chọn</p>
                            {selectedSeat ? (
                                <div className="flex items-center gap-2">
                                    <span className="px-3 py-1 bg-blue-600 text-white rounded-lg font-bold">
                                        {selectedSeat.seatNo}
                                    </span>
                                </div>
                            ) : (
                                <p className="text-sm text-slate-400 italic">Chưa chọn ghế</p>
                            )}
                        </div>

                        {/* Price */}
                        <div className="mb-6">
                            <p className="text-xs text-slate-500 mb-1">Tổng tiền</p>
                            <p className="text-3xl font-black text-blue-600">
                                {ticketService.formatCurrency(scheduling.price || 0)}
                            </p>
                        </div>

                        {/* Continue Button */}
                        <button
                            onClick={() => {
                                if (selectedSeat) {
                                    onContinue(selectedSeat);
                                } else {
                                    alert("Vui lòng chọn ghế");
                                }
                            }}
                            disabled={!selectedSeat}
                            className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Tiếp tục
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function SeatSelectionWithSocket(props: SeatSelectionWithSocketProps) {
    return (
        <SeatWebSocketProvider
            schedulingId={props.scheduling._id}
            enabled={true}
        >
            <SeatSelectionContent {...props} />
        </SeatWebSocketProvider>
    );
}
