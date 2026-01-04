import { Route } from "./booking";
import { Seat } from "./seat";

export type BusType = "SLEEPER" | "SEATER";

export interface BusTicketCheckInProps {
  busId: string;
  type: BusType;
}

export interface BookingSummaryProps {
  selectedSeats: string[];
  price: number;
  data: Seat[];
  routeData: Route;
}

export interface Bus {
  _id: string;
  busNo: string;
  plateNo: string;
  type: "SLEEPER" | "SEAT";
  vacancy: number;
  seats: unknown[];
  driverName: string;
  status: "AVAILABLE" | "IN_SERVICE" | "MAINTENANCE";
  images: string[];
  createdAt: string;
  updatedAt: string;
}