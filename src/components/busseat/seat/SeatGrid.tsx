// import { LuArmchair } from "react-icons/lu";

// interface Seat {
//   seatNo: string;
//   status: "EMPTY" | "SOLD";
// }

// interface SeatGridProps {
//   type: "SLEEPER" | "SEATER";
//   data: Seat[];
//   selectedSeats: string[];
//   onSeatClick: (id: string) => void;
// }

// const SeatGrid: React.FC<SeatGridProps> = ({
//   type,
//   data,
//   selectedSeats,
//   onSeatClick,
// }) => {
//   const seatLayout =
//     type === "SLEEPER"
//       ? [
//           data.slice(0, 6),
//           data.slice(6, 11),
//           data.slice(11, 17),
//           data.slice(17, 23),
//           data.slice(23, 28),
//           data.slice(28, 34),
//         ]
//       : [
//           data.slice(0, 7),
//           data.slice(7, 14),
//           data.slice(14, 21),
//           data.slice(21, 28),
//         ];

//   const getSeatStyle = (seat: Seat) => {
//     if (seat.status === "SOLD") return "text-neutral-500 cursor-not-allowed";
//     if (selectedSeats.includes(seat.seatNo))
//       return "text-red-400 cursor-pointer";
//     return "text-primary cursor-pointer";
//   };

//   return (
//     <div className="w-full flex items-start justify-between">
//       {seatLayout.map((column, idx) => (
//         <div
//           key={idx}
//           className="flex flex-col-reverse justify-end flex-1 items-center"
//         >
//           {column.map((seat) => (
//             <div
//               key={seat.seatNo}
//               className="flex flex-col items-center gap-y-1 cursor-pointer"
//               onClick={() => onSeatClick(seat.seatNo)}
//             >
//               <LuArmchair className={`text-2xl ${getSeatStyle(seat)}`} />
//               <h6 className="text-sm font-semibold text-neutral-600">
//                 {seat.seatNo}
//               </h6>
//             </div>
//           ))}
//         </div>
//       ))}
//     </div>
//   );
// };

// export default SeatGrid;

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
