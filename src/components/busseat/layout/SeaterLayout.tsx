import { LuArmchair } from "react-icons/lu";
import { Seat } from "@/types/seat";

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
          {[...row].reverse().map((seat) => {
            const isSold = seat.status === "SOLD";
            const isSelected = selectedSeats.includes(seat.seatNo);

            return (
              <button
                key={seat.seatNo}
                disabled={isSold}
                onClick={() => onSeatClick(seat.seatNo)}
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
                <span className="text-sm">{seat.seatNo}</span>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
