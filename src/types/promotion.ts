export interface Promotion {
  _id: string;
  name: string;
  type: "Default" | "Recurring" | "Special";
  startDate: string;
  expiryDate: string;
  value: number;
  recurringMonth?: number;
  recurringDay?: number;
  isActive: boolean;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePromotionDto {
  name: string;
  type: "Default" | "Recurring" | "Special";
  startDate: string;
  expiryDate: string;
  value: number;
  recurringMonth?: number;
  recurringDay?: number;
  description?: string;
  isActive?: boolean;
}

export interface UpdatePromotionDto {
  name?: string;
  startDate?: string;
  expiryDate?: string;
  value?: number;
  description?: string;
  isActive?: boolean;
}

export interface PromotionListResponse {
  statusCode: number;
  message: string;
  data: Promotion[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PromotionStats {
  total: number;
  active: number;
  inactive: number;
  byType: {
    Default: number;
    Recurring: number;
    Special: number;
  };
}
