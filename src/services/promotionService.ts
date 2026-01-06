import api from "@/lib/axios";
import {
  Promotion,
  CreatePromotionDto,
  UpdatePromotionDto,
  PromotionListResponse,
  PromotionStats,
} from "@/types/promotion";

interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
}

export const promotionService = {
  /**
   * Get all promotions with pagination
   */
  async getPromotions(params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    search?: string;
    isActive?: boolean;
  }): Promise<PromotionListResponse> {
    const response = await api.get<PromotionListResponse>("/promotion", {
      params,
    });

    console.log("Promotion Service - Get Promotions Response:", response);

    return response.data;
  },

  /**
   * Get promotion by ID
   */
  async getPromotionById(id: string): Promise<Promotion> {
    const response = await api.get<ApiResponse<Promotion>>(`/promotion/${id}`);
    return response.data.data;
  },

  /**
   * Create new promotion
   */
  async createPromotion(data: CreatePromotionDto): Promise<Promotion> {
    const response = await api.post<ApiResponse<Promotion>>("/promotion", data);
    return response.data.data;
  },

  /**
   * Update promotion
   */
  async updatePromotion(
    id: string,
    data: UpdatePromotionDto
  ): Promise<Promotion> {
    const response = await api.patch<ApiResponse<Promotion>>(
      `/promotion/${id}`,
      data
    );
    return response.data.data;
  },

  /**
   * Delete promotion
   */
  async deletePromotion(id: string): Promise<void> {
    await api.delete(`/promotion/${id}`);
  },

  /**
   * Disable promotion
   */
  async disablePromotion(id: string): Promise<Promotion> {
    const response = await api.patch<ApiResponse<Promotion>>(
      `/promotion/${id}/disable`
    );
    return response.data.data;
  },

  /**
   * Enable promotion
   */
  async enablePromotion(id: string): Promise<Promotion> {
    const response = await api.patch<ApiResponse<Promotion>>(
      `/promotion/${id}/enable`
    );
    return response.data.data;
  },

  /**
   * Get promotion statistics
   */
  async getStats(): Promise<PromotionStats> {
    const response = await api.get<ApiResponse<PromotionStats>>(
      "/promotion/stats"
    );
    return response.data.data;
  },

  /**
   * Get promotion by code
   */
  async getPromotionByCode(code: string): Promise<Promotion> {
    const response = await api.get<ApiResponse<Promotion>>(
      `/promotion/code/${code}`
    );
    return response.data.data;
  },
};
