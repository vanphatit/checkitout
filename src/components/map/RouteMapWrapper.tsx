"use client";

import dynamic from "next/dynamic";
import { Station } from "@/types/station";
import { useEffect, useState } from "react";
import { stationService } from "@/services/stationService";

const RouteMap = dynamic(() => import("./RouteMap"), {
    ssr: false,
    loading: () => (
        <div className="w-full rounded-lg bg-neutral-100 flex items-center justify-center" style={{ height: "500px" }}>
            <p className="text-neutral-500">Loading map...</p>
        </div>
    ),
});

interface RouteMapWrapperProps {
    stations: Station[];
    height?: string;
    interactive?: boolean;
    selectionMode?: 'origin' | 'destination' | 'intermediate';
    onOriginSelect?: (station: Station) => void;
    onDestinationSelect?: (station: Station) => void;
    onIntermediateToggle?: (station: Station) => void;
    selectedOriginId?: string;
    selectedDestinationId?: string;
    selectedIntermediateIds?: string[];
}

export default function RouteMapWrapper({
    stations,
    height,
    interactive = false,
    selectionMode,
    onOriginSelect,
    onDestinationSelect,
    onIntermediateToggle,
    selectedOriginId,
    selectedDestinationId,
    selectedIntermediateIds
}: RouteMapWrapperProps) {
    const [allStations, setAllStations] = useState<Station[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (interactive) {
            console.log("RouteMapWrapper: Loading all stations...");
            setLoading(true);
            stationService.getAllStations()
                .then(data => {
                    console.log("RouteMapWrapper: Loaded stations:", data);
                    console.log("RouteMapWrapper: Stations count:", data.length);
                    console.log("RouteMapWrapper: First station:", data[0]);
                    setAllStations(data);
                })
                .catch(err => {
                    console.error("RouteMapWrapper: Error loading stations:", err);
                })
                .finally(() => setLoading(false));
        }
    }, [interactive]);

    if (loading) {
        return (
            <div className="w-full rounded-lg bg-neutral-100 flex items-center justify-center" style={{ height: height || "500px" }}>
                <p className="text-neutral-500">Đang tải bản đồ...</p>
            </div>
        );
    }

    return (
        <RouteMap
            stations={stations}
            height={height}
            interactive={interactive}
            selectionMode={selectionMode}
            allStations={interactive ? allStations : []}
            onOriginSelect={onOriginSelect}
            onDestinationSelect={onDestinationSelect}
            onIntermediateToggle={onIntermediateToggle}
            selectedOriginId={selectedOriginId}
            selectedDestinationId={selectedDestinationId}
            selectedIntermediateIds={selectedIntermediateIds}
        />
    );
}
