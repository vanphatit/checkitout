import { Seat } from "@/types/seat";
import { SeatItem } from "@/components/busseat/seat/SeatItem";

const chunk = (arr: Seat[], size: number) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );

export default function SeaterLayout({
  data,
  selectedSeats,
  onSeatClick,
}: {
  data: Seat[];
  selectedSeats: string[];
  onSeatClick: (id: string) => void;
}) {
  const rows = chunk(data, 4);

  return (
    <div className="flex flex-col gap-4">
      {rows.map((row, i) => (
        <div key={i} className="flex justify-center gap-24">
          {[...row].reverse().map((seat) => (
            <SeatItem
              key={seat.seatNo}
              seat={seat}
              selectedSeats={selectedSeats}
              onSeatClick={onSeatClick}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
