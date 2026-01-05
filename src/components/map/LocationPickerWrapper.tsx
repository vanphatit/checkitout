"use client";

import dynamic from "next/dynamic";

const LocationPicker = dynamic(() => import("./LocationPicker"), {
    ssr: false,
    loading: () => (
        <div className="h-[400px] bg-neutral-100 rounded-xl flex items-center justify-center">
            <div className="text-center">
                <div className="w-8 h-8 border-4 border-neutral-300 border-t-neutral-600 rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-sm text-neutral-600">Đang tải bản đồ...</p>
            </div>
        </div>
    ),
});

interface LocationPickerWrapperProps {
    initialPosition?: [number, number];
    onLocationSelect: (lat: number, lng: number, address?: string) => void;
    addressInput?: string;
}

export default function LocationPickerWrapper({ initialPosition, onLocationSelect, addressInput }: LocationPickerWrapperProps) {
    return <LocationPicker initialPosition={initialPosition} onLocationSelect={onLocationSelect} addressInput={addressInput} />;
}
