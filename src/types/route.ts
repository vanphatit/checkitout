import { Station } from './station';

export interface RouteData {
    _id: string;
    name: string;
    description?: string;
    distance?: number;
    etd?: string;
    estimatedDuration?: number;
    basePrice?: number;
    pricePerKm?: number;
    stationIds: Station[];
    isActive: boolean;
    isDeleted: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateRouteDto {
    name: string;
    description?: string;
    distance: number;
    etd: string;
    stationIds: string[];
    estimatedDuration?: number;
    basePrice?: number;
    pricePerKm?: number;
}

export interface UpdateRouteDto {
    name?: string;
    description?: string;
    distance?: number;
    etd?: string;
    stationIds?: string[];
    isActive?: boolean;
    estimatedDuration?: number;
    basePrice?: number;
    pricePerKm?: number;
}

export interface SuggestStationsResponse {
    origin: Station;
    destination: Station;
    suggestedStations: Array<Station & { distanceFromOrigin: number; deviation: number }>;
    totalDistance: number;
}
