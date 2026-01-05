import api from "@/lib/axios";
import { ApiResponse } from "@/types/auth";
import { Scheduling, SchedulingFilters, CreateSchedulingDto, UpdateSchedulingDto, SchedulingStats } from "@/types/scheduling";

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
    async getSchedulings(filters?: SchedulingFilters & { page?: number; limit?: number; includeDeleted?: boolean; sortBy?: string; sortOrder?: 'asc' | 'desc' }): Promise<PaginatedResponse<Scheduling>> {
        const params = new URLSearchParams();
        if (filters?.date) params.append("date", filters.date);
        if (filters?.routeId) params.append("routeId", filters.routeId);
        if (filters?.status) params.append("status", filters.status);
        if (filters?.query) params.append("query", filters.query);
        if (filters?.query) params.append("query", filters.query);
        if (filters?.page) params.append("page", filters.page.toString());
        if (filters?.limit) params.append("limit", filters.limit.toString());
        if (filters?.includeDeleted) params.append("includeDeleted", "true");
        if (filters?.sortBy) params.append("sortBy", filters.sortBy);
        if (filters?.sortOrder) params.append("sortOrder", filters.sortOrder);
        if (filters?.sortBy) params.append("sortBy", filters.sortBy);
        if (filters?.sortOrder) params.append("sortOrder", filters.sortOrder);

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

    async createScheduling(data: CreateSchedulingDto): Promise<Scheduling> {
        const response = await api.post<ApiResponse<Scheduling>>("/scheduling", data);
        return resolveData(response.data);
    },

    async updateScheduling(id: string, data: UpdateSchedulingDto): Promise<Scheduling> {
        const response = await api.patch<ApiResponse<Scheduling>>(`/scheduling/${id}`, data);
        return resolveData(response.data);
    },

    async deleteScheduling(id: string): Promise<void> {
        await api.delete(`/scheduling/${id}`);
    },

    async restoreScheduling(id: string): Promise<Scheduling> {
        const response = await api.post<ApiResponse<Scheduling>>(`/scheduling/${id}/restore`);
        return resolveData(response.data);
    },

    async getStats(): Promise<SchedulingStats> {
        const response = await api.get<ApiResponse<SchedulingStats>>("/scheduling/stats");
        return resolveData(response.data);
    },
};
