"use client";

import { Scheduling } from "@/types/scheduling";
import { SchedulingCard } from "./SchedulingCard";
import { Calendar, Loader2 } from "lucide-react";

interface SchedulingListProps {
    schedulings: Scheduling[];
    isLoading: boolean;
    onCardClick: (id: string) => void;
}

export function SchedulingList({
    schedulings,
    isLoading,
    onCardClick,
}: SchedulingListProps) {
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                <p className="text-neutral-600">Đang tải lịch trình...</p>
            </div>
        );
    }

    if (schedulings.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
                    <Calendar className="w-8 h-8 text-neutral-400" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                    Không tìm thấy lịch trình
                </h3>
                <p className="text-neutral-600 max-w-md">
                    Không có lịch trình nào cho ngày đã chọn. Vui lòng chọn ngày khác.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <p className="text-sm text-neutral-600">
                Tìm thấy <span className="font-semibold">{schedulings.length}</span>{" "}
                lịch trình
            </p>
            <div className="grid grid-cols-1 gap-4">
                {schedulings.map((scheduling) => (
                    <SchedulingCard
                        key={scheduling._id}
                        scheduling={scheduling}
                        onClick={() => onCardClick(scheduling._id)}
                    />
                ))}
            </div>
        </div>
    );
}
