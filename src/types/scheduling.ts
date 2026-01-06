export interface Route {
    _id: string;
    name: string;
    distance: number;
    estimatedDuration: number;
    description?: string;
    basePrice?: number;
    pricePerKm?: number;
    stationIds?: any[];
}

export interface Bus {
    _id: string;
    plateNo: string;
    type: string;
    seats?: any[];
    status: string;
}

export interface Driver {
    name: string;
    phone: string;
    licenseNumber?: string;
}

export interface Conductor {
    name: string;
    phone: string;
}

export interface Scheduling {
    _id: string;
    routeId: Route;
    busIds: Bus[];
    etd: string;
    eta?: string;
    departureDate: string;
    arrivalDate?: string;
    availableSeats: number;
    bookedSeats: number;
    totalSeats?: number;
    price?: number;
    status: "scheduled" | "in-progress" | "completed" | "cancelled" | "delayed";
    isActive: boolean;
    isDeleted: boolean;
    driver?: Driver;
    conductor?: Conductor;
    note?: string;
    estimatedDuration?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateSchedulingDto {
    routeId: string;
    busIds: string[];
    etd: string;
    departureDate: string;
    eta?: string;
    arrivalDate?: string;
    price?: number;
    driver?: Driver;
    conductor?: Conductor;
    note?: string;
}

export interface UpdateSchedulingDto {
    routeId?: string;
    busIds?: string[];
    etd?: string;
    departureDate?: string;
    eta?: string;
    arrivalDate?: string;
    price?: number;
    status?: "scheduled" | "in-progress" | "completed" | "cancelled" | "delayed";
    isActive?: boolean;
    driver?: Driver;
    conductor?: Conductor;
    note?: string;
}

export interface SchedulingStats {
    total: number;
    active: number;
    inactive: number;
    deleted: number;
    scheduled: number;
    inProgress: number;
    completed: number;
    cancelled: number;
    delayed: number;
}

export interface SchedulingFilters {
    date?: string;
    routeId?: string;
    status?: string;
    query?: string;
}
