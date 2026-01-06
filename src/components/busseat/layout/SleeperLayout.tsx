import { Seat } from "@/types/seat";
import SleeperFloor from "./SleeperFloor";

export default function SleeperLayout({
  data,
  selectedSeats,
  onSeatClick,
}: {
  data: Seat[];
  selectedSeats: string[];
  onSeatClick: (id: string) => void;
}) {
  const floorA = data.filter((s) => s.seatNo.startsWith("A"));
  const floorB = data.filter((s) => s.seatNo.startsWith("B"));

  return (
    <div className="flex justify-around gap-12">
      {/* TẦNG DƯỚI */}
      <div>
        <p className="font-semibold mb-4">Tầng dưới</p>
        <SleeperFloor
          prefix="A"
          data={floorA}
          selectedSeats={selectedSeats}
          onSeatClick={onSeatClick}
        />
      </div>

      {/* TẦNG TRÊN */}
      <div>
        <p className="font-semibold mb-4">Tầng trên</p>
        <SleeperFloor
          prefix="B"
          data={floorB}
          selectedSeats={selectedSeats}
          onSeatClick={onSeatClick}
        />
      </div>
    </div>
  );
}
