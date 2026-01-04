import api from "@/lib/axios";
import { ApiResponse } from "@/types/auth";
import { Seat } from "@/types/seat";

type SeatPageResponse = {
  data: Seat[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

function resolveData<T>(res: ApiResponse<T>): T {
  if (!res.data) {
    throw new Error("API returned no data");
  }
  return res.data;
}

export const seatService = {
  async getSeatsByBusId(busId: string): Promise<Seat[]> {
    const response = await api.get<ApiResponse<SeatPageResponse>>(
      `/seats/bus/${busId}?page=1&limit=100`
    );

    const page = resolveData(response.data);
    return page.data;
  },
};
