"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Trash2, MapPin } from "lucide-react";
import LocationPickerWrapper from "@/components/map/LocationPickerWrapper";
import { tokenStorage } from "@/lib/tokenStorage";
import { is } from "zod/locales";

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

interface Station {
    _id: string;
    name: string;
    address: string;
    location?: {
        type: string;
        coordinates: [number, number]; // [lng, lat]
    };
    latitude?: number;
    longitude?: number;
    description?: string;
    contactPhone?: string;
    operatingHours?: string;
    facilities?: string[];
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export default function EditStationPage() {
    const router = useRouter();
    const params = useParams();
    const stationId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [station, setStation] = useState<Station | null>(null);

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

    // Fetch station data
    useEffect(() => {
        const fetchStation = async () => {
            try {
                const apiUrl = `${process.env.NEXT_PUBLIC_STATIONS_API_URL || 'http://localhost:9091/api/v1/stations'}/${stationId}`;
                const response = await fetch(apiUrl);

                if (!response.ok) {
                    throw new Error("Không thể tải thông tin trạm xe");
                }

                const data = await response.json();
                const stationData = data.data;

                // Kiểm tra trạm đã xóa - redirect về trang list
                if (stationData.isDeleted) {
                    alert("❌ Trạm này đã bị xóa. Không thể xem chi tiết.");
                    router.push('/admin/stations');
                    return;
                }

                console.log("=== STATION DATA DEBUG ===");
                console.log("Full station data:", stationData);
                console.log("Has latitude?", stationData.latitude);
                console.log("Has longitude?", stationData.longitude);
                console.log("Has location?", stationData.location);
                console.log("Has contactPhone?", stationData.contactPhone);
                console.log("Has operatingHours?", stationData.operatingHours);

                // Backend trả về latitude và longitude riêng biệt, không phải nested location object
                const location = (stationData.latitude && stationData.longitude)
                    ? { lat: stationData.latitude, lng: stationData.longitude }
                    : (stationData.location?.coordinates
                        ? { lat: stationData.location.coordinates[1], lng: stationData.location.coordinates[0] }
                        : null);

                console.log("Parsed location:", location);

                setStation(stationData);
                setFormData({
                    name: stationData.name || "",
                    address: stationData.address || "",
                    description: stationData.description || "",
                    contactPhone: stationData.contactPhone || "",
                    operatingHours: stationData.operatingHours || "",
                    facilities: stationData.facilities || [],
                    isActive: stationData.isActive !== false,
                    location: location,
                });

                setLoading(false);
            } catch (err) {
                console.error("Error fetching station:", err);
                setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
                setLoading(false);
            }
        };

        fetchStation();
    }, [stationId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("=== SUBMIT TRIGGERED ===");
        console.log("Form data:", formData);

        setSaving(true);
        setError(null);

        try {
            if (!formData.name || !formData.address) {
                throw new Error("Vui lòng nhập đầy đủ tên trạm và địa chỉ");
            }

            // Nếu station cũ không có location và user không chọn location mới
            if (!formData.location && !station?.latitude && !station?.longitude) {
                throw new Error("Vui lòng chọn vị trí trên bản đồ");
            }

            // Validate phone number if provided
            if (formData.contactPhone) {
                const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
                if (!phoneRegex.test(formData.contactPhone.replace(/\s/g, ''))) {
                    throw new Error("Số điện thoại không hợp lệ (VD: 0901234567 hoặc +84901234567)");
                }
            }

            const payload: any = {
                name: formData.name,
                address: formData.address,
                description: formData.description || undefined,
                contactPhone: formData.contactPhone || undefined,
                operatingHours: formData.operatingHours || undefined,
                facilities: formData.facilities.length > 0 ? formData.facilities : undefined,
                isActive: formData.isActive,
            };

            // Chỉ gửi location nếu user đã chọn vị trí mới
            if (formData.location) {
                payload.longitude = formData.location.lng;
                payload.latitude = formData.location.lat;
            }

            console.log("=== PAYLOAD ===", payload);

            const apiUrl = `${process.env.NEXT_PUBLIC_STATIONS_API_URL || 'http://localhost:9091/api/v1/stations'}/${stationId}`;
            const token = tokenStorage.getAccessToken();

            if (!token) {
                throw new Error("Vui lòng đăng nhập để thực hiện thao tác này");
            }

            console.log("=== SENDING REQUEST ===", apiUrl);

            const response = await fetch(apiUrl, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            console.log("=== RESPONSE STATUS ===", response.status);

            if (!response.ok) {
                const errorData = await response.json();
                console.error("=== ERROR RESPONSE ===", errorData);
                throw new Error(errorData.message || "Không thể cập nhật trạm xe");
            }

            const result = await response.json();
            console.log("=== SUCCESS RESPONSE ===", result);

            router.push("/admin/stations");
        } catch (err) {
            console.error("Error updating station:", err);
            setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Bạn có chắc chắn muốn xóa trạm xe này? Hành động này không thể hoàn tác.")) {
            return;
        }

        setDeleting(true);
        setError(null);

        try {
            const apiUrl = `${process.env.NEXT_PUBLIC_STATIONS_API_URL || 'http://localhost:9091/api/v1/stations'}/${stationId}`;
            const token = tokenStorage.getAccessToken();

            if (!token) {
                throw new Error("Vui lòng đăng nhập để thực hiện thao tác này");
            }

            const response = await fetch(apiUrl, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Không thể xóa trạm xe");
            }

            router.push("/admin/stations");
        } catch (err) {
            console.error("Error deleting station:", err);
            setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
        } finally {
            setDeleting(false);
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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-neutral-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-neutral-600">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    if (error && !station) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">⚠️</span>
                    </div>
                    <p className="text-red-600 font-medium mb-2">Không thể tải dữ liệu</p>
                    <p className="text-neutral-600 text-sm mb-4">{error}</p>
                    <Link
                        href="/admin/stations"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-neutral-800"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Quay lại danh sách
                    </Link>
                </div>
            </div>
        );
    }

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
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-neutral-800">Chỉnh sửa trạm xe</h1>
                        <p className="text-neutral-600 mt-1">Cập nhật thông tin chi tiết của trạm xe</p>
                    </div>
                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-neutral-400 disabled:cursor-not-allowed transition"
                    >
                        <Trash2 className="w-4 h-4" />
                        {deleting ? "Đang xóa..." : "Xóa"}
                    </button>
                </div>
            </div>

            {/* Error Alert */}
            {error && station && (
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
                                pattern="(0[0-9]{9})|(\+84[0-9]{9,10})"
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
                                    value={formData.operatingHours && formData.operatingHours.includes(' - ') ? formData.operatingHours.split(' - ')[0] : ''}
                                    onChange={(e) => {
                                        const closeTime = formData.operatingHours && formData.operatingHours.includes(' - ') ? formData.operatingHours.split(' - ')[1] : '22:00';
                                        setFormData({ ...formData, operatingHours: e.target.value ? `${e.target.value} - ${closeTime || '22:00'}` : '' });
                                    }}
                                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    placeholder="05:00"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-neutral-600 mb-1">Giờ đóng cửa</label>
                                <input
                                    type="time"
                                    value={formData.operatingHours && formData.operatingHours.includes(' - ') ? formData.operatingHours.split(' - ')[1] : ''}
                                    onChange={(e) => {
                                        const openTime = formData.operatingHours && formData.operatingHours.includes(' - ') ? formData.operatingHours.split(' - ')[0] : '05:00';
                                        setFormData({ ...formData, operatingHours: e.target.value ? `${openTime || '05:00'} - ${e.target.value}` : '' });
                                    }}
                                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    placeholder="22:00"
                                />
                            </div>
                        </div>
                        <p className="text-xs text-neutral-500 mt-1">Chọn giờ mở cửa và đóng cửa của trạm (tùy chọn)</p>
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
                    {!formData.location && !station?.latitude && !station?.longitude && (
                        <p className="text-xs text-orange-600 bg-orange-50 px-3 py-2 rounded-lg border border-orange-200">
                            ⚠️ Trạm này chưa có vị trí. Vui lòng chọn vị trí trên bản đồ để cập nhật.
                        </p>
                    )}
                    <LocationPickerWrapper
                        initialPosition={formData.location ? [formData.location.lat, formData.location.lng] : undefined}
                        addressInput={formData.address}
                        onLocationSelect={(lat, lng, address) => {
                            setFormData({ ...formData, location: { lat, lng } });
                            // Show detected address but don't override user's input
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

                {/* Metadata */}
                {
                    station?.createdAt && (
                        <div className="bg-neutral-50 rounded-lg p-4 text-xs text-neutral-600">
                            <p>Tạo lúc: {new Date(station.createdAt).toLocaleString("vi-VN")}</p>
                            {station.updatedAt && (
                                <p>Cập nhật lần cuối: {new Date(station.updatedAt).toLocaleString("vi-VN")}</p>
                            )}
                        </div>
                    )
                }

                {/* Action Buttons */}
                <div className="flex items-center gap-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg hover:bg-neutral-800 disabled:bg-neutral-400 disabled:cursor-not-allowed transition"
                    >
                        <Save className="w-4 h-4" />
                        {saving ? "Đang lưu..." : "Cập nhật"}
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
