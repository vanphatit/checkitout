import api from "@/lib/axios";
import { ApiResponse } from "@/types/auth";
import { Booking } from "@/types/booking";

/**
 * Backend response chuẩn:
 * {
 *   data: T,
 *   message?: string
 * }
 */
function resolveData<T>(res: ApiResponse<T>): T {
  if (!res.data) {
    throw new Error("API returned no data");
  }
  return res.data;
}


export const bookingService = {
  async getSchedulingById(id: string): Promise<Booking> {
    const response = await api.get<ApiResponse<Booking>>(
      `/scheduling/${id}`
    );
    console.log("Scheduling data:", response.data);
    return resolveData<Booking>(response.data);
  },
};
