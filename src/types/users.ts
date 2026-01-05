import { User } from "./auth";

export type UserRole = User["role"];
export type UserStatus = User["status"];

export interface UserActivity {
  id: string;
  action: string;
  description?: string;
  createdAt: string;
  ipAddress?: string | null;
  device?: string | null;
  location?: string | null;
  metadata?: Record<string, unknown>;
}

export interface UsersListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UsersCollection {
  items: User[];
  meta: UsersListMeta;
}

export interface UserFilters {
  search?: string;
  status?: UserStatus;
  role?: UserRole;
  page?: number;
  limit?: number;
}

export interface UpdateProfilePayload {
  firstName: string;
  lastName: string;
  phone?: string | null;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface AdminCreateUserPayload extends UpdateProfilePayload {
  email: string;
  password: string;
  role: UserRole;
  status: UserStatus;
}

export interface AdminUpdateUserPayload extends UpdateProfilePayload {
  email: string;
  role: UserRole;
  status: UserStatus;
}

export type UsersListResponse = UsersCollection;
