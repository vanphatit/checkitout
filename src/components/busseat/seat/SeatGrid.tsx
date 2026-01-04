import SleeperLayout from "@/components/busseat/layout/SleeperLayout";
import SeaterLayout from "@/components/busseat/layout/SeaterLayout";
import { BusType } from "@/types/bus";
import { Seat } from "@/types/seat";

interface SeatGridProps {
  type: BusType;
  data: Seat[];
  selectedSeats: string[];
  onSeatClick: (seatNo: string) => void;
}

export default function SeatGrid(props: SeatGridProps) {
  if (props.type === "SLEEPER") {
    return <SleeperLayout {...props} />;
  }

  return <SeaterLayout {...props} />;
}
