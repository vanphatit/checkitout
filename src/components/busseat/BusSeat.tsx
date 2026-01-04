"use client";
import React, { useState, useEffect } from "react";

import SeatLegend from "@/components/busseat/seat/SeatLegend";
import SeatGrid from "@/components/busseat/seat/SeatGrid";
import BookingSummary from "@/components/busseat/BookingSummary";
import ErrorMessage from "@/components/alertmessage/error/ErrorMessage";
import { Bus, BusType } from "@/types/bus";
import { Route } from "@/types/booking";
import { Seat } from "@/types/seat";

interface BusSeatProps {
  busData: Bus;
  routeData: Route;
  seatData: Seat[];
  price: number;
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
  etd,
  eta,
  distance,
  estimatedDuration,
}) => {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [showError, setShowError] = useState(false);

  const data = seatData;

  const handleSeatClick = (seatId: string) => {
    const seat = data.find((s) => s.seatNo === seatId);

    if (seat?.status === "SOLD") return;

    setSelectedSeats((prev) => {
      if (prev.includes(seatId)) {
        return prev.filter((id) => id !== seatId);
      } else {
        if (prev.length < 3) return [...prev, seatId];
        setShowError(true);
        return prev;
      }
    });
  };

  useEffect(() => {
    if (showError) {
      const timer = setTimeout(() => setShowError(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [showError]);

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-10">
      {/* LEFT – SEAT AREA */}
      <div className="col-span-1 md:col-span-3 w-full flex flex-col items-stretch shadow-sm rounded-xl p-3 border border-neutral-200 space-y-6">
        <SeatLegend />

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
          etd={etd}
          eta={eta}
          distance={distance}
          estimatedDuration={estimatedDuration}
        />
      </div>

      {/* ERROR MESSAGE */}
      {showError && (
        <ErrorMessage message="You can only book up to 3 seats at a time." />
      )}
    </div>
  );
};

export default BusSeat;
