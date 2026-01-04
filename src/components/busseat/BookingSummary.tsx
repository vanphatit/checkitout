import Link from "next/link";
import { BookingSummaryProps } from "@/types/bus";

export default function BookingSummary({
  selectedSeats,
  price,
  data,
  routeData,
}: BookingSummaryProps) {
  const routeName = routeData.name;

  const [from, to] = routeName.split(" - ");

  const total = selectedSeats.reduce((sum, seatId) => {
    const seat = data.find((x) => x.seatNo === seatId);
    return sum + (seat ? price : 0);
  }, 0);

  return (
    <div className="bg-neutral-50 rounded-xl py-4 px-6 border border-neutral-200 shadow-sm">
      <div className="w-full space-y-2">
        {/* Destination */}
        <div className="flex items-center justify-between">
          <h1 className="text-lg text-neutral-600 font-medium">
            Your Destination
          </h1>
          <Link
            href="/bus-tickets"
            className="text-sm text-primary font-medium"
          >
            Change route
          </Link>
        </div>

        <div className="space-y-1">
          <p className="text-sm text-neutral-400">
            From <span>{from}</span>
          </p>
          <p className="text-sm text-neutral-400">
            To <span>{to}</span>
          </p>

          <div className="flex items-center gap-2">
            <h1 className="text-sm text-neutral-600">
              Start{" "}
              <span className="font-medium">
                ({routeData.operatingHours.start})
              </span>
            </h1>
            <div className="flex-1 border-dashed border border-neutral-300" />
            <h1 className="text-sm text-neutral-600">
              End{" "}
              <span className="font-medium">
                ({routeData.operatingHours.end})
              </span>
            </h1>
          </div>
        </div>

        {/* Selected seats */}
        <div className="space-y-3">
          <h1 className="text-lg text-neutral-600 font-medium">
            Selected Seats
          </h1>

          {selectedSeats.length === 0 ? (
            <p className="text-sm text-neutral-500">No seats selected</p>
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
            <h3 className="text-sm text-neutral-500">Basic Fare:</h3>
            <p className="text-sm text-neutral-600">
              {price.toLocaleString()} VND
            </p>
          </div>

          <div className="flex items-center justify-between">
            <h3 className="text-base text-neutral-500">Total Price</h3>
            <span className="text-xs text-neutral-500">(Including taxes)</span>
          </div>

          <p className="text-base text-neutral-700 font-semibold">
            {total.toLocaleString()} VND
          </p>
        </div>

        {/* Checkout */}
        {selectedSeats.length > 0 ? (
          <Link
            href="/bus-tickets/checkout"
            className="block w-full bg-primary hover:bg-primary/90 text-sm text-white py-2.5 rounded-lg text-center uppercase"
          >
            Proceed to Checkout
          </Link>
        ) : (
          <div className="space-y-1">
            <button
              disabled
              className="w-full bg-primary text-white py-2.5 rounded-lg opacity-50 cursor-not-allowed"
            >
              Proceed to Checkout
            </button>
            <small className="text-xs text-neutral-600">
              Select at least 1 seat to proceed
            </small>
          </div>
        )}
      </div>
    </div>
  );
}
