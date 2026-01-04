import api from '@/lib/axios';

export interface RouteData {
    _id: string;
    name: string;
    distance?: number;
    estimatedDuration?: number;
    basePrice?: number;
}

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
    async getAllRoutes(): Promise<RouteData[]> {
        const response = await api.get<ApiResponse<RouteData[]>>('/routes');
        return response.data.data;
    },

    /**
     * Get route by ID
     */
    async getRouteById(id: string): Promise<RouteData> {
        const response = await api.get<ApiResponse<RouteData>>(`/routes/${id}`);
        return response.data.data;
    }
};
