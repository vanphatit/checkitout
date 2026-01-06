"use client";
import React, { useState, useEffect } from "react";

import SeatLegend from "@/components/busseat/seat/SeatLegend";
import SeatGrid from "@/components/busseat/seat/SeatGrid";
import BookingSummary from "@/components/busseat/BookingSummary";
import ErrorMessage from "@/components/alertmessage/error/ErrorMessage";
import { useSeatWebSocketContext } from "@/components/providers/SeatWebSocketProvider";
import { Bus, BusType } from "@/types/bus";
import { Route } from "@/types/booking";
import { Seat } from "@/types/seat";
import { Camera, ChevronLeft, ChevronRight, X } from "lucide-react";

interface BusSeatProps {
  busData: Bus;
  routeData: Route;
  seatData: Seat[];
  price: number;
  schedulingId: string;
  etd?: string;
  eta?: string;
  distance?: number;
  estimatedDuration?: number;
}

const BusSeat: React.FC<BusSeatProps> = ({
  busData,
  routeData,
  seatData,
  price,
  schedulingId,
  etd,
  eta,
  distance,
  estimatedDuration,
}) => {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [showError, setShowError] = useState(false);
  const [zoomStyle, setZoomStyle] = useState({ transformOrigin: "center" });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } =
      e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - top) / height) * 100;
    setZoomStyle({ transformOrigin: `${x}% ${y}%` });
  };

  const {
    lockSeat,
    unlockSeat,
    isSeatLockedByOthers,
    isSeatLockedByMe,
    isConnected,
    lockedSeats,
    updateTrigger,
  } = useSeatWebSocketContext();

  // Pre-compute lock status for all seats to trigger re-render
  const data = seatData.map((seat) => ({
    ...seat,
    isLockedByOthers: isSeatLockedByOthers(seat.seatNo),
    isLockedByMe: isSeatLockedByMe(seat.seatNo),
  }));

  const handleSeatClick = (seatId: string) => {
    const seat = data.find((s) => s.seatNo === seatId);

    // Can't select sold seats or seats locked by others
    if (seat?.status === "SOLD" || isSeatLockedByOthers(seatId)) return;

    setSelectedSeats((prev) => {
      if (prev.includes(seatId)) {
        // Unlock seat when deselecting
        unlockSeat(seatId);
        return prev.filter((id) => id !== seatId);
      } else {
        // Check max seats limit
        if (prev.length >= 3) {
          setShowError(true);
          return prev;
        }
        // Lock seat when selecting
        lockSeat(seatId);
        return [...prev, seatId];
      }
    });
  };

  useEffect(() => {
    if (showError) {
      const timer = setTimeout(() => setShowError(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [showError]);

  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  const nextImage = () => {
    setCurrentImgIndex((prev) => (prev + 1) % busData.images.length);
  };

  const prevImage = () => {
    setCurrentImgIndex(
      (prev) => (prev - 1 + busData.images.length) % busData.images.length
    );
  };

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-10">
      {/* LEFT – SEAT AREA */}
      <div className="col-span-1 md:col-span-3 w-full flex flex-col items-stretch shadow-sm rounded-xl p-3 border border-neutral-200 space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <SeatLegend />
          {busData.images && busData.images.length > 0 && (
            <button
              onClick={() => setIsGalleryOpen(true)}
              className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Camera size={15} />
            </button>
          )}
        </div>

        <SeatGrid
          type={busData.type as BusType}
          data={data}
          selectedSeats={selectedSeats}
          onSeatClick={handleSeatClick}
        />
      </div>

      {/* RIGHT – SUMMARY */}
      <div className="col-span-1 md:col-span-2 w-full mt-4 md:mt-0">
        <BookingSummary
          selectedSeats={selectedSeats}
          data={data}
          price={price}
          routeData={routeData}
          schedulingId={schedulingId}
          etd={etd}
          eta={eta}
          distance={distance}
          estimatedDuration={estimatedDuration}
        />
      </div>

      {isGalleryOpen && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4">
          {/* Nút đóng */}
          <button
            onClick={() => setIsGalleryOpen(false)}
            className="absolute top-5 right-5 text-white hover:text-gray-300"
          >
            <X size={32} />
          </button>

          {/* Nút Trái */}
          <button
            onClick={prevImage}
            className="absolute left-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"
          >
            <ChevronLeft size={40} />
          </button>

          {/* Ảnh hiện tại */}
          <div className="max-w-auto max-h-auto flex flex-col items-center">
            <div
              className="relative overflow-hidden rounded-lg cursor-zoom-in border border-white/10"
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setZoomStyle({ transformOrigin: "center" })}
            >
              <img
                src={busData.images[currentImgIndex].url}
                style={{
                  ...zoomStyle,
                  transition: "transform 0.1s ease-out",
                }}
                className="max-w-full max-h-[75vh] object-contain hover:scale-[2.5]"
                alt="Bus interior"
              />
            </div>

            <div className="flex flex-col items-center mt-4">
              <p className="text-gray-400 text-sm mb-1">
                Rê chuột vào ảnh để phóng to chi tiết
              </p>
              <p className="text-white font-medium">
                {currentImgIndex + 1} / {busData.images.length}
              </p>
            </div>
          </div>

          {/* Nút Phải */}
          <button
            onClick={nextImage}
            className="absolute right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"
          >
            <ChevronRight size={40} />
          </button>
        </div>
      )}

      {/* ERROR MESSAGE */}
      {showError && (
        <ErrorMessage message="You can only book up to 3 seats at a time." />
      )}
    </div>
  );
};

export default BusSeat;
