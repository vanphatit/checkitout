"use client";

import { useState, useEffect, useRef } from "react";
import { Search, MapPin, X } from "lucide-react";
import { stationService } from "@/services/stationService";
import { Station } from "@/types/station";

interface StationSelectorProps {
    label: string;
    placeholder?: string;
    value: Station | null;
    onChange: (station: Station | null) => void;
    excludeIds?: string[];
    disabled?: boolean;
}

export default function StationSelector({
    label,
    placeholder = "Tìm kiếm trạm...",
    value,
    onChange,
    excludeIds = [],
    disabled = false
}: StationSelectorProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [stations, setStations] = useState<Station[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const searchStations = async () => {
            if (searchQuery.trim().length < 2) {
                setStations([]);
                return;
            }

            setLoading(true);
            try {
                const results = await stationService.searchStations(searchQuery);
                // Filter out excluded stations
                const filtered = results.filter(s => !excludeIds.includes(s._id));
                setStations(filtered);
            } catch (error) {
                console.error("Error searching stations:", error);
                setStations([]);
            } finally {
                setLoading(false);
            }
        };

        const debounce = setTimeout(searchStations, 300);
        return () => clearTimeout(debounce);
    }, [searchQuery, excludeIds]);

    const handleSelect = (station: Station) => {
        onChange(station);
        setSearchQuery("");
        setIsOpen(false);
        setStations([]);
    };

    const handleClear = () => {
        onChange(null);
        setSearchQuery("");
        setStations([]);
    };

    return (
        <div className="space-y-2" ref={wrapperRef}>
            <label className="block text-sm font-medium text-neutral-700">
                {label}
            </label>

            {value ? (
                <div className="relative">
                    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <MapPin className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-neutral-800 truncate">{value.name}</p>
                            {value.address && <p className="text-xs text-neutral-500 truncate">{value.address}</p>}
                        </div>
                        {!disabled && (
                            <button
                                type="button"
                                onClick={handleClear}
                                className="p-1 hover:bg-green-100 rounded-full transition-colors"
                            >
                                <X className="w-4 h-4 text-neutral-500" />
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                <div className="relative">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setIsOpen(true);
                            }}
                            onFocus={() => setIsOpen(true)}
                            placeholder={placeholder}
                            disabled={disabled}
                            className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-neutral-100 disabled:cursor-not-allowed"
                        />
                    </div>

                    {isOpen && searchQuery.length >= 2 && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {loading ? (
                                <div className="p-4 text-center text-neutral-500">
                                    <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                                    <p className="mt-2 text-sm">Đang tìm kiếm...</p>
                                </div>
                            ) : stations.length > 0 ? (
                                <div className="py-1">
                                    {stations.map((station) => (
                                        <button
                                            key={station._id}
                                            type="button"
                                            onClick={() => handleSelect(station)}
                                            className="w-full px-4 py-2 text-left hover:bg-neutral-50 transition-colors flex items-start gap-2"
                                        >
                                            <MapPin className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-neutral-800 text-sm truncate">
                                                    {station.name}
                                                </p>
                                                {station.address && (
                                                    <p className="text-xs text-neutral-500 truncate">
                                                        {station.address}
                                                    </p>
                                                )}
                                                {station.isActive === false && (
                                                    <span className="inline-block mt-1 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full">
                                                        Ngừng hoạt động
                                                    </span>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-4 text-center text-neutral-500 text-sm">
                                    Không tìm thấy trạm nào
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
