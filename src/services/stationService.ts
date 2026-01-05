import api from '@/lib/axios';
import { Station } from '@/types/station';

export type { Station };

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
    console.log("stationService: Fetching all stations...");
    const response = await api.get<ApiResponse<{
      data: Station[];
      pagination: any;
    }>>('/stations', {
      params: { limit: 1000 } // Increase limit to get more stations
    });
    console.log("stationService: Raw response:", response.data);
    console.log("stationService: Stations data:", response.data.data);
    const stations = response.data.data.data;
    console.log("stationService: Returning stations:", stations);
    return stations;
  }
};
