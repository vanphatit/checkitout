"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface Station {
    _id: string;
    name: string;
    address: string;
    location?: {
        coordinates: [number, number]; // [lng, lat]
    };
}

interface RouteMapProps {
    stations: Station[];
    height?: string;
}

export default function RouteMap({ stations, height = "400px" }: RouteMapProps) {
    // Debug: log stations data
    useEffect(() => {
        console.log("RouteMap stations:", stations);
        console.log("Stations with location:", stations.filter(s => s.location?.coordinates));
    }, [stations]);

    // Extract coordinates from stations
    const positions = stations
        .filter((s) => s.location?.coordinates)
        .map((s) => [s.location!.coordinates[1], s.location!.coordinates[0]] as [number, number]);

    if (positions.length === 0) {
        return (
            <div className="w-full rounded-lg bg-neutral-100 flex items-center justify-center p-8" style={{ height }}>
                <div className="text-center">
                    <p className="text-neutral-600 font-medium mb-2">No location data available</p>
                    <p className="text-neutral-500 text-sm">
                        Stations: {stations.length} | With coordinates: {stations.filter(s => s.location?.coordinates).length}
                    </p>
                </div>
            </div>
        );
    }

    // Calculate center (average of all positions)
    const center: [number, number] = [
        positions.reduce((sum, pos) => sum + pos[0], 0) / positions.length,
        positions.reduce((sum, pos) => sum + pos[1], 0) / positions.length,
    ];

    // Create custom icons for start, end, and intermediate stops
    const startIcon = new L.Icon({
        iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
    });

    const endIcon = new L.Icon({
        iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
    });

    const intermediateIcon = new L.Icon({
        iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
    });

    const getIcon = (index: number) => {
        if (index === 0) return startIcon;
        if (index === stations.length - 1) return endIcon;
        return intermediateIcon;
    };

    return (
        <div className="w-full rounded-lg overflow-hidden border border-neutral-200" style={{ height }}>
            <MapContainer
                center={center}
                zoom={6}
                style={{ height: "100%", width: "100%" }}
                scrollWheelZoom={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Draw route line */}
                <Polyline positions={positions} color="#2563eb" weight={3} opacity={0.7} />

                {/* Place markers */}
                {stations.map((station, index) => {
                    if (!station.location?.coordinates) return null;
                    const position: [number, number] = [
                        station.location.coordinates[1],
                        station.location.coordinates[0],
                    ];

                    return (
                        <Marker key={station._id} position={position} icon={getIcon(index)}>
                            <Popup>
                                <div className="text-sm">
                                    <p className="font-semibold text-neutral-800">
                                        {index === 0 ? "🟢 " : index === stations.length - 1 ? "🔴 " : "🔵 "}
                                        Stop {index + 1}
                                    </p>
                                    <p className="font-medium mt-1">{station.name}</p>
                                    <p className="text-neutral-600 text-xs mt-0.5">{station.address}</p>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
}
