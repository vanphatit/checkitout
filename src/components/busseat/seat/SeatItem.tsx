import { LuArmchair } from "react-icons/lu";
import { Seat } from "@/types/seat";

export function SeatItem({
  seat,
  selectedSeats,
  onSeatClick,
}: {
  seat: Seat;
  selectedSeats: string[];
  onSeatClick: (id: string) => void;
}) {
  const isSelected = selectedSeats.includes(seat.seatNo);
  const isSold = seat.status === "SOLD";

  return (
    <button
      disabled={isSold}
      onClick={() => onSeatClick(seat.seatNo)}
      className="flex flex-col items-center"
    >
      <LuArmchair
        className={`text-2xl ${
          isSold
            ? "text-neutral-400"
            : isSelected
            ? "text-red-500"
            : "text-primary"
        }`}
      />
      <span className="text-xs">{seat.seatNo}</span>
    </button>
  );
}
