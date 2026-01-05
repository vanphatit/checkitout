import api from "@/lib/axios";
import { ApiResponse } from "@/types/auth";
import { Bus } from "@/types/bus";

type BusPageResponse = {
  data: Bus[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type GetBusesParams = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: string;
  type?: string;
};

export type BusStatistics = {
  total: number;
  active: number;
  inactive: number;
};

function resolveData<T>(res: ApiResponse<T>): T {
  if (!res.data) {
    throw new Error("API returned no data");
  }
  return res.data;
}

export const busService = {
  async getBuses(params?: GetBusesParams): Promise<BusPageResponse> {
    const query = new URLSearchParams();

    if (params?.page) query.append('page', String(params.page));

    const finalLimit = params?.limit || 10;
    query.append('limit', String(finalLimit));

    if (params?.search && params.search.trim() !== "") {
      query.append('search', params.search);
    }

    if (params?.sortBy && params.sortBy !== "") {
      query.append('sortBy', params.sortBy);
    }

    if (params?.sortOrder) {
      query.append('sortOrder', params.sortOrder);
    }

    if (params?.status && params.status !== "ALL" && params.status !== "") {
      query.append('status', params.status);
    }

    if (params?.type) {
      query.append('type', params.type);
    }

    console.log("Request URL:", `/buses?${query.toString()}`);

    const response = await api.get<ApiResponse<BusPageResponse>>(
      `/buses?${query.toString()}`
    );

    return resolveData(response.data);
  },

  async getBusById(busId: string): Promise<Bus> {
    const response = await api.get<ApiResponse<Bus>>(`/buses/${busId}`);
    return resolveData(response.data);
  },

  async getBusStatistics(): Promise<BusStatistics> {
    const response = await api.get<ApiResponse<BusStatistics>>('/buses/statistics');
    return resolveData(response.data);
  },

  async createBus(data: FormData): Promise<Bus> {
    const response = await api.post<ApiResponse<Bus>>(
      "/buses",
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return resolveData(response.data);
  },
  async updateBus(busId: string, data: FormData): Promise<Bus> {
    const response = await api.patch<ApiResponse<Bus>>(`/buses/${busId}`, data, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return resolveData(response.data);
  },

  async deleteBus(busId: string): Promise<void> {
    await api.delete(`/buses/${busId}`);
  },

  async deleteBusImage(busId: string, publicId: string): Promise<void> {
    await api.delete(`/buses/${busId}/images`, {
      params: { publicId }
    });
  }
};