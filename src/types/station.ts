export interface Station {
    _id: string;
    name: string;
    address?: string;
    city?: string;
    province?: string;
    isActive?: boolean;
    isDeleted?: boolean;
    latitude?: number;
    longitude?: number;
    coordinates?: {
        latitude: number;
        longitude: number;
    };
    location?: {
        type: string;
        coordinates: [number, number]; // [lng, lat]
    };
    contactPhone?: string;
    operatingHours?: string;
    facilities?: string[];
    createdAt?: string;
    updatedAt?: string;
}
