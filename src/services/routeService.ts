import api from '@/lib/axios';
import { RouteData, CreateRouteDto, UpdateRouteDto, SuggestStationsResponse } from '@/types/route';

export type { RouteData, CreateRouteDto, UpdateRouteDto, SuggestStationsResponse };

interface ApiResponse<T> {
    statusCode: number;
    success: boolean;
    timestamp: string;
    path: string;
    method: string;
    data: T;
}

export const routeService = {
    /**
     * Get all routes
     */
    async getAllRoutes(includeDeleted: boolean = false): Promise<RouteData[]> {
        const response = await api.get<ApiResponse<RouteData[]>>('/routes', {
            params: { includeDeleted: includeDeleted ? 'true' : 'false' }
        });
        return response.data.data;
    },

    /**
     * Get route by ID
     */
    async getRouteById(id: string): Promise<RouteData> {
        const response = await api.get<ApiResponse<RouteData>>(`/routes/${id}`);
        return response.data.data;
    },

    /**
     * Create new route
     */
    async createRoute(data: CreateRouteDto): Promise<RouteData> {
        const response = await api.post<ApiResponse<RouteData>>('/routes', data);
        return response.data.data;
    },

    /**
     * Update existing route
     */
    async updateRoute(id: string, data: UpdateRouteDto): Promise<RouteData> {
        const response = await api.patch<ApiResponse<RouteData>>(`/routes/${id}`, data);
        return response.data.data;
    },

    /**
     * Delete route (soft delete)
     */
    async deleteRoute(id: string): Promise<void> {
        await api.delete(`/routes/${id}`);
    },

    /**
     * Suggest intermediate stations between origin and destination
     */
    async suggestStations(originId: string, destinationId: string): Promise<SuggestStationsResponse> {
        const response = await api.get<ApiResponse<SuggestStationsResponse>>('/routes/suggest-stations', {
            params: { originId, destinationId }
        });
        return response.data.data;
    },

    /**
     * Recalculate route distance
     */
    async recalculateDistance(id: string): Promise<RouteData> {
        const response = await api.post<ApiResponse<RouteData>>(`/routes/${id}/recalculate-distance`);
        return response.data.data;
    }
};
