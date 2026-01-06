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

interface BusConflict {
    busId: string;
    plateNo: string;
    message: string;
}

interface CreateSchedulingResponse {
    scheduling: Scheduling;
    conflicts?: BusConflict[];
    message?: string;
}

interface BulkSchedulingResponse {
    schedules: Scheduling[];
    totalConflicts: number;
    conflictDetails: Array<{
        date: string;
        conflicts: BusConflict[];
    }>;
}

export const schedulingService = {
    async getSchedulings(filters?: SchedulingFilters & { page?: number; limit?: number; includeDeleted?: boolean; sortBy?: string; sortOrder?: 'asc' | 'desc' }): Promise<PaginatedResponse<Scheduling>> {
        const params = new URLSearchParams();
        if (filters?.date) params.append("date", filters.date);
        if (filters?.routeId) params.append("routeId", filters.routeId);
        if (filters?.status) params.append("status", filters.status);
        if (filters?.query) params.append("query", filters.query);
        if (filters?.page) params.append("page", filters.page.toString());
        if (filters?.limit) params.append("limit", filters.limit.toString());
        if (filters?.includeDeleted) params.append("includeDeleted", "true");
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

    async createScheduling(data: CreateSchedulingDto): Promise<CreateSchedulingResponse> {
        const response = await api.post<ApiResponse<CreateSchedulingResponse>>("/scheduling", data);
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

    async getSchedulingsByRoute(routeId: string, date?: string): Promise<Scheduling[]> {
        const params = new URLSearchParams();
        if (date) params.append("date", date);
        const queryString = params.toString();
        const url = queryString
            ? `/scheduling/by-route/${routeId}?${queryString}`
            : `/scheduling/by-route/${routeId}`;

        const response = await api.get<ApiResponse<Scheduling[]>>(url);
        return resolveData(response.data);
    },

    async createBulk(data: {
        routeId: string;
        busIds: string[];
        etd: string;
        startDate: string;
        endDate: string;
        recurringDays: string[];
        price?: number;
        note?: string;
    }): Promise<BulkSchedulingResponse> {
        const response = await api.post<ApiResponse<BulkSchedulingResponse>>("/scheduling/bulk", data);
        return resolveData(response.data);
    },

    async importExcel(file: File): Promise<{
        totalRows: number;
        successCount: number;
        errorCount: number;
        createdSchedules: any[];
        errors: any[];
        warnings: any[]
    }> {
        const formData = new FormData();
        formData.append("file", file);

        console.log('📤 Sending import request...');
        const response = await api.post<ApiResponse<{
            totalRows: number;
            successCount: number;
            errorCount: number;
            createdSchedules: any[];
            errors: any[];
            warnings: any[]
        }>>("/scheduling/import/excel", formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });

        console.log('📦 Raw API response:', response);
        console.log('📦 Response data:', response.data);

        return resolveData(response.data);
    },

    async validateImport(file: File): Promise<{ valid: number; invalid: number; errors: any[] }> {
        const formData = new FormData();
        formData.append("file", file);
        const response = await api.post<ApiResponse<{ valid: number; invalid: number; errors: any[] }>>("/scheduling/import/validate", formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        return resolveData(response.data);
    },

    async downloadTemplate(): Promise<Blob> {
        const response = await api.get("/scheduling/export/template", {
            responseType: "blob"
        });
        return response.data;
    },
};
