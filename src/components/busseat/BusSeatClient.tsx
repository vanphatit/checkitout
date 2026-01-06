"use client";

import React from "react";
import { SeatWebSocketProvider } from "@/components/providers/SeatWebSocketProvider";
import BusSeat from "@/components/busseat/BusSeat";
import { Bus } from "@/types/bus";
import { Route } from "@/types/booking";
import { Seat } from "@/types/seat";

interface BusSeatClientProps {
  schedulingId: string;
  busData: Bus;
  routeData: Route;
  seatData: Seat[];
  price: number;
  etd?: string;
  eta?: string;
  distance?: number;
  estimatedDuration?: number;
}

export default function BusSeatClient({
  schedulingId,
  busData,
  routeData,
  seatData,
  price,
  etd,
  eta,
  distance,
  estimatedDuration,
}: BusSeatClientProps) {
  return (
    <SeatWebSocketProvider schedulingId={schedulingId}>
      <BusSeat
        busData={busData}
        routeData={routeData}
        seatData={seatData}
        price={price}
        schedulingId={schedulingId}
        etd={etd}
        eta={eta}
        distance={distance}
        estimatedDuration={estimatedDuration}
      />
    </SeatWebSocketProvider>
  );
}
