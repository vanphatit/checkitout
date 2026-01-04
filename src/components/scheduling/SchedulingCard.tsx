"use client";

import { Scheduling } from "@/types/scheduling";
import { formatDuration, formatPrice } from "@/lib/formatters";
import { Clock, MapPin, Users, BusFront, Wifi, Tv, Battery, Coffee } from "lucide-react";

interface SchedulingCardProps {
    scheduling: Scheduling;
    onClick: () => void;
}

export function SchedulingCard({ scheduling, onClick }: SchedulingCardProps) {
    const { routeId, etd, eta, availableSeats, price, busIds, driver, departureDate } = scheduling;

    const duration = routeId.estimatedDuration || 0;
    const busType = busIds[0]?.type || "Standard";
    const busPlate = busIds[0]?.plateNo || "N/A";

    const facilities = [
        { icon: Wifi, label: "WiFi" },
        { icon: Tv, label: "TV" },
        { icon: Battery, label: "Sạc" },
        { icon: Coffee, label: "Nước uống" },
    ];

    return (
        <div
            onClick={onClick}
            className="bg-white rounded-lg border border-neutral-200 p-6 hover:shadow-lg hover:border-primary transition-all cursor-pointer group"
        >
            <div className="space-y-4">
                {/* Route Name and Bus Info */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-neutral-900 line-clamp-1">
                            {routeId.name}
                        </h3>
                        <p className="text-xs text-neutral-500 mt-1">
                            Biển số: {busPlate}
                        </p>
                    </div>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded font-medium whitespace-nowrap">
                        {busType}
                    </span>
                </div>

                {/* Time and Duration with Bus Icon Animation */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-neutral-500" />
                        <span className="text-sm font-medium text-neutral-700">{etd}</span>
                    </div>

                    <div className="flex-1 flex items-center justify-center relative">
                        <div className="h-px bg-neutral-300 flex-1 max-w-[80px]"></div>

                        {/* Animated Bus Icon */}
                        <div className="relative mx-2 flex items-center gap-1">
                            <BusFront className="w-5 h-5 text-primary animate-pulse group-hover:animate-bounce" />
                            <span className="text-xs text-neutral-500 font-medium whitespace-nowrap">
                                {formatDuration(duration)}
                            </span>
                        </div>

                        <div className="h-px bg-neutral-300 flex-1 max-w-[80px]"></div>

                        {/* Decorative Arrow */}
                        <div className="absolute right-0 w-0 h-0 border-t-4 border-t-transparent border-l-4 border-l-neutral-300 border-b-4 border-b-transparent"></div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-neutral-500" />
                        <span className="text-sm font-medium text-neutral-700">
                            {eta || "--:--"}
                        </span>
                    </div>
                </div>

                {/* Distance and Driver Info */}
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-neutral-600">
                        <MapPin className="w-4 h-4" />
                        <span>{routeId.distance}km</span>
                    </div>
                    {driver?.name && (
                        <div className="text-neutral-600">
                            <span className="text-xs">Tài xế: </span>
                            <span className="font-medium">{driver.name}</span>
                        </div>
                    )}
                </div>

                {/* Facilities */}
                <div className="flex items-center gap-3 py-2 border-y border-neutral-100">
                    {facilities.map(({ icon: Icon, label }) => (
                        <div key={label} className="flex items-center gap-1 text-neutral-500">
                            <Icon className="w-3.5 h-3.5" />
                            <span className="text-xs">{label}</span>
                        </div>
                    ))}
                </div>

                {/* Bottom Section */}
                <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-neutral-500" />
                        <span className="text-sm text-neutral-600">
                            {availableSeats} ghế trống
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-primary">
                            {price ? formatPrice(price) : "---"}
                        </span>
                        <button className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary/90 transition">
                            Xem chi tiết
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
