export interface Seat {
  _id: string;
  seatNo: string;
  status: "EMPTY" | "SOLD" | "LOCKED";
}

export interface SeatLock {
  schedulingId: string;
  seatId: string;
  clientId: string;
  userId?: string;
  lockedAt: Date;
  expiresAt: Date;
}

export interface SeatLockEvent {
  schedulingId: string;
  seatId: string;
  clientId: string;
  userId?: string;
}

export interface SeatUnlockEvent {
  schedulingId: string;
  seatId: string;
  clientId: string;
}

export interface LockedSeatsResponse {
  schedulingId: string;
  locks: SeatLock[];
}

