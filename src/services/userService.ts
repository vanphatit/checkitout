import api from "@/lib/axios";
import { ApiResponse, User } from "@/types/auth";
import {
  AdminCreateUserPayload,
  AdminUpdateUserPayload,
  ChangePasswordPayload,
  UpdateProfilePayload,
  UserActivity,
  UserFilters,
  UsersCollection,
  UsersListMeta,
} from "@/types/users";

type MaybeApiResponse<T> = ApiResponse<T> | { data: T } | T;

const emptyMeta: UsersListMeta = {
  total: 0,
  page: 1,
  limit: 0,
  totalPages: 1,
};

const resolveData = <T>(payload: MaybeApiResponse<T>): T => {
  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    (payload as { data?: T }).data !== undefined
  ) {
    return (payload as { data: T }).data;
  }

  return payload as T;
};

const resolveMessage = (payload: unknown, fallback = "Success"): string => {
  if (
    payload &&
    typeof payload === "object" &&
    "message" in payload &&
    typeof (payload as { message?: string }).message === "string"
  ) {
    return (payload as { message?: string }).message ?? fallback;
  }
  return fallback;
};

const normalizeMeta = (
  meta?: Partial<UsersListMeta>,
  fallbackTotal = 0,
  fallbackLimit = fallbackTotal
): UsersListMeta => {
  if (!meta) {
    return {
      total: fallbackTotal,
      page: 1,
      limit: fallbackLimit,
      totalPages:
        fallbackLimit > 0 ? Math.max(1, Math.ceil(fallbackTotal / fallbackLimit)) : 1,
    };
  }

  const limit = meta.limit ?? fallbackLimit ?? meta.total ?? 0;
  const total = meta.total ?? fallbackTotal;
  const computedPages =
    limit && limit > 0 ? Math.max(1, Math.ceil(total / limit)) : 1;

  return {
    total,
    page: meta.page ?? 1,
    limit,
    totalPages: meta.totalPages ?? computedPages,
  };
};

const normalizeUsersCollection = (payload: unknown): UsersCollection => {
  if (!payload) {
    return { items: [], meta: emptyMeta };
  }

  if (
    typeof payload === "object" &&
    "items" in payload &&
    Array.isArray((payload as { items: unknown }).items)
  ) {
    const typedPayload = payload as Partial<UsersCollection> & {
      items: User[];
    };
    return {
      items: typedPayload.items,
      meta: normalizeMeta(typedPayload.meta, typedPayload.items.length),
    };
  }

  if (
    typeof payload === "object" &&
    "data" in payload &&
    (payload as { data?: unknown }).data !== undefined
  ) {
    return normalizeUsersCollection((payload as { data: unknown }).data);
  }

  if (Array.isArray(payload)) {
    return {
      items: payload as User[],
      meta: normalizeMeta(undefined, payload.length, payload.length || 1),
    };
  }

  return { items: [], meta: emptyMeta };
};

export const userService = {
  async getMyProfile(): Promise<User> {
    const response = await api.get<MaybeApiResponse<User>>("/users/profile");
    return resolveData<User>(response.data);
  },

  async updateMyProfile(payload: UpdateProfilePayload): Promise<User> {
    const response = await api.put<MaybeApiResponse<User>>(
      "/users/profile",
      payload
    );
    return resolveData<User>(response.data);
  },

  async changePassword(payload: ChangePasswordPayload): Promise<string> {
    const response = await api.post<
      ApiResponse<{ message?: string }> | { message?: string } | string
    >("/auth/change-password", payload);
    return resolveMessage(response.data, "Password updated successfully");
  },

  async getUsers(filters?: UserFilters): Promise<UsersCollection> {
    const response = await api.get<
      MaybeApiResponse<UsersCollection | User[]>
    >("/users", {
      params: filters,
    });
    return normalizeUsersCollection(response.data);
  },

  async createUser(payload: AdminCreateUserPayload): Promise<User> {
    const response = await api.post<MaybeApiResponse<User>>(
      "/users",
      payload
    );
    return resolveData<User>(response.data);
  },

  async updateUser(
    id: string,
    payload: AdminUpdateUserPayload
  ): Promise<User> {
    const response = await api.put<MaybeApiResponse<User>>(
      `/users/${id}`,
      payload
    );
    return resolveData<User>(response.data);
  },

  async deleteUser(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  },

  async getUserActivities(
    id: string,
    params?: { limit?: number }
  ): Promise<UserActivity[]> {
    const response = await api.get<MaybeApiResponse<UserActivity[]>>(
      `/users/${id}/activities`,
      { params }
    );
    return resolveData<UserActivity[]>(response.data);
  },

  async searchUserByEmailOrPhone(query: string): Promise<User | null> {
    try {
      const response = await api.get<MaybeApiResponse<UsersCollection | User[]>>(
        "/users",
        {
          params: { search: query, limit: 1 },
        }
      );
      const collection = normalizeUsersCollection(response.data);
      return collection.items.length > 0 ? collection.items[0] : null;
    } catch (error) {
      return null;
    }
  },
};
