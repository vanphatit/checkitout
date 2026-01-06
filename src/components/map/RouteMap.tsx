"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Station } from "@/types/station";

// Fix for default marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface RouteMapProps {
    stations: Station[];
    height?: string;
    interactive?: boolean;
    selectionMode?: 'origin' | 'destination' | 'intermediate';
    allStations?: Station[];
    onStationClick?: (station: Station) => void;
    onOriginSelect?: (station: Station) => void;
    onDestinationSelect?: (station: Station) => void;
    onIntermediateToggle?: (station: Station) => void;
    selectedOriginId?: string;
    selectedDestinationId?: string;
    selectedIntermediateIds?: string[];
}

export default function RouteMap({
    stations,
    height = "400px",
    interactive = false,
    selectionMode = 'origin',
    allStations = [],
    onStationClick,
    onOriginSelect,
    onDestinationSelect,
    onIntermediateToggle,
    selectedOriginId,
    selectedDestinationId,
    selectedIntermediateIds = []
}: RouteMapProps) {

    // Debug: log stations data
    useEffect(() => {
        console.log("RouteMap - interactive:", interactive);
        console.log("RouteMap - stations:", stations);
        console.log("RouteMap - allStations:", allStations);
        console.log("RouteMap - allStations count:", allStations.length);
        console.log("RouteMap - allStations with coords (any format):",
            allStations.filter(s =>
                (s.location?.coordinates) ||
                (s.longitude !== undefined && s.latitude !== undefined)
            ).length
        );
        if (allStations.length > 0) {
            console.log("RouteMap - First station sample:", allStations[0]);
        }
    }, [stations, allStations, interactive]);

    // Extract coordinates from stations (support both formats)
    const positions = stations
        .map((s) => {
            // Try location.coordinates first (MongoDB geospatial)
            if (s.location?.coordinates) {
                return [s.location.coordinates[1], s.location.coordinates[0]] as [number, number];
            }
            // Fallback to longitude/latitude fields
            if (s.longitude !== undefined && s.latitude !== undefined) {
                return [s.latitude, s.longitude] as [number, number];
            }
            return null;
        })
        .filter((pos): pos is [number, number] => pos !== null);

    // Default center for Vietnam if no stations
    const defaultCenter: [number, number] = [16.0544, 108.2022]; // Da Nang, center of Vietnam

    // Calculate center (average of all positions or default)
    const center: [number, number] = positions.length > 0 ? [
        positions.reduce((sum, pos) => sum + pos[0], 0) / positions.length,
        positions.reduce((sum, pos) => sum + pos[1], 0) / positions.length,
    ] : defaultCenter;

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

    const getIcon = (index: number, stationId?: string) => {
        // For interactive mode with selection
        if (interactive && stationId) {
            if (stationId === selectedOriginId) return startIcon;
            if (stationId === selectedDestinationId) return endIcon;
            if (selectedIntermediateIds.includes(stationId)) return intermediateIcon;
            // Unselected station in interactive mode - use grey marker
            return new L.Icon({
                iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png",
                shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41],
            });
        }

        // Default behavior for non-interactive mode
        if (index === 0) return startIcon;
        if (index === stations.length - 1) return endIcon;
        return intermediateIcon;
    };

    // Component for handling map clicks in interactive mode
    function MapClickHandler() {
        useMapEvents({
            click: (e) => {
                if (interactive && onStationClick) {
                    // Find nearest station to click
                    let nearestStation: Station | null = null;
                    let minDistance = Infinity;

                    allStations.forEach(station => {
                        if (station.location?.coordinates) {
                            const [lon, lat] = station.location.coordinates;
                            const distance = Math.sqrt(
                                Math.pow(lat - e.latlng.lat, 2) + Math.pow(lon - e.latlng.lng, 2)
                            );
                            if (distance < minDistance && distance < 0.1) { // Within ~10km
                                minDistance = distance;
                                nearestStation = station;
                            }
                        }
                    });

                    if (nearestStation) {
                        onStationClick(nearestStation);
                    }
                }
            },
        });
        return null;
    }

    return (
        <div className="w-full space-y-2">
            {interactive && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-blue-900">
                        {selectionMode === 'origin' && '🟢 Đang chọn trạm đầu - Click vào marker trên bản đồ'}
                        {selectionMode === 'destination' && '🔴 Đang chọn trạm cuối - Click vào marker trên bản đồ'}
                        {selectionMode === 'intermediate' && '🔵 Đang chọn trạm trung gian - Click vào marker để thêm/bỏ'}
                    </p>
                </div>
            )}
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

                    {interactive && <MapClickHandler />}

                    {/* Draw route line */}
                    <Polyline positions={positions} color="#2563eb" weight={3} opacity={0.7} />

                    {/* Place markers for selected route stations */}
                    {stations.map((station, index) => {
                        // Get coordinates from either format
                        let position: [number, number] | null = null;
                        if (station.location?.coordinates) {
                            position = [
                                station.location.coordinates[1],
                                station.location.coordinates[0],
                            ];
                        } else if (station.longitude !== undefined && station.latitude !== undefined) {
                            position = [station.latitude, station.longitude];
                        }

                        if (!position) return null;

                        return (
                            <Marker
                                key={station._id}
                                position={position}
                                icon={getIcon(index, station._id)}
                                eventHandlers={interactive ? {
                                    click: () => {
                                        if (selectionMode === 'origin' && onOriginSelect) {
                                            onOriginSelect(station);
                                        } else if (selectionMode === 'destination' && onDestinationSelect) {
                                            onDestinationSelect(station);
                                        } else if (selectionMode === 'intermediate' && onIntermediateToggle) {
                                            onIntermediateToggle(station);
                                        }
                                    }
                                } : undefined}
                            >
                                <Popup>
                                    <div className="text-sm">
                                        <p className="font-semibold text-neutral-800">
                                            {index === 0 ? "🟢 " : index === stations.length - 1 ? "🔴 " : "🔵 "}
                                            Stop {index + 1}
                                        </p>
                                        <p className="font-medium mt-1">{station.name}</p>
                                        <p className="text-neutral-600 text-xs mt-0.5">{station.address}</p>
                                        {interactive && (
                                            <div className="mt-2 pt-2 border-t border-neutral-200 space-y-1">
                                                {selectionMode === 'origin' && (
                                                    <button
                                                        onClick={() => onOriginSelect?.(station)}
                                                        className="w-full px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                                                    >
                                                        Chọn làm trạm đầu
                                                    </button>
                                                )}
                                                {selectionMode === 'destination' && (
                                                    <button
                                                        onClick={() => onDestinationSelect?.(station)}
                                                        className="w-full px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                                                    >
                                                        Chọn làm trạm cuối
                                                    </button>
                                                )}
                                                {selectionMode === 'intermediate' && (
                                                    <button
                                                        onClick={() => onIntermediateToggle?.(station)}
                                                        className="w-full px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                                                    >
                                                        {selectedIntermediateIds.includes(station._id) ? 'Bỏ chọn' : 'Chọn trạm này'}
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    })}

                    {/* Show all available stations in interactive mode */}
                    {interactive && allStations.map((station) => {
                        // Get coordinates from either format
                        let position: [number, number] | null = null;
                        if (station.location?.coordinates) {
                            position = [
                                station.location.coordinates[1],
                                station.location.coordinates[0],
                            ];
                        } else if (station.longitude !== undefined && station.latitude !== undefined) {
                            position = [station.latitude, station.longitude];
                        }

                        if (!position) return null;

                        // Don't show stations that are already in the route
                        if (stations.some(s => s._id === station._id)) return null;

                        return (
                            <Marker
                                key={`available-${station._id}`}
                                position={position}
                                icon={getIcon(-1, station._id)}
                                eventHandlers={{
                                    click: () => {
                                        if (selectionMode === 'origin' && onOriginSelect) {
                                            onOriginSelect(station);
                                        } else if (selectionMode === 'destination' && onDestinationSelect) {
                                            onDestinationSelect(station);
                                        } else if (selectionMode === 'intermediate' && onIntermediateToggle) {
                                            onIntermediateToggle(station);
                                        }
                                    }
                                }}
                            >
                                <Popup>
                                    <div className="text-sm">
                                        <p className="font-medium">{station.name}</p>
                                        <p className="text-neutral-600 text-xs mt-0.5">{station.address}</p>
                                        <div className="mt-2 pt-2 border-t border-neutral-200 space-y-1">
                                            {selectionMode === 'origin' && (
                                                <button
                                                    onClick={() => onOriginSelect?.(station)}
                                                    className="w-full px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                                                >
                                                    Chọn làm trạm đầu
                                                </button>
                                            )}
                                            {selectionMode === 'destination' && (
                                                <button
                                                    onClick={() => onDestinationSelect?.(station)}
                                                    className="w-full px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                                                >
                                                    Chọn làm trạm cuối
                                                </button>
                                            )}
                                            {selectionMode === 'intermediate' && (
                                                <button
                                                    onClick={() => onIntermediateToggle?.(station)}
                                                    className="w-full px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                                                >
                                                    Chọn trạm này
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    })}
                </MapContainer>
            </div>
        </div>
    );
}