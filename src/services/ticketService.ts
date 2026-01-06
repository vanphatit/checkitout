import api from "@/lib/axios";
import { ApiResponse } from "@/types/auth";
import {
  Ticket,
  TicketsPageResponse,
  TicketsAnalyticsResponse,
  GetTicketsParams,
  TicketListItem,
  TicketStatus,
} from "@/types/ticket";

function resolveData<T>(res: ApiResponse<T>): T {
  if (!res.data) {
    throw new Error("API returned no data");
  }
  return res.data;
}

export const ticketService = {
  /**
   * Get all tickets (Admin/Seller only)
   * Uses analytics endpoint for better data structure, or basic endpoint when searching
   */
  async getAllTickets(
    params?: GetTicketsParams
  ): Promise<TicketsAnalyticsResponse> {
    const query = new URLSearchParams();

    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));
    if (params?.status) query.append("status", params.status);
    if (params?.period) query.append("period", params.period);
    if (params?.startDate) query.append("startDate", params.startDate);
    if (params?.endDate) query.append("endDate", params.endDate);
    if (params?.paymentMethod)
      query.append("paymentMethod", params.paymentMethod);
    if (params?.email) query.append("email", params.email);
    if (params?.phone) query.append("phone", params.phone);
    if (params?.schedulingId) query.append("schedulingId", params.schedulingId);

    // Nếu search theo email hoặc phone, dùng endpoint /ticket
    if (params?.email || params?.phone) {
      const res = await api.get<ApiResponse<TicketsPageResponse>>(
        `/ticket?${query}`
      );
      const pageData = resolveData(res.data);

      // Convert TicketsPageResponse to TicketsAnalyticsResponse format
      const tickets = pageData.data.map(
        (ticket): TicketListItem => ({
          _id: ticket._id,
          totalPrice: ticket.totalPrice,
          paymentMethod: ticket.paymentMethod,
          status: ticket.status,
          createdAt: ticket.createdAt,
          updatedAt: ticket.updatedAt,
          paidAt: ticket.paidAt,
          user:
            typeof ticket.userId === "object"
              ? {
                  name: `${ticket.userId.firstName} ${ticket.userId.lastName}`,
                  email: ticket.userId.email || "",
                  phone: ticket.userId.phone || "",
                }
              : null,
          seat: typeof ticket.seatId === "object" ? ticket.seatId.seatNo : "",
          scheduling:
            typeof ticket.schedulingId === "object"
              ? {
                  departureDate: ticket.schedulingId.departureDate,
                  etd: ticket.schedulingId.etd,
                }
              : null,
          promotion:
            ticket.promotionId && typeof ticket.promotionId === "object"
              ? {
                  name: ticket.promotionId.name,
                  value: ticket.promotionId.value,
                }
              : null,
        })
      );

      // Calculate summary from tickets
      const totalRevenue = tickets.reduce(
        (sum, t) =>
          sum + (t.status === TicketStatus.SUCCESS ? t.totalPrice : 0),
        0
      );
      const successTickets = tickets.filter(
        (t) => t.status === TicketStatus.SUCCESS
      );

      return {
        summary: {
          totalRevenue,
          ticketCount: tickets.length,
          averageTicketPrice:
            successTickets.length > 0
              ? totalRevenue / successTickets.length
              : 0,
        },
        byPaymentMethod: tickets.reduce((acc, t) => {
          const method = t.paymentMethod;
          if (!acc[method]) {
            acc[method] = { count: 0, revenue: 0 };
          }
          acc[method].count++;
          if (t.status === TicketStatus.SUCCESS) {
            acc[method].revenue += t.totalPrice;
          }
          return acc;
        }, {} as Record<string, { count: number; revenue: number }>),
        tickets,
        pagination: {
          total: pageData.total,
          page: pageData.page,
          limit: pageData.limit,
          totalPages: pageData.totalPages,
          hasNextPage: pageData.hasNextPage,
          hasPrevPage: pageData.hasPrevPage,
        },
      };
    }

    // Dùng analytics endpoint cho các trường hợp khác
    const res = await api.get<ApiResponse<TicketsAnalyticsResponse>>(
      `/ticket/analytics/tickets-list?${query}`
    );
    return resolveData(res.data);
  },

  /**
   * Get current user's tickets
   */
  async getMyTickets(params?: { status?: string }): Promise<Ticket[]> {
    const query = new URLSearchParams();
    if (params?.status) query.append("status", params.status);

    const res = await api.get<ApiResponse<Ticket[]>>(
      `/ticket/my-tickets?${query}`
    );
    return resolveData(res.data);
  },

  /**
   * Get ticket by ID
   */
  async getTicketById(id: string): Promise<Ticket> {
    const res = await api.get<ApiResponse<Ticket>>(`/ticket/${id}`);
    return resolveData(res.data);
  },

  /**
   * Get tickets by email (Admin/Seller only)
   */
  async getTicketsByEmail(email: string, status?: string): Promise<Ticket[]> {
    const query = new URLSearchParams();
    if (status) query.append("status", status);

    const res = await api.get<ApiResponse<Ticket[]>>(
      `/ticket/by-email/${email}?${query}`
    );
    return resolveData(res.data);
  },

  /**
   * Get tickets by phone (Admin/Seller only)
   */
  async getTicketsByPhone(phone: string, status?: string): Promise<Ticket[]> {
    const query = new URLSearchParams();
    if (status) query.append("status", status);

    const res = await api.get<ApiResponse<Ticket[]>>(
      `/ticket/by-phone/${phone}?${query}`
    );
    return resolveData(res.data);
  },

  /**
   * Get tickets by scheduling (Admin/Seller only)
   */
  async getTicketsByScheduling(
    schedulingId: string,
    status?: string
  ): Promise<Ticket[]> {
    const query = new URLSearchParams();
    if (status) query.append("status", status);

    const res = await api.get<ApiResponse<Ticket[]>>(
      `/ticket/scheduling/${schedulingId}?${query}`
    );
    return resolveData(res.data);
  },

  /**
   * Update ticket status (Admin/Seller only)
   */
  async updateTicketStatus(
    id: string,
    data: {
      status: string;
      paymentMethod?: string;
      fallbackURL?: string;
    }
  ): Promise<Ticket> {
    const res = await api.patch<ApiResponse<Ticket>>(
      `/ticket/${id}/status`,
      data
    );
    return resolveData(res.data);
  },

  /**
   * Transfer ticket (Admin/Seller only)
   */
  async transferTicket(
    id: string,
    data: {
      newSchedulingId: string;
      newSeatId: string;
      reason?: string;
    }
  ): Promise<{
    oldTicket: Ticket;
    newTicket: Ticket;
    message: string;
    transferDescription: string;
  }> {
    const res = await api.post<
      ApiResponse<{
        oldTicket: Ticket;
        newTicket: Ticket;
        message: string;
        transferDescription: string;
      }>
    >(`/ticket/${id}/transfer`, data);
    return resolveData(res.data);
  },

  /**
   * Fail ticket manually (Admin/Seller only)
   */
  async failTicket(
    id: string,
    reason?: string
  ): Promise<{ ticket: Ticket; message: string }> {
    const res = await api.post<
      ApiResponse<{ ticket: Ticket; message: string }>
    >(`/ticket/${id}/fail`, { reason });
    return resolveData(res.data);
  },

  /**
   * Cancel expired tickets (Admin only)
   */
  async cancelExpiredTickets(): Promise<{
    cancelledCount: number;
    message: string;
  }> {
    const res = await api.post<
      ApiResponse<{ cancelledCount: number; message: string }>
    >("/ticket/cancel-expired");
    return resolveData(res.data);
  },

  /**
   * Generate QR code for ticket
   */
  async generateQRCode(id: string): Promise<Blob> {
    const res = await api.get(`/ticket/${id}/qrcode`, {
      responseType: "blob",
    });
    return res.data;
  },

  /**
   * Download ticket as PDF
   */
  async downloadTicketPDF(id: string): Promise<Blob> {
    const res = await api.get(`/ticket/${id}/download-pdf`, {
      responseType: "blob",
    });
    return res.data;
  },

  /**
   * Create ticket (Admin/Seller only)
   * Backend will auto-create user with PRE_REGISTERED status if not exists
   */
  async createTicket(data: {
    seatId: string;
    schedulingId: string;
    phone: string;
    firstName?: string;
    lastName?: string;
    paymentMethod?: "CASH" | "BANKING";
  }): Promise<Ticket> {
    const res = await api.post<ApiResponse<Ticket>>("/ticket", data);
    return resolveData(res.data);
  },

  /**
   * Create ticket and generate payment URL (Customer flow)
   */
  async createAndPay(data: {
    seatId: string;
    schedulingId: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    paymentMethod?: string;
    fallbackURL?: string;
    promotionCode?: string;
  }): Promise<{
    ticket: Ticket;
    payment: {
      success: boolean;
      paymentUrl: string;
      transactionId: string;
      amount: number;
      expiredTime: string;
    };
    message: string;
  }> {
    const res = await api.post<
      ApiResponse<{
        ticket: Ticket;
        payment: {
          success: boolean;
          paymentUrl: string;
          transactionId: string;
          amount: number;
          expiredTime: string;
        };
        message: string;
      }>
    >("/ticket/create-and-pay", data);
    return resolveData(res.data);
  },

  /**
   * Create payment URL for existing PENDING ticket
   */
  async createPaymentUrl(ticketId: string): Promise<{
    success: boolean;
    paymentUrl: string;
    transactionId: string;
    amount: number;
    expiredTime: string;
  }> {
    const res = await api.post<
      ApiResponse<{
        success: boolean;
        paymentUrl: string;
        transactionId: string;
        amount: number;
        expiredTime: string;
      }>
    >(`/payment/create/${ticketId}`);
    return resolveData(res.data);
  },

  /**
   * Get payment status
   */
  async getPaymentStatus(ticketId: string): Promise<{
    ticketId: string;
    status: string;
    paymentStatus: string;
    transactionId?: string;
    vnpayTransactionNo?: string;
    responseCode?: string;
    responseMessage?: string;
    bankCode?: string;
    paidAt?: string;
    amount: number;
  }> {
    const res = await api.get<
      ApiResponse<{
        ticketId: string;
        status: string;
        paymentStatus: string;
        transactionId?: string;
        vnpayTransactionNo?: string;
        responseCode?: string;
        responseMessage?: string;
        bankCode?: string;
        paidAt?: string;
        amount: number;
      }>
    >(`/payment/status/${ticketId}`);
    return resolveData(res.data);
  },

  /**
   * Format currency
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  },

  /**
   * Format date
   */
  formatDate(date: string): string {
    return new Date(date).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  },

  /**
   * Get status color
   */
  getStatusColor(status: string): string {
    switch (status) {
      case "SUCCESS":
        return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "PENDING":
        return "bg-amber-50 text-amber-600 border-amber-100";
      case "FAILED":
        return "bg-rose-50 text-rose-600 border-rose-100";
      case "TRANSFER":
        return "bg-blue-50 text-blue-600 border-blue-100";
      default:
        return "bg-slate-50 text-slate-600 border-slate-100";
    }
  },

  /**
   * Get payment method color
   */
  getPaymentMethodColor(method: string): string {
    switch (method) {
      case "BANKING":
        return "bg-blue-50 text-blue-600 border-blue-100";
      case "CASH":
        return "bg-green-50 text-green-600 border-green-100";
      default:
        return "bg-slate-50 text-slate-600 border-slate-100";
    }
  },
};
