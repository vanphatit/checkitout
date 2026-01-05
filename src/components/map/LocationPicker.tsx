"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Search, MapPin as MapPinIcon } from "lucide-react";

// Fix default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface LocationPickerProps {
    initialPosition?: [number, number]; // [lat, lng]
    onLocationSelect: (lat: number, lng: number, address?: string) => void;
    addressInput?: string; // Địa chỉ từ form input
}

function MapClickHandler({
    onLocationSelect
}: {
    onLocationSelect: (lat: number, lng: number, address?: string) => void
}) {
    const map = useMap();

    useMapEvents({
        async click(e) {
            const { lat, lng } = e.latlng;

            // Reverse geocoding: Lấy địa chỉ từ tọa độ
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
                );
                const data = await response.json();
                const address = data.display_name || "";
                onLocationSelect(lat, lng, address);
            } catch (error) {
                console.error("Reverse geocoding failed:", error);
                onLocationSelect(lat, lng);
            }
        },
    });
    return null;
}

function MapController({ position }: { position: [number, number] | null }) {
    const map = useMap();

    useEffect(() => {
        if (position) {
            map.flyTo(position, 15, { duration: 1 });
        }
    }, [position, map]);

    return null;
}

export default function LocationPicker({ initialPosition, onLocationSelect, addressInput }: LocationPickerProps) {
    const [position, setPosition] = useState<[number, number] | null>(
        initialPosition || null
    );
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);
    const [detectedAddress, setDetectedAddress] = useState<string>("");
    const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (initialPosition) {
            setPosition(initialPosition);
        }
    }, [initialPosition]);

    // Auto-search địa chỉ khi user nhập vào form
    useEffect(() => {
        if (addressInput && addressInput.length > 10 && !position) {
            handleSearchAddress(addressInput);
        }
    }, [addressInput]);

    const handleLocationSelect = (lat: number, lng: number, address?: string) => {
        setPosition([lat, lng]);
        if (address) {
            setDetectedAddress(address);
        }
        onLocationSelect(lat, lng, address);
        setSearchResults([]);
    };

    const handleSearchAddress = async (query: string) => {
        if (query.length < 3) {
            setSearchResults([]);
            return;
        }

        setSearching(true);
        try {
            // Forward geocoding: Tìm tọa độ từ địa chỉ
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=vn&limit=5`
            );
            const data = await response.json();
            setSearchResults(data);
        } catch (error) {
            console.error("Geocoding search failed:", error);
        } finally {
            setSearching(false);
        }
    };

    const handleSearchInput = (value: string) => {
        setSearchQuery(value);

        // Debounce search
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            handleSearchAddress(value);
        }, 500);
    };

    const selectSearchResult = (result: any) => {
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        handleLocationSelect(lat, lng, result.display_name);
        setSearchQuery("");
        setSearchResults([]);
    };

    // Default center: Vietnam (Da Nang)
    const center: [number, number] = position || [16.0544, 108.2022];

    return (
        <div className="relative space-y-3">
            {/* Search Box */}
            <div className="relative">
                <div className="flex items-center gap-2 px-4 py-2 border border-neutral-300 rounded-lg bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
                    <Search className="w-4 h-4 text-neutral-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => handleSearchInput(e.target.value)}
                        placeholder="Tìm kiếm địa chỉ trên bản đồ..."
                        className="flex-1 outline-none text-sm text-neutral-700"
                    />
                    {searching && (
                        <div className="w-4 h-4 border-2 border-neutral-300 border-t-blue-600 rounded-full animate-spin"></div>
                    )}
                </div>

                {/* Search Results Dropdown */}
                {searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                        {searchResults.map((result, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => selectSearchResult(result)}
                                className="w-full px-4 py-3 text-left hover:bg-blue-50 border-b border-neutral-100 last:border-b-0 transition"
                            >
                                <div className="flex items-start gap-2">
                                    <MapPinIcon className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-neutral-800 truncate">{result.display_name}</p>
                                        <p className="text-xs text-neutral-500 mt-0.5">
                                            {parseFloat(result.lat).toFixed(4)}, {parseFloat(result.lon).toFixed(4)}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Info Bar */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    {position ? (
                        <div className="space-y-1">
                            <p className="text-sm text-neutral-600">
                                📍 <span className="font-mono text-neutral-800">{position[0].toFixed(6)}, {position[1].toFixed(6)}</span>
                            </p>
                            {detectedAddress && (
                                <p className="text-xs text-neutral-500 bg-blue-50 px-2 py-1 rounded border border-blue-100">
                                    Địa chỉ phát hiện: {detectedAddress}
                                </p>
                            )}
                        </div>
                    ) : (
                        <p className="text-sm text-neutral-600">
                            👆 Click vào bản đồ hoặc tìm kiếm địa chỉ
                        </p>
                    )}
                </div>
                {position && (
                    <button
                        type="button"
                        onClick={() => {
                            setPosition(null);
                            setDetectedAddress("");
                            onLocationSelect(0, 0);
                        }}
                        className="text-xs text-red-600 hover:text-red-700 font-medium flex-shrink-0"
                    >
                        Xóa vị trí
                    </button>
                )}
            </div>

            {/* Map */}
            <MapContainer
                center={center}
                zoom={position ? 13 : 6}
                style={{ height: "400px", width: "100%", borderRadius: "12px" }}
                className="z-0"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapClickHandler onLocationSelect={handleLocationSelect} />
                <MapController position={position} />
                {position && <Marker position={position} />}
            </MapContainer>
        </div>
    );
}
