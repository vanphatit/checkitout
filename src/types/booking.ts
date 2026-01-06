import { Bus, BusType } from "./bus";
import { Station } from "./station";

export interface Route {
  _id: string;
  name: string;
  stationIds: Station[];
  distance: number;
  etd?: string; // "08:00"
  estimatedDuration?: number; // minutes
  description: string;
  isActive: boolean;
  basePrice: number;
  pricePerKm: number;
  operatingHours: {
    start: string; // "05:00"
    end: string;   // "22:00"
  };
  operatingDays: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Driver {
  _id: string;
  name: string;
  phone: string;
  licenseNumber: string;
}

export interface Booking {
  _id: string;

  routeId: Route;

  busIds: Bus[];

  etd: string; // "07:00"
  eta: string; // "09:00"

  departureDate: string; // ISO
  arrivalDate: string;   // ISO

  status: "pending" | "in-progress" | "completed" | "cancelled";
  isActive: boolean;

  availableSeats: number;
  bookedSeats: number;
  price: number;

  driver: Driver;

  recurringDays: string[];
  isRecurring: boolean;
}
