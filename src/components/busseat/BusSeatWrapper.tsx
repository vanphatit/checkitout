"use client";

import dynamic from "next/dynamic";
import { Bus } from "@/types/bus";
import { Route } from "@/types/booking";
import { Seat } from "@/types/seat";

// Force client-side only rendering for WebSocket
const BusSeatClient = dynamic(
  () => import("@/components/busseat/BusSeatClient"),
  { ssr: false }
);

interface BusSeatWrapperProps {
  schedulingId: string;
  busData: Bus;
  routeData: Route;
  seatData: Seat[];
  price: number;
  etd?: string;
  eta?: string;
  distance?: number;
  estimatedDuration?: number;
  arrivalDate: string;
  departureDate: string;
}

export default function BusSeatWrapper(props: BusSeatWrapperProps) {
  return <BusSeatClient {...props} />;
}
