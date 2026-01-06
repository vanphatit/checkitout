import { Seat } from "@/types/seat";
import { SeatItem } from "./SeatItem";

export function SeatColumn({
  seats,
  selectedSeats,
  onSeatClick,
}: {
  seats: Seat[];
  selectedSeats: string[];
  onSeatClick: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      {seats.map((seat) => (
        <SeatItem
          key={seat.seatNo}
          seat={seat}
          selectedSeats={selectedSeats}
          onSeatClick={onSeatClick}
        />
      ))}
    </div>
  );
}
