import api from '@/lib/axios';

export interface Station {
  _id: string;
  name: string;
  address?: string;
  city?: string;
  province?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  timestamp: string;
  path: string;
  method: string;
  data: T;
}

export const stationService = {
  /**
   * Search stations by name or address
   */
  async searchStations(query: string): Promise<Station[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const response = await api.get<ApiResponse<Station[]>>('/stations/search', {
      params: { q: query.trim() }
    });
    return response.data.data;
  },

  /**
   * Get all stations (for initial load)
   */
  async getAllStations(): Promise<Station[]> {
    const response = await api.get<ApiResponse<{
      data: Station[];
      pagination: any;
    }>>('/stations', {
      params: { limit: 100 }
    });
    return response.data.data.data;
  }
};
