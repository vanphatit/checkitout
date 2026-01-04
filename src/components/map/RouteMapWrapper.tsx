"use client";

import dynamic from "next/dynamic";

const RouteMap = dynamic(() => import("./RouteMap"), {
    ssr: false,
    loading: () => (
        <div className="w-full rounded-lg bg-neutral-100 flex items-center justify-center" style={{ height: "500px" }}>
            <p className="text-neutral-500">Loading map...</p>
        </div>
    ),
});

interface Station {
    _id: string;
    name: string;
    address: string;
    location?: {
        coordinates: [number, number];
    };
}

interface RouteMapWrapperProps {
    stations: Station[];
    height?: string;
}

export default function RouteMapWrapper({ stations, height }: RouteMapWrapperProps) {
    return <RouteMap stations={stations} height={height} />;
}
