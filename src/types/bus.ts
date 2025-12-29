export type BusType = "SLEEPER" | "SEATER";

export interface BusTicketCheckInProps {
  busId: string;
  type: BusType;
}

export interface BookingSummaryProps {
  selectedSeats: string[];
  busId: string;
  type: BusType;
  price: string
}