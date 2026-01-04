"use client";

import { useState, useEffect, useRef } from "react";
import { stationService, Station } from "@/services/stationService";
import { FaMapMarkerAlt } from "react-icons/fa";
import { Loader2 } from "lucide-react";

interface StationAutocompleteProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    icon?: React.ReactNode;
    className?: string;
}

export function StationAutocomplete({
    value,
    onChange,
    placeholder = "Nhập điểm...",
    icon,
    className = ""
}: StationAutocompleteProps) {
    const [inputValue, setInputValue] = useState(value);
    const [suggestions, setSuggestions] = useState<Station[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        setInputValue(value);
    }, [value]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInputValue(newValue);
        setSelectedIndex(-1);

        // Debounce search
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        if (newValue.trim().length < 2) {
            setSuggestions([]);
            setShowSuggestions(false);
            onChange(newValue);
            return;
        }

        setIsLoading(true);
        debounceRef.current = setTimeout(async () => {
            try {
                const results = await stationService.searchStations(newValue);
                setSuggestions(results);
                setShowSuggestions(results.length > 0);
            } catch (error) {
                console.error("Error searching stations:", error);
                setSuggestions([]);
            } finally {
                setIsLoading(false);
            }
        }, 300);
    };

    const handleSelectStation = (station: Station) => {
        const stationName = station.name.replace("Bến xe ", "");
        setInputValue(stationName);
        onChange(stationName);
        setShowSuggestions(false);
        setSuggestions([]);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!showSuggestions) return;

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setSelectedIndex(prev =>
                    prev < suggestions.length - 1 ? prev + 1 : prev
                );
                break;
            case "ArrowUp":
                e.preventDefault();
                setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
                break;
            case "Enter":
                e.preventDefault();
                if (selectedIndex >= 0 && suggestions[selectedIndex]) {
                    handleSelectStation(suggestions[selectedIndex]);
                }
                break;
            case "Escape":
                setShowSuggestions(false);
                break;
        }
    };

    return (
        <div ref={wrapperRef} className={`relative ${className}`}>
            <div className="relative">
                {icon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        {icon}
                    </div>
                )}
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                        if (suggestions.length > 0) {
                            setShowSuggestions(true);
                        }
                    }}
                    placeholder={placeholder}
                    className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${icon ? "pl-11" : ""
                        }`}
                />
                {isLoading && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                    </div>
                )}
            </div>

            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-[300px] overflow-y-auto">
                    {suggestions.map((station, index) => (
                        <div
                            key={station._id}
                            onClick={() => handleSelectStation(station)}
                            className={`px-4 py-3 cursor-pointer hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 ${index === selectedIndex ? "bg-blue-50" : ""
                                }`}
                        >
                            <div className="flex items-start gap-3 text-left">
                                <FaMapMarkerAlt className="h-4 w-4 text-blue-500 mt-1 flex-shrink-0" />
                                <div className="flex-1 min-w-0 text-left">
                                    <div className="font-medium text-gray-900 truncate text-left">
                                        {station.name}
                                    </div>
                                    {station.address && (
                                        <div className="text-sm text-gray-500 truncate mt-0.5 text-left">
                                            {station.address}
                                            {station.city && `, ${station.city}`}
                                            {station.province && `, ${station.province}`}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
