"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Trash2, MapPin, AlertCircle, Sparkles, RefreshCw } from "lucide-react";
import StationSelector from "@/components/admin/routes/StationSelector";
import IntermediateStationsList from "@/components/admin/routes/IntermediateStationsList";
import RouteMapWrapper from "@/components/map/RouteMapWrapper";
import { routeService } from "@/services/routeService";
import { toast } from "@/hooks/use-toast";
import { Station } from "@/types/station";

export default function EditRoutePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();

    const [originStation, setOriginStation] = useState<Station | null>(null);
    const [destinationStation, setDestinationStation] = useState<Station | null>(null);
    const [intermediateStations, setIntermediateStations] = useState<Station[]>([]);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [distance, setDistance] = useState("");
    const [etd, setEtd] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [suggesting, setSuggesting] = useState(false);
    const [recalculating, setRecalculating] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Define allStations first
    const allStations = [
        ...(originStation ? [originStation] : []),
        ...intermediateStations,
        ...(destinationStation ? [destinationStation] : [])
    ];

    useEffect(() => {
        fetchRoute();
    }, [id]);

    // Auto-generate route name from origin and destination
    useEffect(() => {
        if (originStation && destinationStation) {
            setName(`${originStation.name} - ${destinationStation.name}`);
        }
    }, [originStation, destinationStation]);

    // Auto-calculate distance from station coordinates
    useEffect(() => {
        if (allStations.length >= 2) {
            let totalDistance = 0;
            for (let i = 0; i < allStations.length - 1; i++) {
                const from = allStations[i];
                const to = allStations[i + 1];

                if (from.location?.coordinates && to.location?.coordinates) {
                    const [lon1, lat1] = from.location.coordinates;
                    const [lon2, lat2] = to.location.coordinates;

                    // Haversine formula to calculate distance
                    const R = 6371; // Earth's radius in km
                    const dLat = (lat2 - lat1) * Math.PI / 180;
                    const dLon = (lon2 - lon1) * Math.PI / 180;
                    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);
                    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                    totalDistance += R * c;
                }
            }
            if (totalDistance > 0) {
                setDistance(totalDistance.toFixed(1));
            }
        }
    }, [allStations]);

    // Helper function to calculate distance between two stations
    const calculateDistance = (station1: Station, station2: Station): number => {
        let lat1: number, lon1: number, lat2: number, lon2: number;

        // Get coordinates from station1
        if (station1.location?.coordinates) {
            [lon1, lat1] = station1.location.coordinates;
        } else if (station1.longitude !== undefined && station1.latitude !== undefined) {
            lon1 = station1.longitude;
            lat1 = station1.latitude;
        } else {
            return Infinity;
        }

        // Get coordinates from station2
        if (station2.location?.coordinates) {
            [lon2, lat2] = station2.location.coordinates;
        } else if (station2.longitude !== undefined && station2.latitude !== undefined) {
            lon2 = station2.longitude;
            lat2 = station2.latitude;
        } else {
            return Infinity;
        }

        // Haversine formula
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    // Function to sort intermediate stations by optimal route order
    const sortIntermediateStations = (stations: Station[]): Station[] => {
        if (!originStation || !destinationStation || stations.length === 0) {
            return stations;
        }

        // Greedy algorithm: start from origin, always pick the nearest unvisited station
        const sorted: Station[] = [];
        const remaining = [...stations];
        let current = originStation;

        while (remaining.length > 0) {
            let nearestIndex = 0;
            let minDistance = Infinity;

            remaining.forEach((station, index) => {
                const dist = calculateDistance(current, station);
                if (dist < minDistance) {
                    minDistance = dist;
                    nearestIndex = index;
                }
            });

            const nearest = remaining[nearestIndex];
            sorted.push(nearest);
            remaining.splice(nearestIndex, 1);
            current = nearest;
        }

        return sorted;
    };

    // Handler for intermediate stations change with auto-sorting
    const handleIntermediateStationsChange = (stations: Station[]) => {
        const sorted = sortIntermediateStations(stations);
        setIntermediateStations(sorted);
    };

    const handleIntermediateToggle = (station: Station) => {
        const index = intermediateStations.findIndex(s => s._id === station._id);
        if (index >= 0) {
            // Remove if already selected
            const newStations = intermediateStations.filter((_, i) => i !== index);
            setIntermediateStations(newStations);
        } else {
            // Add and auto-sort
            const newStations = [...intermediateStations, station];
            const sorted = sortIntermediateStations(newStations);
            setIntermediateStations(sorted);
        }
    };

    const fetchRoute = async () => {
        setLoading(true);
        try {
            const route = await routeService.getRouteById(id);

            // Kiểm tra route đã xóa - redirect về trang list
            if (route.isDeleted) {
                toast({
                    variant: "destructive",
                    title: "Lỗi",
                    description: "Tuyến đường này đã bị xóa. Không thể chỉnh sửa."
                });
                router.push('/admin/routes');
                return;
            }

            setName(route.name);
            setDescription(route.description || "");
            setDistance(route.distance?.toString() || "");
            setEtd(route.etd || "");
            setIsActive(route.isActive);

            if (route.stationIds && route.stationIds.length >= 2) {
                setOriginStation(route.stationIds[0]);
                setDestinationStation(route.stationIds[route.stationIds.length - 1]);
                setIntermediateStations(route.stationIds.slice(1, -1));
            }
        } catch (error: any) {
            console.error("Error fetching route:", error);
            toast({
                variant: "destructive",
                title: "Lỗi",
                description: error.response?.data?.message || "Không thể tải thông tin tuyến đường"
            });
            router.push("/admin/routes");
        } finally {
            setLoading(false);
        }
    };

    const handleSuggest = async () => {
        if (!originStation || !destinationStation) {
            toast({
                variant: "destructive",
                title: "Lỗi",
                description: "Vui lòng chọn trạm đầu và trạm cuối"
            });
            return;
        }

        setSuggesting(true);
        try {
            const result = await routeService.suggestStations(originStation._id, destinationStation._id);
            setIntermediateStations(result.suggestedStations);
            toast({
                title: "Thành công",
                description: `Đã tìm thấy ${result.suggestedStations.length} trạm trung gian`
            });
        } catch (error: any) {
            console.error("Error suggesting stations:", error);
            toast({
                variant: "destructive",
                title: "Lỗi",
                description: error.response?.data?.message || "Không thể tìm trạm trung gian"
            });
        } finally {
            setSuggesting(false);
        }
    };

    const handleRecalculate = async () => {
        setRecalculating(true);
        try {
            await routeService.recalculateDistance(id);
            toast({
                title: "Thành công",
                description: "Đã cập nhật khoảng cách tuyến đường"
            });
            await fetchRoute();
        } catch (error: any) {
            console.error("Error recalculating distance:", error);
            toast({
                variant: "destructive",
                title: "Lỗi",
                description: error.response?.data?.message || "Không thể tính toán lại khoảng cách"
            });
        } finally {
            setRecalculating(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!originStation || !destinationStation) {
            toast({
                variant: "destructive",
                title: "Lỗi",
                description: "Vui lòng chọn trạm đầu và trạm cuối"
            });
            return;
        }

        if (!name.trim()) {
            toast({
                variant: "destructive",
                title: "Lỗi",
                description: "Vui lòng nhập tên tuyến đường"
            });
            return;
        }

        if (!distance || parseFloat(distance) <= 0) {
            toast({
                variant: "destructive",
                title: "Lỗi",
                description: "Vui lòng nhập khoảng cách hợp lệ"
            });
            return;
        }

        if (!etd.trim() || !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(etd)) {
            toast({
                variant: "destructive",
                title: "Lỗi",
                description: "Vui lòng nhập giờ khởi hành hợp lệ (HH:mm)"
            });
            return;
        }

        const stationIds = [
            originStation._id,
            ...intermediateStations.map(s => s._id),
            destinationStation._id
        ];

        if (stationIds.length < 2) {
            toast({
                variant: "destructive",
                title: "Lỗi",
                description: "Tuyến đường phải có ít nhất 2 trạm"
            });
            return;
        }

        setSaving(true);
        try {
            await routeService.updateRoute(id, {
                name: name.trim(),
                description: description.trim() || undefined,
                distance: parseFloat(distance),
                etd: etd.trim(),
                stationIds,
                isActive
            });
            toast({
                title: "Thành công",
                description: "Cập nhật tuyến đường thành công!"
            });
            router.push("/admin/routes");
        } catch (error: any) {
            console.error("Error updating route:", error);
            toast({
                variant: "destructive",
                title: "Lỗi",
                description: error.response?.data?.message || "Không thể cập nhật tuyến đường"
            });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await routeService.deleteRoute(id);
            toast({
                title: "Thành công",
                description: "Đã xóa tuyến đường"
            });
            router.push("/admin/routes");
        } catch (error: any) {
            console.error("Error deleting route:", error);
            const errorMessage = error.response?.data?.message || "Không thể xóa tuyến đường";
            toast({
                variant: "destructive",
                title: "Lỗi",
                description: errorMessage
            });
            setShowDeleteModal(false);
        } finally {
            setDeleting(false);
        }
    };

    const excludedStationIds = [
        ...(originStation ? [originStation._id] : []),
        ...(destinationStation ? [destinationStation._id] : []),
        ...intermediateStations.map(s => s._id)
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-neutral-600">Đang tải thông tin tuyến đường...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="min-h-screen bg-neutral-50 pb-16">
                {/* Header */}
                <div className="bg-white border-b border-neutral-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Link
                                    href="/admin/routes"
                                    className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                                >
                                    <ArrowLeft className="w-5 h-5 text-neutral-600" />
                                </Link>
                                <div>
                                    <h1 className="text-2xl font-bold text-neutral-800">
                                        Chỉnh sửa tuyến đường
                                    </h1>
                                    <p className="text-sm text-neutral-500 mt-1">
                                        Cập nhật thông tin và trạm của tuyến đường
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowDeleteModal(true)}
                                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <Trash2 className="w-5 h-5" />
                                Xóa tuyến đường
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left Column - Form */}
                        <div className="space-y-6">
                            {/* Route Info Card */}
                            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
                                <h2 className="text-lg font-semibold text-neutral-800 mb-4">
                                    Thông tin tuyến đường
                                </h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                                            Tên tuyến đường <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="VD: Hà Nội - Hải Phòng"
                                            required
                                            className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                                            Mô tả
                                        </label>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Mô tả ngắn về tuyến đường..."
                                            rows={3}
                                            className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                                Khoảng cách (km) <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                min="0"
                                                value={distance}
                                                onChange={(e) => setDistance(e.target.value)}
                                                placeholder="VD: 150"
                                                required
                                                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                                Giờ khởi hành (HH:mm) <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={etd}
                                                onChange={(e) => setEtd(e.target.value)}
                                                placeholder="VD: 08:00"
                                                required
                                                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            id="isActive"
                                            checked={isActive}
                                            onChange={(e) => setIsActive(e.target.checked)}
                                            className="w-4 h-4 text-blue-600 border-neutral-300 rounded focus:ring-2 focus:ring-blue-500"
                                        />
                                        <label htmlFor="isActive" className="text-sm font-medium text-neutral-700">
                                            Tuyến đường đang hoạt động
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Station Selection Card */}
                            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
                                <h2 className="text-lg font-semibold text-neutral-800 mb-4">
                                    Chọn trạm
                                </h2>
                                <div className="space-y-4">
                                    <StationSelector
                                        label="Trạm đầu (điểm xuất phát)"
                                        placeholder="Tìm kiếm trạm xuất phát..."
                                        value={originStation}
                                        onChange={setOriginStation}
                                        excludeIds={excludedStationIds}
                                    />

                                    <StationSelector
                                        label="Trạm cuối (điểm đến)"
                                        placeholder="Tìm kiếm trạm đích..."
                                        value={destinationStation}
                                        onChange={setDestinationStation}
                                        excludeIds={excludedStationIds}
                                    />

                                    {originStation && destinationStation && (
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={handleSuggest}
                                                disabled={suggesting}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <Sparkles className="w-4 h-4" />
                                                {suggesting ? "Đang tìm..." : "Tự động tìm trạm"}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleRecalculate}
                                                disabled={recalculating}
                                                className="px-4 py-2.5 border border-neutral-300 text-neutral-700 text-sm rounded-lg hover:bg-neutral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                title="Tính lại khoảng cách"
                                            >
                                                <RefreshCw className={`w-4 h-4 ${recalculating ? 'animate-spin' : ''}`} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Intermediate Stations Card */}
                            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-semibold text-neutral-800">
                                        Trạm trung gian
                                    </h2>
                                    {intermediateStations.length > 0 && (
                                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                                            {intermediateStations.length} trạm
                                        </span>
                                    )}
                                </div>
                                <IntermediateStationsList
                                    stations={intermediateStations}
                                    onChange={handleIntermediateStationsChange}
                                    excludeIds={[
                                        ...(originStation ? [originStation._id] : []),
                                        ...(destinationStation ? [destinationStation._id] : []),
                                    ]}
                                />
                            </div>

                            {/* Warning about inactive stations */}
                            {allStations.some(s => s.isActive === false) && (
                                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                    <div className="flex gap-3">
                                        <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-orange-800">
                                                Cảnh báo: Trạm ngừng hoạt động
                                            </p>
                                            <p className="text-xs text-orange-700 mt-1">
                                                Một số trạm trong tuyến đường đang ngừng hoạt động.
                                                Điều này có thể ảnh hưởng đến lịch trình hiện tại.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Submit Button */}
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => router.back()}
                                    className="flex-1 px-6 py-3 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving || !originStation || !destinationStation || !name.trim()}
                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Save className="w-5 h-5" />
                                    {saving ? "Đang lưu..." : "Lưu thay đổi"}
                                </button>
                            </div>
                        </div>

                        {/* Right Column - Map Preview */}
                        <div className="lg:sticky lg:top-8 h-fit">
                            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-semibold text-neutral-800">
                                        Xem trước tuyến đường
                                    </h2>
                                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                                        <MapPin className="w-4 h-4" />
                                        <span>{allStations.length} trạm</span>
                                    </div>
                                </div>

                                {allStations.length >= 2 ? (
                                    <RouteMapWrapper
                                        stations={allStations}
                                        height="600px"
                                        interactive={true}
                                        onOriginSelect={setOriginStation}
                                        onDestinationSelect={setDestinationStation}
                                        onIntermediateToggle={handleIntermediateToggle}
                                        selectedOriginId={originStation?._id}
                                        selectedDestinationId={destinationStation?._id}
                                        selectedIntermediateIds={intermediateStations.map(s => s._id)}
                                    />
                                ) : (
                                    <div>
                                        <RouteMapWrapper
                                            stations={allStations.length > 0 ? allStations : []}
                                            height="600px"
                                            interactive={true}
                                            onOriginSelect={setOriginStation}
                                            onDestinationSelect={setDestinationStation}
                                            onIntermediateToggle={handleIntermediateToggle}
                                            selectedOriginId={originStation?._id}
                                            selectedDestinationId={destinationStation?._id}
                                            selectedIntermediateIds={intermediateStations.map(s => s._id)}
                                        />
                                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
                                            <p className="text-sm text-blue-900">
                                                💡 Click vào các marker trên bản đồ để chọn trạm
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <div className="flex items-start gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                                <Trash2 className="w-6 h-6 text-red-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-neutral-800 mb-2">
                                    Xác nhận xóa tuyến đường
                                </h3>
                                <p className="text-sm text-neutral-600">
                                    Bạn có chắc chắn muốn xóa tuyến đường <strong>{name}</strong> không?
                                </p>
                                <p className="text-sm text-orange-600 mt-2">
                                    ⚠️ Lưu ý: Không thể xóa nếu có lịch trình đang sử dụng tuyến đường này.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setShowDeleteModal(false)}
                                disabled={deleting}
                                className="flex-1 px-4 py-2.5 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors disabled:opacity-50"
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={deleting}
                                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {deleting ? "Đang xóa..." : "Xóa tuyến đường"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
