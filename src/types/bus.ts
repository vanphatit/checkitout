import { Route } from "./booking";
import { Seat } from "./seat";

export type BusType = "SLEEPER" | "SEATER" | "SEAT"; // SEAT for backward compatibility with backend

export interface BusTicketCheckInProps {
  busId: string;
  type: BusType;
}

export interface BookingSummaryProps {
  selectedSeats: string[];
  price: number;
  data: Seat[];
  routeData: Route;
  schedulingId: string;
  etd?: string;
  eta?: string;
  distance?: number;
  estimatedDuration?: number;
}

export interface Bus {
  _id: string;
  busNo: string;
  plateNo: string;
  type: "SLEEPER" | "SEAT";
  vacancy: number;
  seats: unknown[];
  driverName?: string; // Optional - not all buses have driver assigned yet
  status: "AVAILABLE" | "UNAVAILABLE";
  images: string[];
  createdAt: string;
  updatedAt: string;
}