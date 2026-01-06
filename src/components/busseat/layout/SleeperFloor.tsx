import { Seat } from "@/types/seat";
import { buildSleeperGrid } from "@/utils/sleeperLayout";
import { SeatItem } from "@/components/busseat/seat/SeatItem";

export default function SleeperFloor({
  prefix,
  data,
  selectedSeats,
  onSeatClick,
}: {
  prefix: "A" | "B";
  data: Seat[];
  selectedSeats: string[];
  onSeatClick: (id: string) => void;
}) {
  const grid = buildSleeperGrid(data, prefix);

  return (
    <div className="grid grid-cols-3 gap-x-12 gap-y-6">
      {grid.flat().map((seat, idx) => {
        if (!seat) return <div key={`empty-${idx}`} />;

        return (
          <SeatItem
            key={seat.seatNo}
            seat={seat}
            selectedSeats={selectedSeats}
            onSeatClick={onSeatClick}
          />
        );
      })}
    </div>
  );
}
