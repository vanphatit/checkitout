export interface Route {
    _id: string;
    name: string;
    distance: number;
    estimatedDuration: number;
    description?: string;
    basePrice?: number;
    pricePerKm?: number;
    stationIds?: string[];
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
    price?: number;
    status: "scheduled" | "in-progress" | "completed" | "cancelled" | "delayed";
    isActive: boolean;
    driver?: Driver;
    note?: string;
    estimatedDuration?: number;
}

export interface SchedulingFilters {
    date?: string;
    routeId?: string;
    status?: string;
}
