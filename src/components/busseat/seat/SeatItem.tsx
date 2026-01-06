import { LuArmchair } from "react-icons/lu";
import { Seat } from "@/types/seat";

export function SeatItem({
  seat,
  selectedSeats,
  onSeatClick,
}: {
  seat: Seat & { isLockedByOthers?: boolean; isLockedByMe?: boolean };
  selectedSeats: string[];
  onSeatClick: (id: string) => void;
}) {
  const isSelected = selectedSeats.includes(seat.seatNo);
  const isSold = seat.status === "SOLD";
  const isLockedByOthers = seat.isLockedByOthers || false;
  const isLockedByMe = seat.isLockedByMe || false;

  if (seat.seatNo === "A7" || seat.seatNo === "A3") {
    console.log(`🔄 [${seat.seatNo}] Rendering:`, {
      isLockedByOthers,
      isLockedByMe,
      isSelected,
      isSold,
    });
  }

  return (
    <button
      disabled={isSold || isLockedByOthers}
      onClick={() => onSeatClick(seat.seatNo)}
      className="flex flex-col items-center relative"
      title={
        isSold
          ? "Sold"
          : isLockedByOthers
          ? "Locked by another user"
          : isLockedByMe
          ? "Locked by you"
          : "Available"
      }
    >
      <LuArmchair
        className={`text-2xl transition-colors ${
          isSold
            ? "text-neutral-400"
            : isLockedByOthers
            ? "!text-orange-400 !opacity-60"
            : isSelected || isLockedByMe
            ? "text-red-500"
            : "text-primary"
        }`}
      />
      <span className="text-xs">{seat.seatNo}</span>
      {isLockedByOthers && (
        <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full" />
      )}
    </button>
  );
}
