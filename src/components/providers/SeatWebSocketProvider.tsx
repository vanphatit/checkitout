"use client";

import React, { createContext, useContext, ReactNode, useMemo } from "react";
import { useSeatWebSocket } from "@/hooks/useSeatWebSocket";
import { SeatLock, SeatLockEvent, SeatUnlockEvent } from "@/types/seat";

interface SeatWebSocketContextValue {
    lockedSeats: Record<string, SeatLock>;
    updateTrigger: number;
    lockSeat: (seatId: string, userId?: string) => void;
    unlockSeat: (seatId: string) => void;
    isConnected: boolean;
    isSeatLockedByOthers: (seatId: string) => boolean;
    isSeatLockedByMe: (seatId: string) => boolean;
}

const SeatWebSocketContext = createContext<SeatWebSocketContextValue | undefined>(undefined);

interface SeatWebSocketProviderProps {
    children: ReactNode;
    schedulingId: string;
    enabled?: boolean;
    onSeatLocked?: (event: SeatLockEvent) => void;
    onSeatUnlocked?: (event: SeatUnlockEvent) => void;
    onSeatBooked?: (event: { schedulingId: string; seatId: string }) => void;
}

export const SeatWebSocketProvider: React.FC<SeatWebSocketProviderProps> = ({
    children,
    schedulingId,
    enabled = true,
    onSeatLocked,
    onSeatUnlocked,
    onSeatBooked,
}) => {
    console.log("🏗️ SeatWebSocketProvider mounting with schedulingId:", schedulingId);
    console.log("🏗️ enabled:", enabled);

    const websocket = useSeatWebSocket({
        schedulingId,
        enabled,
        onSeatLocked,
        onSeatUnlocked,
        onSeatBooked,
    });

    console.log("🏭️ Hook returned:", { isConnected: websocket.isConnected, lockedSeatsCount: Object.keys(websocket.lockedSeats).length });

    // Create new context value when lockedSeats changes to trigger re-renders
    const contextValue = useMemo(() => {
        console.log("🔄 Context value recreated, trigger:", websocket.updateTrigger, "locks:", Object.keys(websocket.lockedSeats));
        return {
            lockedSeats: websocket.lockedSeats,
            updateTrigger: websocket.updateTrigger,
            lockSeat: websocket.lockSeat,
            unlockSeat: websocket.unlockSeat,
            isConnected: websocket.isConnected,
            isSeatLockedByOthers: websocket.isSeatLockedByOthers,
            isSeatLockedByMe: websocket.isSeatLockedByMe,
        };
    }, [websocket.updateTrigger, websocket.lockedSeats, websocket.lockSeat, websocket.unlockSeat, websocket.isConnected, websocket.isSeatLockedByOthers, websocket.isSeatLockedByMe]);

    return (
        <SeatWebSocketContext.Provider value={contextValue}>
            {children}
        </SeatWebSocketContext.Provider>
    );
};

export const useSeatWebSocketContext = (): SeatWebSocketContextValue => {
    const context = useContext(SeatWebSocketContext);
    if (!context) {
        throw new Error("useSeatWebSocketContext must be used within SeatWebSocketProvider");
    }
    return context;
};
