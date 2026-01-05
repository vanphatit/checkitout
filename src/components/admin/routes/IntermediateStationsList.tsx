"use client";

import { ChevronUp, ChevronDown, X, MapPin, Plus } from "lucide-react";
import { Station } from "@/types/station";
import { useState } from "react";
import StationSelector from "./StationSelector";

interface IntermediateStationsListProps {
    stations: Station[];
    onChange: (stations: Station[]) => void;
    disabled?: boolean;
    excludeIds?: string[];
}

export default function IntermediateStationsList({
    stations,
    onChange,
    disabled = false,
    excludeIds = []
}: IntermediateStationsListProps) {
    const [showAddStation, setShowAddStation] = useState(false);

    const addStation = (station: Station) => {
        onChange([...stations, station]);
        setShowAddStation(false);
    };

    const moveUp = (index: number) => {
        if (index === 0) return;
        const newStations = [...stations];
        [newStations[index - 1], newStations[index]] = [newStations[index], newStations[index - 1]];
        onChange(newStations);
    };

    const moveDown = (index: number) => {
        if (index === stations.length - 1) return;
        const newStations = [...stations];
        [newStations[index], newStations[index + 1]] = [newStations[index + 1], newStations[index]];
        onChange(newStations);
    };

    const remove = (index: number) => {
        const newStations = stations.filter((_, i) => i !== index);
        onChange(newStations);
    };

    if (stations.length === 0 && !showAddStation) {
        return (
            <div className="text-center py-8 text-neutral-500">
                <MapPin className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Chưa có trạm trung gian</p>
                <p className="text-xs mt-1">Nhấn &quot;Tự động tìm trạm&quot; hoặc thêm thủ công</p>
                {!disabled && (
                    <button
                        type="button"
                        onClick={() => setShowAddStation(true)}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium flex items-center gap-2 mx-auto"
                    >
                        <Plus className="w-4 h-4" />
                        Thêm trạm thủ công
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {showAddStation && (
                <div className="p-3 bg-blue-50 border-2 border-blue-300 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-blue-900">Thêm trạm trung gian</p>
                        <button
                            type="button"
                            onClick={() => setShowAddStation(false)}
                            className="text-blue-600 hover:text-blue-800"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    <StationSelector
                        label=""
                        placeholder="Tìm kiếm trạm..."
                        value={null}
                        onChange={(station) => station && addStation(station)}
                        excludeIds={excludeIds}
                    />
                </div>
            )}
            {stations.map((station, index) => (
                <div
                    key={`${station._id}-${index}`}
                    className="flex items-center gap-3 p-3 bg-white border border-neutral-200 rounded-lg hover:border-neutral-300 transition-colors"
                >
                    {/* Station number badge */}
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-semibold">
                        {index + 1}
                    </div>

                    {/* Station info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <p className="font-medium text-neutral-800 text-sm truncate">
                                {station.name}
                            </p>
                            {station.isActive === false && (
                                <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full">
                                    Ngừng hoạt động
                                </span>
                            )}
                        </div>
                        {station.address && (
                            <p className="text-xs text-neutral-500 truncate">{station.address}</p>
                        )}
                    </div>

                    {/* Action buttons */}
                    {!disabled && (
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={() => moveUp(index)}
                                disabled={index === 0}
                                className="p-1 hover:bg-neutral-100 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                title="Di chuyển lên"
                            >
                                <ChevronUp className="w-4 h-4 text-neutral-600" />
                            </button>
                            <button
                                type="button"
                                onClick={() => moveDown(index)}
                                disabled={index === stations.length - 1}
                                className="p-1 hover:bg-neutral-100 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                title="Di chuyển xuống"
                            >
                                <ChevronDown className="w-4 h-4 text-neutral-600" />
                            </button>
                            <button
                                type="button"
                                onClick={() => remove(index)}
                                className="p-1 hover:bg-red-100 rounded transition-colors ml-1"
                                title="Xóa trạm"
                            >
                                <X className="w-4 h-4 text-red-600" />
                            </button>
                        </div>
                    )}
                </div>
            ))}
            {!disabled && !showAddStation && (
                <button
                    type="button"
                    onClick={() => setShowAddStation(true)}
                    className="w-full p-3 border-2 border-dashed border-neutral-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-neutral-600 hover:text-blue-600 flex items-center justify-center gap-2 text-sm font-medium"
                >
                    <Plus className="w-4 h-4" />
                    Thêm trạm thủ công
                </button>
            )}
        </div>
    );
}
