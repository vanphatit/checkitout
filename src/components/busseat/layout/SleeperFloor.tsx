import { LuArmchair } from "react-icons/lu";
import { Seat } from "@/types/seat";
import { buildSleeperGrid } from "@/utils/sleeperLayout";

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

        const seatNo = seat.seatNo;
        const isSold = seat.status === "SOLD";
        const isSelected = selectedSeats.includes(seatNo);

        return (
          <button
            key={seatNo}
            disabled={isSold}
            onClick={() => onSeatClick(seatNo)}
            className="flex flex-col items-center"
          >
            <LuArmchair
              className={`text-2xl ${
                isSold
                  ? "text-neutral-400"
                  : isSelected
                  ? "text-red-400"
                  : "text-primary"
              }`}
            />
            <span className="text-sm">{seatNo}</span>
          </button>
        );
      })}
    </div>
  );
}
