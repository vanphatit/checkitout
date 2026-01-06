import axios from '@/lib/axios';
import { ApiResponse } from '@/types/auth';
export interface OverviewStats {
    todayRevenue: number;
    todayTickets: number;
    activeSchedulings: number;
    newUsers: number;
}

export interface RevenueTrendData {
    date: string;
    revenue: number;
}

export interface TopRouteData {
    routeName: string;
    originStation: string;
    destinationStation: string;
    revenue: number;
    ticketCount: number;
}

export interface TicketStatusDistribution {
    PENDING?: number;
    CONFIRMED?: number;
    CANCELLED?: number;
    COMPLETED?: number;
}

export interface SchedulingStatusDistribution {
    SCHEDULED: number;
    RUNNING: number;
    COMPLETED: number;
    CANCELLED: number;
}

export interface SchedulingSummary {
    total: number;
    scheduled: number;
    'in-progress': number;
    completed: number;
    cancelled: number;
}

export interface BusTodayData {
    busId: string;
    busName: string;
    licensePlate: string;
    schedulingCount: number;
}

export interface OccupancyTrendData {
    date: string;
    occupancy: number;
}

export interface SchedulingDetailToday {
    _id: string;
    departureDate: string;
    departureTime: string;
    arrivalTime: string;
    status: 'SCHEDULED' | 'RUNNING' | 'COMPLETED' | 'CANCELLED';
    price: number;
    totalSeats: number;
    availableSeats: number;
    occupancyRate: string;
    route: {
        _id: string;
        name: string;
        originStation: string;
        destinationStation: string;
        distance: number;
        estimatedDuration: number;
    };
    buses: Array<{
        _id: string;
        name: string;
        licensePlate: string;
        type: string;
        capacity: number;
    }>;
}

const resolveData = <T>(response: ApiResponse<T>): T => response.data as T;

export const statisticsService = {
    /**
     * Get dashboard overview statistics
     */
    getOverview: async (): Promise<OverviewStats> => {
        const response = await axios.get<ApiResponse<OverviewStats>>('/statistics/overview');
        return resolveData(response.data);
    },

    /**
     * Get revenue trend by period
     */
    getRevenueTrend: async (period: '7d' | '30d' | '12m' = '7d'): Promise<RevenueTrendData[]> => {
        const response = await axios.get<ApiResponse<RevenueTrendData[]>>('/statistics/revenue', {
            params: { period }
        });
        return resolveData(response.data);
    },

    /**
     * Get top routes by revenue
     */
    getTopRoutes: async (limit: number = 10): Promise<TopRouteData[]> => {
        const response = await axios.get<ApiResponse<TopRouteData[]>>('/statistics/routes/top', {
            params: { limit }
        });
        return resolveData(response.data);
    },

    /**
     * Get ticket status distribution
     */
    getTicketStatusDistribution: async (): Promise<TicketStatusDistribution> => {
        const response = await axios.get<ApiResponse<TicketStatusDistribution>>('/statistics/tickets/status');
        return resolveData(response.data);
    },

    /**
     * Get scheduling status for today
     */
    getSchedulingStatusToday: async (): Promise<SchedulingStatusDistribution> => {
        const response = await axios.get<ApiResponse<SchedulingStatusDistribution>>('/statistics/schedulings/status');
        return resolveData(response.data);
    },

    /**
     * Get today's scheduling summary with total count
     */
    getTodaySchedulingSummary: async (): Promise<SchedulingSummary> => {
        const response = await axios.get<ApiResponse<SchedulingSummary>>('/statistics/schedulings/summary');
        return resolveData(response.data);
    },

    /**
     * Get buses operating today
     */
    getBusesToday: async (): Promise<BusTodayData[]> => {
        const response = await axios.get<ApiResponse<BusTodayData[]>>('/statistics/buses/today');
        return resolveData(response.data);
    },

    /**
     * Get average seat occupancy trend
     */
    getOccupancyTrend: async (days: number = 7): Promise<OccupancyTrendData[]> => {
        const response = await axios.get<ApiResponse<OccupancyTrendData[]>>('/statistics/occupancy', {
            params: { days }
        });
        return resolveData(response.data);
    },

    /**
     * Get detailed schedulings for today with buses and routes
     */
    getSchedulingDetailsToday: async (): Promise<SchedulingDetailToday[]> => {
        const response = await axios.get<ApiResponse<SchedulingDetailToday[]>>('/statistics/schedulings/today-details');
        return resolveData(response.data);
    },
};
