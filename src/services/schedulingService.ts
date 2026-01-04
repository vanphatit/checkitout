import api from "@/lib/axios";
import { ApiResponse } from "@/types/auth";
import { Scheduling, SchedulingFilters } from "@/types/scheduling";

function resolveData<T>(res: ApiResponse<T>): T {
    if (!res.data) {
        throw new Error("API returned no data");
    }
    return res.data;
}

interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export const schedulingService = {
    async getSchedulings(filters?: SchedulingFilters & { page?: number; limit?: number }): Promise<PaginatedResponse<Scheduling>> {
        const params = new URLSearchParams();
        if (filters?.date) params.append("date", filters.date);
        if (filters?.routeId) params.append("routeId", filters.routeId);
        if (filters?.status) params.append("status", filters.status);
        if (filters?.page) params.append("page", filters.page.toString());
        if (filters?.limit) params.append("limit", filters.limit.toString());

        const queryString = params.toString();
        const url = queryString ? `/scheduling?${queryString}` : "/scheduling";

        const response = await api.get<ApiResponse<PaginatedResponse<Scheduling>>>(url);
        return resolveData(response.data);
    },

    async getSchedulingById(id: string): Promise<Scheduling> {
        const response = await api.get<ApiResponse<Scheduling>>(
            `/scheduling/${id}`
        );
        return resolveData(response.data);
    },
};
