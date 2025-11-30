"use client";
import * as React from "react";
import { LuArmchair } from "react-icons/lu";
import busSeatData from "@/data/busSeatData";
import Link from "next/link";
import ErrorMessage from "@/components/alertmessage/error/ErrorMessage";

// Define type for each seat item
interface Seat {
  id: string;
  status: "EMPTY" | "PENDING" | "SOLD";
}

const BusSeat: React.FC = () => {
  // Track selected seats
  const [selectedSeats, setSelectedSeats] = React.useState<string[]>([]);
  const [showError, setShowError] = React.useState(false);

  // Handle seat selection
  const handleSeatClick = (seatId: string) => {
    const seat = busSeatData.find((s) => s.id === seatId);

    // Ignore click if seat is booked
    if (seat?.status === "SOLD") return;

    setSelectedSeats((prev) => {
      if (prev.includes(seatId)) {
        return prev.filter((id) => id !== seatId);
      } else {
        if (prev.length < 3) {
          return [...prev, seatId];
        } else {
          setShowError(true);
          return prev;
        }
      }
    });
  };

  // Auto hide error
  React.useEffect(() => {
    if (showError) {
      const timer = setTimeout(() => setShowError(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showError]);

  // Determine seat color
  const getSeatStyle = (seat: Seat) => {
    if (seat.status === "SOLD") return "text-neutral-500 cursor-not-allowed";
    if (selectedSeats.includes(seat.id)) return "text-red-400 cursor-pointer";
    return "text-primary cursor-pointer";
  };

  return (
    <div className="w-full grid grid-cols-5 gap-10">
      {/* Seat section */}
      <div className="col-span-3 w-full flex flex-col items-stretch shadow-sm rounded-xl p-3 border border-neutral-200 space-y-6">
        {/* Reservation info */}
        <div className="w-full flex items-center justify-center gap-25 border-t border-neutral-200 pt-3">
          <div className="flex flex-col items-center gap-y-1">
            <LuArmchair className="text-md text-primary" />
            <p className="text-sm text-primary font-medium">Empty</p>
          </div>
          <div className="flex flex-col items-center gap-y-1">
            <LuArmchair className="text-md text-neutral-500" />
            <p className="text-sm text-neutral-500 font-medium">Sold</p>
          </div>
          <div className="flex flex-col items-center gap-y-1">
            <LuArmchair className="text-md text-red-400" />
            <p className="text-sm text-red-400 font-medium">Selected</p>
          </div>
        </div>

        {/* Container ghế */}
        <div className="w-full flex items-start justify-between ">
          {[
            busSeatData.slice(0, 6),
            busSeatData.slice(6, 11),
            busSeatData.slice(11, 17),
            busSeatData.slice(17, 23),
            busSeatData.slice(23, 28),
            busSeatData.slice(28, 34),
          ].map((column, idx) => (
            <div
              key={idx}
              className="flex flex-col-reverse justify-end flex-1 items-center"
            >
              {column.map((seat) => (
                <div
                  key={seat.id}
                  className="flex flex-col items-center gap-y-1 cursor-pointer"
                  onClick={() => handleSeatClick(seat.id)}
                >
                  <LuArmchair className={`text-2xl  ${getSeatStyle(seat)}`} />
                  <h6 className="text-sm font-semibold text-neutral-600">
                    {seat.id}
                  </h6>
                </div>
              ))}
            </div>
          ))}
        </div>
        {/* Labels */}
        <div className="w-full flex items-center justify-around">
          <span>Under</span>
          {/* <GiSteeringWheel className="text-3xl text-primary -rotate-180" /> */}
          <span>Above</span>
        </div>
      </div>

      {/* Right section */}
      <div className="col-span-2 bg-neutral-50 rounded-xl py-4 px-6 border border-neutral-200 shadow-sm">
        <div className="w-full space-y-2">
          <div className="w-full flex items-center justify-between">
            <h1 className="text-lg text-neutral-600 font-medium">
              Your Destination
            </h1>
            <Link
              href={"/bus-tickets"}
              className="text-sm text-primary font-medium"
            >
              Change route
            </Link>
          </div>
          <div className="space-y-1 w-full">
            <div className="w-full flex items-center justify-between gap-x-5">
              <p className="text-sm text-neutral-400 font-normal">
                From <span className="text-xs">HCM</span>
              </p>
            </div>

            <div className="w-full flex items-center justify-between gap-x-4">
              <p className="text-sm text-neutral-400 font-normal">
                To <span className="text-xs">Ha Noi</span>
              </p>
            </div>

            <div className="w-full flex items-center justify-between gap-x-4">
              <h1 className="text-sm text-neutral-600 font-normal">
                Start <span className="font-medium">(06:15 pm)</span>
              </h1>
              <div className="flex-1 border-dashed border border-neutral-300" />
              <h1 className="text-sm text-neutral-600 font-normal">
                End <span className="font-medium">(8:15 am)</span>
              </h1>
            </div>
          </div>
          <div className="w-full space-y-3">
            <div className="w-full flex items-center justify-between">
              <h1 className="text-lg text-neutral-600 font-medium">
                Selected Seats
              </h1>
              <div className="bg-red-700/20 rounded-lg py-1 px-1.5 text-xs text-neutral-600 font-normal uppercase">
                Non-refundable
              </div>
            </div>
            {selectedSeats.length === 0 ? (
              <div className="w-full flex items-center gap-x-3">
                <p className="text-sm text-neutral-500 font-normal">
                  No seats selected
                </p>
              </div>
            ) : (
              <div className="w-full flex items-center gap-x-3">
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
          <div className="w-full space-y-4">
            <h1 className="text-lg text-neutral-600 font-medium">
              Fare Details
            </h1>
            <div className="w-full flex items-center justify-between border-dashed border-l-[1.5px] border-neutral-400 pl-2">
              <h3 className="text-sm text-neutral-500 font-medium">
                Basic Fare:
              </h3>
              <p className="text-sm text-neutral-600 font-medium">
                160.000 VND
              </p>
            </div>
            <div className="flex items-center justify-between gap-x-4">
              <h3 className="text-base text-neutral-500 font-medium">
                Total Price
              </h3>
              <span className="span text-xs text-neutral-500 font-normal">
                (Including all taxes)
              </span>
            </div>
            {/* Calculate the total price*/}
            <p className="text-base text-neutral-600 font-semibold">
              {selectedSeats.reduce((total, seatId) => {
                const seat = busSeatData.find(
                  (busSeat) => busSeat.id === seatId
                );
                return total + (seat ? 160000 : 0);
              }, 0)}{" "}
              VND
            </p>
          </div>
          <div className="w-full flex items-center justify-center">
            {selectedSeats.length > 0 ? (
              <Link
                href="/bus-tickets/checkout"
                className="w-full bg-primary hover:bg-primary/90 text-sm text-neutral-50 font-normal py-2.5 flex items-center justify-center uppercase rounded-lg transition"
              >
                Processed to Checkout
              </Link>
            ) : (
              <div className="w-full space-y-0.5">
                <button
                  disabled
                  className="w-full bg-primary hover:bg-primary/90 text-sm text-neutral-50 font-normal py-2.5 flex items-center justify-center uppercase rounded-lg transition cursor-not-allowed"
                >
                  Processed to Checkout
                </button>
                <small className="text-xs text-neutral-600 font-normal px-1">
                  Please select at least one seat to proceed to checkout
                </small>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Show error */}
      {showError && (
        <ErrorMessage message={`You can select up to 3 seats only.`} />
      )}
    </div>
  );
};

export default BusSeat;
