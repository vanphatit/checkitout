"use client";

import Link from "next/link";
import { MapPin, Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { tokenStorage } from "@/lib/tokenStorage";

interface Station {
    _id: string;
    name: string;
    address: string;
    location?: {
        type: string;
        coordinates: [number, number]; // [lng, lat]
    };
    description?: string;
    contactPhone?: string;
    operatingHours?: string;
    facilities?: string[];
    isActive?: boolean;
    isDeleted?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export default function StationsPage() {
    const [stations, setStations] = useState<Station[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 50;

    // Stats từ toàn bộ DB (không filter)
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        inactive: 0,
        deleted: 0
    });

    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        fetchStations();
    }, [page, searchQuery]);

    const fetchStats = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_STATIONS_API_URL ||
                'http://localhost:9091/api/v1/stations';

            const response = await fetch(`${apiUrl}/stats`, {
                cache: 'no-store',
            });

            if (!response.ok) {
                console.error('Failed to fetch stats:', response.status);
                return;
            }

            const data = await response.json();
            console.log('Stats data:', data);

            // Backend trả về { data: { total, active, inactive, deleted } }
            const statsData = data.data || data;
            setStats({
                total: statsData.total || 0,
                active: statsData.active || 0,
                inactive: statsData.inactive || 0,
                deleted: statsData.deleted || 0
            });
        } catch (err) {
            console.error('Error fetching stats:', err);
        }
    };

    const fetchStations = async () => {
        setLoading(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_STATIONS_API_URL ||
                'http://localhost:9091/api/v1/stations';

            // Admin xem tất cả stations (bao gồm inactive và đã xóa)
            const url = new URL(apiUrl);
            url.searchParams.append('page', page.toString());
            url.searchParams.append('limit', limit.toString());
            url.searchParams.append('includeDeleted', 'true');
            if (searchQuery.trim()) {
                url.searchParams.append('search', searchQuery.trim());
            }

            console.log('Fetching from:', url.toString());

            const response = await fetch(url.toString(), {
                cache: 'no-store',
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Data received:', data);

            // Backend response has nested data: { data: { data: [...], total, page, ... } }
            const stationsData = data.data?.data || data.data || [];
            setStations(Array.isArray(stationsData) ? stationsData : []);
            setTotal(data.data?.total || 0);
            setTotalPages(data.data?.totalPages || 1);
        } catch (err) {
            console.error('Error fetching stations:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch stations');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (value: string) => {
        setSearchQuery(value);
        setPage(1); // Reset to first page when searching
    };

    const handleRestore = async (stationId: string, stationName: string) => {
        if (!confirm(`Bạn có chắc muốn khôi phục trạm "${stationName}"?`)) {
            return;
        }

        try {
            const apiUrl = process.env.NEXT_PUBLIC_STATIONS_API_URL ||
                'http://localhost:9091/api/v1/stations';

            const token = tokenStorage.getAccessToken();
            const response = await fetch(`${apiUrl}/${stationId}/restore`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Không thể khôi phục trạm');
            }

            alert('✅ Khôi phục trạm thành công!');
            // Refresh data
            fetchStations();
            fetchStats();
        } catch (err) {
            console.error('Error restoring station:', err);
            alert('❌ Lỗi khi khôi phục trạm');
        }
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

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">⚠️</span>
                    </div>
                    <p className="text-red-600 font-medium mb-2">Lỗi khi tải dữ liệu</p>
                    <p className="text-neutral-600 text-sm">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-black text-white rounded-lg hover:bg-neutral-800"
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-neutral-800">Quản lý trạm xe</h1>
                    <p className="text-neutral-600 mt-1">Quản lý danh sách các trạm xe trong hệ thống</p>
                </div>
                <Link
                    href="/admin/stations/new"
                    className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-neutral-800 transition"
                >
                    <Plus className="w-4 h-4" />
                    Thêm trạm mới
                </Link>
            </div>

            {/* Search & Filters */}
            <div className="bg-white rounded-xl border border-neutral-200 p-4">
                <div className="flex items-center gap-3">
                    <Search className="w-5 h-5 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên hoặc địa chỉ..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="flex-1 outline-none text-neutral-700"
                    />
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-neutral-200 p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <MapPin className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-neutral-800">{stats.total}</p>
                            <p className="text-sm text-neutral-600">Tổng số trạm</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-neutral-200 p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <MapPin className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-neutral-800">
                                {stats.active}
                            </p>
                            <p className="text-sm text-neutral-600">Trạm hoạt động</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-neutral-200 p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                            <MapPin className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-neutral-800">
                                {stats.inactive}
                            </p>
                            <p className="text-sm text-neutral-600">Trạm ngừng hoạt động</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-neutral-200 p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                            <MapPin className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-neutral-800">
                                {stats.deleted}
                            </p>
                            <p className="text-sm text-neutral-600">Trạm đã xóa</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stations Table */}
            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                {stations.length === 0 ? (
                    <div className="p-12 text-center">
                        <MapPin className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                        <p className="text-neutral-600">Chưa có trạm nào</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-neutral-50 border-b border-neutral-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                                        Tên trạm
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                                        Địa chỉ
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                                        Tiện ích
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                                        Trạng thái
                                    </th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-neutral-700">
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200">
                                {stations.map((station: Station) => (
                                    <tr key={station._id} className="hover:bg-neutral-50 transition">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <MapPin className="w-5 h-5 text-blue-600" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-medium text-neutral-800">{station.name}</p>
                                                    {station.description && (
                                                        <p className="text-xs text-neutral-500 truncate max-w-[200px]" title={station.description}>
                                                            {station.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-neutral-700 max-w-xs">
                                                {station.address}
                                            </p>
                                            {station.contactPhone && (
                                                <p className="text-xs text-neutral-500 mt-1">📞 {station.contactPhone}</p>
                                            )}
                                            {station.operatingHours && (
                                                <p className="text-xs text-neutral-500">⏰ {station.operatingHours}</p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {station.facilities && station.facilities.length > 0 ? (
                                                <div className="flex flex-wrap gap-1 max-w-[250px]">
                                                    {station.facilities.slice(0, 3).map((facility, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-neutral-100 text-neutral-700"
                                                        >
                                                            {facility}
                                                        </span>
                                                    ))}
                                                    {station.facilities.length > 3 && (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-neutral-100 text-neutral-700">
                                                            +{station.facilities.length - 3}
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-sm text-neutral-400">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                {station.isDeleted ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                        Đã xóa
                                                    </span>
                                                ) : station.isActive ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        Hoạt động
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                                        Ngừng hoạt động
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {station.isDeleted ? (
                                                <button
                                                    onClick={() => handleRestore(station._id, station.name)}
                                                    className="text-sm font-medium text-green-600 hover:text-green-700"
                                                >
                                                    ↻ Khôi phục
                                                </button>
                                            ) : (
                                                <Link
                                                    href={`/admin/stations/${station._id}`}
                                                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                                                >
                                                    Chi tiết →
                                                </Link>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between bg-white rounded-xl border border-neutral-200 px-6 py-4">
                    <div className="text-sm text-neutral-600">
                        Trang {page} / {totalPages} • Tổng {total} trạm
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage(prev => Math.max(1, prev - 1))}
                            disabled={page === 1}
                            className={`px-4 py-2 rounded-lg font-medium transition ${page === 1
                                ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                                : 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50'
                                }`}
                        >
                            ← Trước
                        </button>

                        {/* Page Numbers */}
                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (page <= 3) {
                                    pageNum = i + 1;
                                } else if (page >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = page - 2 + i;
                                }

                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setPage(pageNum)}
                                        className={`w-10 h-10 rounded-lg font-medium transition ${pageNum === page
                                            ? 'bg-black text-white'
                                            : 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50'
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={page === totalPages}
                            className={`px-4 py-2 rounded-lg font-medium transition ${page === totalPages
                                ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                                : 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50'
                                }`}
                        >
                            Sau →
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
