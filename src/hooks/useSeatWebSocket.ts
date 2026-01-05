"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { SeatLock, SeatLockEvent, SeatUnlockEvent, LockedSeatsResponse } from "@/types/seat";

interface UseSeatWebSocketOptions {
    schedulingId: string;
    enabled?: boolean;
    onSeatLocked?: (event: SeatLockEvent) => void;
    onSeatUnlocked?: (event: SeatUnlockEvent) => void;
    onSeatBooked?: (event: { schedulingId: string; seatId: string }) => void;
}

interface UseSeatWebSocketReturn {
    lockedSeats: Record<string, SeatLock>;
    updateTrigger: number;
    lockSeat: (seatId: string, userId?: string) => void;
    unlockSeat: (seatId: string) => void;
    isConnected: boolean;
    isSeatLockedByOthers: (seatId: string) => boolean;
    isSeatLockedByMe: (seatId: string) => boolean;
}

export const useSeatWebSocket = ({
    schedulingId,
    enabled = true,
    onSeatLocked,
    onSeatUnlocked,
    onSeatBooked,
}: UseSeatWebSocketOptions): UseSeatWebSocketReturn => {
    const socketRef = useRef<Socket | null>(null);
    const [lockedSeats, setLockedSeats] = useState<Record<string, SeatLock>>({});
    const [updateTrigger, setUpdateTrigger] = useState(0); // Force re-render
    const [isConnected, setIsConnected] = useState(false);
    const clientIdRef = useRef<string>("");

    // Initialize WebSocket connection
    useEffect(() => {
        console.log("🔥 useEffect triggered!", { enabled, schedulingId, isClient: typeof window !== 'undefined' });

        if (!enabled || !schedulingId) {
            console.warn("⚠️ WebSocket hook disabled:", { enabled, schedulingId });
            return;
        }

        const SOCKET_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:9091";
        console.log("🚀 Initializing WebSocket connection to:", `${SOCKET_URL}/seats`);

        // Create socket connection
        const socket = io(`${SOCKET_URL}/seats`, {
            transports: ["websocket", "polling"],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
        });

        console.log("✅ Socket.IO client created");

        socketRef.current = socket;

        // Connection events
        socket.on("connect", () => {
            console.log("✅ WebSocket connected:", socket.id);
            setIsConnected(true);
            clientIdRef.current = socket.id || "";

            // Join scheduling room
            socket.emit("join:scheduling", { schedulingId });
        });

        socket.on("disconnect", () => {
            console.log("❌ WebSocket disconnected");
            setIsConnected(false);
        });

        socket.on("connect_error", (error) => {
            console.error("❌ WebSocket connection error:", error);
            setIsConnected(false);
        });

        // Receive current locked seats when joining
        socket.on("seats:locked", (data: LockedSeatsResponse) => {
            console.log("🔒 Received locked seats:", data);
            const locksObj: Record<string, SeatLock> = {};
            if (data && data.locks && Array.isArray(data.locks)) {
                data.locks.forEach((lock) => {
                    locksObj[lock.seatId] = lock;
                });
            }
            console.log("🗺️ Total locked seats:", Object.keys(locksObj).length);
            console.log("🗺️ Locked seats list:", Object.keys(locksObj));
            setLockedSeats(locksObj);
            setUpdateTrigger(prev => prev + 1);
        });

        // Seat locked by someone
        socket.on("seat:locked", (event: SeatLockEvent) => {
            console.log("🔒 Seat locked:", event);
            console.log("🔑 Current clientId:", clientIdRef.current);
            console.log("🔑 Event clientId:", event.clientId);
            console.log("🔑 Is locked by me?", event.clientId === clientIdRef.current);
            setLockedSeats((prev) => ({
                ...prev,
                [event.seatId]: {
                    schedulingId: event.schedulingId,
                    seatId: event.seatId,
                    clientId: event.clientId,
                    userId: event.userId,
                    lockedAt: new Date(),
                    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
                },
            }));
            console.log("🗺️ Seat added to locked list:", event.seatId);
            setUpdateTrigger(prev => prev + 1);
            onSeatLocked?.(event);
        });

        // Seat unlocked by someone
        socket.on("seat:unlocked", (event: SeatUnlockEvent) => {
            console.log("🔓 Seat unlocked:", event);
            setLockedSeats((prev) => {
                const { [event.seatId]: removed, ...rest } = prev;
                console.log("🗺️ Seat removed from locked list:", event.seatId);
                return rest;
            });
            setUpdateTrigger(prev => prev + 1);
            onSeatUnlocked?.(event);
        });

        // Seat booked (sold)
        socket.on("seat:booked", (event: { schedulingId: string; seatId: string }) => {
            console.log("✅ Seat booked:", event);
            setLockedSeats((prev) => {
                const { [event.seatId]: removed, ...rest } = prev;
                return rest;
            });
            onSeatBooked?.(event);
        });

        // Cleanup on unmount
        return () => {
            console.log("🧹 Cleaning up WebSocket connection");
            socket.emit("leave:scheduling", { schedulingId });
            socket.disconnect();
            socketRef.current = null;
        };
    }, [enabled, schedulingId, onSeatLocked, onSeatUnlocked, onSeatBooked]);

    // Lock a seat
    const lockSeat = useCallback(
        (seatId: string, userId?: string) => {
            console.log("🔐 [lockSeat] Called with:", { seatId, userId, isConnected });

            if (!socketRef.current || !isConnected) {
                console.warn("⚠️ Cannot lock seat: WebSocket not connected");
                return;
            }

            const payload = {
                schedulingId,
                seatId,
                userId,
            };
            console.log("📤 [lockSeat] Emitting seat:lock", payload);
            socketRef.current.emit("seat:lock", payload);
        },
        [schedulingId, isConnected]
    );

    // Unlock a seat
    const unlockSeat = useCallback(
        (seatId: string) => {
            if (!socketRef.current || !isConnected) {
                console.warn("⚠️ Cannot unlock seat: WebSocket not connected");
                return;
            }

            socketRef.current.emit("seat:unlock", {
                schedulingId,
                seatId,
            });
            console.log("📤 Emitting seat:unlock", { schedulingId, seatId });
        },
        [schedulingId, isConnected]
    );

    // Check if seat is locked by others
    const isSeatLockedByOthers = useCallback(
        (seatId: string): boolean => {
            const lock = lockedSeats[seatId];
            if (!lock) return false;
            const isLockedByOthers = lock.clientId !== clientIdRef.current;
            // Debug specific seats
            if (seatId === "A3" || seatId === "A7") {
                console.log(`🔍 [${seatId}] Check lock:`, { lock, clientIdRef: clientIdRef.current, isLockedByOthers });
            }
            return isLockedByOthers;
        },
        [lockedSeats, updateTrigger]
    );

    // Check if seat is locked by current user
    const isSeatLockedByMe = useCallback(
        (seatId: string): boolean => {
            const lock = lockedSeats[seatId];
            if (!lock) return false;
            return lock.clientId === clientIdRef.current;
        },
        [lockedSeats, updateTrigger]
    );

    return {
        lockedSeats,
        updateTrigger,
        lockSeat,
        unlockSeat,
        isConnected,
        isSeatLockedByOthers,
        isSeatLockedByMe,
    };
};
