"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Save } from "lucide-react";
import LocationPickerWrapper from "@/components/map/LocationPickerWrapper";
import { tokenStorage } from "@/lib/tokenStorage";

const FACILITIES_OPTIONS = [
    "Waiting Room",
    "Security",
    "Toilet",
    "Baggage Storage",
    "Parking",
    "Canteen",
    "WiFi",
    "Air Conditioning",
    "ATM",
    "Ticket Counter",
];

export default function NewStationPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        address: "",
        description: "",
        contactPhone: "",
        operatingHours: "",
        facilities: [] as string[],
        isActive: true,
        location: null as { lat: number; lng: number } | null,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Validate required fields
            if (!formData.name || !formData.address) {
                throw new Error("Vui lòng nhập đầy đủ tên trạm và địa chỉ");
            }

            if (!formData.location) {
                throw new Error("Vui lòng chọn vị trí trên bản đồ");
            }

            // Validate phone number if provided
            if (formData.contactPhone) {
                const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
                if (!phoneRegex.test(formData.contactPhone.replace(/\s/g, ''))) {
                    throw new Error("Số điện thoại không hợp lệ (VD: 0901234567 hoặc +84901234567)");
                }
            }

            // Prepare data for API
            const payload = {
                name: formData.name,
                address: formData.address,
                longitude: formData.location.lng,
                latitude: formData.location.lat,
                description: formData.description || undefined,
                contactPhone: formData.contactPhone || undefined,
                operatingHours: formData.operatingHours || undefined,
                facilities: formData.facilities.length > 0 ? formData.facilities : undefined,
            };

            const apiUrl = process.env.NEXT_PUBLIC_STATIONS_API_URL || 'http://localhost:9091/api/v1/stations';
            const token = tokenStorage.getAccessToken();

            if (!token) {
                throw new Error("Vui lòng đăng nhập để thực hiện thao tác này");
            }

            const response = await fetch(apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Không thể tạo trạm mới");
            }

            // Success - redirect to list
            router.push("/admin/stations");
        } catch (err) {
            console.error("Error creating station:", err);
            setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
        } finally {
            setLoading(false);
        }
    };

    const handleFacilityToggle = (facility: string) => {
        setFormData((prev) => ({
            ...prev,
            facilities: prev.facilities.includes(facility)
                ? prev.facilities.filter((f) => f !== facility)
                : [...prev.facilities, facility],
        }));
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <Link
                    href="/admin/stations"
                    className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-800 mb-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Quay lại danh sách
                </Link>
                <h1 className="text-3xl font-bold text-neutral-800">Thêm trạm xe mới</h1>
                <p className="text-neutral-600 mt-1">Điền thông tin chi tiết của trạm xe</p>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-600 text-sm">{error}</p>
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info Card */}
                <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4">
                    <h2 className="text-lg font-semibold text-neutral-800">Thông tin cơ bản</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                Tên trạm <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                placeholder="Bến xe Miền Đông"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                Số điện thoại
                            </label>
                            <input
                                type="tel"
                                value={formData.contactPhone}
                                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                placeholder="0901234567"
                                pattern="^(0|\+84)[0-9]{9,10}$"
                            />
                            <p className="text-xs text-neutral-500 mt-1">VD: 0901234567 hoặc +84901234567</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Địa chỉ <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            placeholder="292 Đinh Bộ Lĩnh, Phường 26, Bình Thạnh, TP.HCM"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Mô tả
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                            placeholder="Thông tin bổ sung về trạm xe..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Giờ hoạt động
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-neutral-600 mb-1">Giờ mở cửa</label>
                                <input
                                    type="time"
                                    value={formData.operatingHours.split(' - ')[0] || ''}
                                    onChange={(e) => {
                                        const closeTime = formData.operatingHours.split(' - ')[1] || '22:00';
                                        setFormData({ ...formData, operatingHours: `${e.target.value} - ${closeTime}` });
                                    }}
                                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-neutral-600 mb-1">Giờ đóng cửa</label>
                                <input
                                    type="time"
                                    value={formData.operatingHours.split(' - ')[1] || ''}
                                    onChange={(e) => {
                                        const openTime = formData.operatingHours.split(' - ')[0] || '05:00';
                                        setFormData({ ...formData, operatingHours: `${openTime} - ${e.target.value}` });
                                    }}
                                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                />
                            </div>
                        </div>
                        <p className="text-xs text-neutral-500 mt-1">Chọn giờ mở cửa và đóng cửa của trạm</p>
                    </div>
                </div>

                {/* Location Card */}
                <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4">
                    <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-blue-600" />
                        <h2 className="text-lg font-semibold text-neutral-800">
                            Vị trí trên bản đồ <span className="text-red-500">*</span>
                        </h2>
                    </div>
                    <p className="text-sm text-neutral-600">
                        Tìm kiếm địa chỉ hoặc click vào bản đồ. Hệ thống sẽ tự động phát hiện địa chỉ từ vị trí bạn chọn.
                    </p>
                    <LocationPickerWrapper
                        initialPosition={formData.location ? [formData.location.lat, formData.location.lng] : undefined}
                        addressInput={formData.address}
                        onLocationSelect={(lat, lng, address) => {
                            setFormData({ ...formData, location: { lat, lng } });
                            // Optionally update address if detected address is better
                            if (address && !formData.address) {
                                setFormData({ ...formData, location: { lat, lng }, address });
                            }
                        }}
                    />
                </div>

                {/* Facilities Card */}
                <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4">
                    <h2 className="text-lg font-semibold text-neutral-800">Tiện ích</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {FACILITIES_OPTIONS.map((facility) => (
                            <label
                                key={facility}
                                className="flex items-center gap-2 cursor-pointer group"
                            >
                                <input
                                    type="checkbox"
                                    checked={formData.facilities.includes(facility)}
                                    onChange={() => handleFacilityToggle(facility)}
                                    className="w-4 h-4 text-blue-600 border-neutral-300 rounded focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="text-sm text-neutral-700 group-hover:text-neutral-900">
                                    {facility}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Status Card */}
                <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4">
                    <h2 className="text-lg font-semibold text-neutral-800">Trạng thái</h2>
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.isActive}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                            className="w-5 h-5 text-blue-600 border-neutral-300 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <div>
                            <p className="text-sm font-medium text-neutral-800">Trạm đang hoạt động</p>
                            <p className="text-xs text-neutral-600">
                                Bỏ chọn nếu trạm tạm ngừng hoạt động
                            </p>
                        </div>
                    </label>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg hover:bg-neutral-800 disabled:bg-neutral-400 disabled:cursor-not-allowed transition"
                    >
                        <Save className="w-4 h-4" />
                        {loading ? "Đang lưu..." : "Lưu trạm xe"}
                    </button>
                    <Link
                        href="/admin/stations"
                        className="px-6 py-3 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition"
                    >
                        Hủy bỏ
                    </Link>
                </div>
            </form>
        </div>
    );
}
