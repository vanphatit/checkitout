export enum TicketStatus {
  PENDING = "PENDING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
  TRANSFER = "TRANSFER",
}

export enum PaymentMethod {
  CASH = "CASH",
  BANKING = "BANKING",
}

export interface TicketSnapshot {
  seat: {
    seatId: string;
    seatNo: string;
    busId: string;
  };
  scheduling: {
    schedulingId: string;
    departureDate: Date;
    arrivalDate: Date;
    price: number;
    busId: string;
  };
  route: {
    routeId: string;
    name: string;
    from: {
      stationId: string;
      name: string;
    };
    to: {
      stationId: string;
      name: string;
    };
    distance: number;
    etd: string;
  };
  promotion: {
    promotionId: string;
    name: string;
    value: number;
    type: string;
    description?: string;
  };
  pricing: {
    originalPrice: number;
    promotionValue: number;
    discountAmount: number;
    finalPrice: number;
  };
  snapshotCreatedAt: Date;
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface Seat {
  _id: string;
  seatNo: string;
  status: string;
}

export interface Scheduling {
  _id: string;
  departureDate: string;
  arrivalDate?: string;
  etd: string;
  eta?: string;
  price: number;
}

export interface Promotion {
  _id: string;
  name: string;
  value: number;
  type: string;
  description?: string;
}

export interface Ticket {
  _id: string;
  userId: User | string;
  seatId: Seat | string;
  schedulingId: Scheduling | string;
  promotionId: Promotion | string;
  paymentMethod: PaymentMethod;
  fallbackURL?: string;
  transactionId?: string;
  vnpayTransactionNo?: string;
  bankCode?: string;
  responseCode?: string;
  responseMessage?: string;
  paidAt?: string;
  totalPrice: number;
  expiredTime: string;
  status: TicketStatus;
  transferTicketId?: string;
  transferDescription?: string;
  snapshot?: TicketSnapshot;
  createdAt: string;
  updatedAt: string;
}

export type TicketsPageResponse = {
  data: Ticket[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export type TicketsAnalyticsResponse = {
  summary: {
    totalRevenue: number;
    ticketCount: number;
    averageTicketPrice: number;
  };
  byPaymentMethod: Record<string, { count: number; revenue: number }>;
  tickets: TicketListItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
};

export type TicketListItem = {
  _id: string;
  totalPrice: number;
  paymentMethod: PaymentMethod;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  user: {
    name: string;
    email: string;
    phone: string;
  } | null;
  seat: string;
  scheduling: {
    departureDate: string;
    etd: string;
  } | null;
  promotion: {
    name: string;
    value: number;
  } | null;
};

export type GetTicketsParams = {
  page?: number;
  limit?: number;
  status?: TicketStatus;
  period?: "today" | "thisMonth" | "thisYear" | "allTime" | "custom";
  startDate?: string;
  endDate?: string;
  paymentMethod?: PaymentMethod;
  email?: string;
  phone?: string;
  schedulingId?: string;
};

export interface SellerTicketStats {
  totalIncome: number;
  ticketCount: number;
  averagePrice: number;
  ticketsByStatus: {
    pending: number;
    success: number;
    failed: number;
    transfer: number;
  };
}
