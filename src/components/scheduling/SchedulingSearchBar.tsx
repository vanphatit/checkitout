"use client";

import { useState } from "react";
import { Calendar, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCurrentDate } from "@/lib/formatters";

interface SchedulingSearchBarProps {
    onSearch: (date: string) => void;
    isLoading?: boolean;
}

export function SchedulingSearchBar({
    onSearch,
    isLoading,
}: SchedulingSearchBarProps) {
    const [selectedDate, setSelectedDate] = useState(getCurrentDate());

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(selectedDate);
    };

    return (
        <div className="bg-white rounded-lg border border-neutral-200 p-6 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label
                        htmlFor="date"
                        className="block text-sm font-medium text-neutral-700 mb-2"
                    >
                        <Calendar className="w-4 h-4 inline mr-1" />
                        Chọn ngày khởi hành
                    </label>
                    <div className="flex gap-3">
                        <Input
                            type="date"
                            id="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="flex-1"
                            required
                        />
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="px-6 bg-primary hover:bg-primary/90"
                        >
                            {isLoading ? (
                                <>
                                    <Search className="w-4 h-4 mr-2 animate-pulse" />
                                    Đang tìm...
                                </>
                            ) : (
                                <>
                                    <Search className="w-4 h-4 mr-2" />
                                    Tìm lịch trình
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
