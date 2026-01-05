"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, MapPin, Edit } from "lucide-react";
import { routeService } from "@/services/routeService";
import { RouteData } from "@/types/route";
import { Station } from "@/types/station";
import { toast } from "@/hooks/use-toast";
import { tokenStorage } from "@/lib/tokenStorage";

export default function RoutesPage() {
    const [routes, setRoutes] = useState<RouteData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [showRestoreModal, setShowRestoreModal] = useState(false);
    const [restoreRoute, setRestoreRoute] = useState<{ id: string; name: string } | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Stats từ endpoint
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        inactive: 0,
        deleted: 0
    });

    useEffect(() => {
        fetchStats();
        fetchRoutes();
    }, []);

    const fetchStats = async () => {
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9091';
            const apiUrl = baseUrl.includes('/api/v1') ? baseUrl : `${baseUrl}/api/v1`;
            const response = await fetch(`${apiUrl}/routes/stats`, {
                cache: 'no-store',
            });

            if (!response.ok) {
                console.error('Failed to fetch stats:', response.status);
                return;
            }

            const data = await response.json();
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

    const fetchRoutes = async () => {
        try {
            // Admin xem tất cả routes (bao gồm inactive và đã xóa)
            const data = await routeService.getAllRoutes(true);
            setRoutes(data || []);
        } catch (error) {
            console.error("Error fetching routes:", error);
            toast({
                variant: "destructive",
                title: "Lỗi",
                description: "Không thể tải danh sách tuyến đường"
            });
        } finally {
            setLoading(false);
        }
    };

    const filteredRoutes = routes.filter(route =>
        route.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        route.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Pagination
    const totalPages = Math.ceil(filteredRoutes.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedRoutes = filteredRoutes.slice(startIndex, startIndex + itemsPerPage);

    // Reset to page 1 when search changes
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const handleRestoreClick = (routeId: string, routeName: string) => {
        setRestoreRoute({ id: routeId, name: routeName });
        setShowRestoreModal(true);
    };

    const handleRestore = async () => {
        if (!restoreRoute) return;

        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9091';
            const apiUrl = baseUrl.includes('/api/v1') ? baseUrl : `${baseUrl}/api/v1`;
            const token = tokenStorage.getAccessToken();
            const response = await fetch(`${apiUrl}/routes/${restoreRoute.id}/restore`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Không thể khôi phục tuyến đường');
            }

            setShowRestoreModal(false);
            setRestoreRoute(null);
            toast({
                title: "Thành công",
                description: "Khôi phục tuyến đường thành công!"
            });
            // Refresh data
            fetchRoutes();
            fetchStats();
        } catch (err) {
            console.error('Error restoring route:', err);
            setShowRestoreModal(false);
            setRestoreRoute(null);
            toast({
                variant: "destructive",
                title: "Lỗi",
                description: "Lỗi khi khôi phục tuyến đường"
            });
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-neutral-800">Quản lý tuyến đường</h1>
                    <p className="text-neutral-600 mt-1">Quản lý các tuyến đường xe buýt</p>
                </div>
                <Link
                    href="/admin/routes/new"
                    className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-neutral-800 transition"
                >
                    <Plus className="w-4 h-4" />
                    Thêm tuyến đường
                </Link>
            </div>

            {/* Search Bar */}
            <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-neutral-200">
                <div className="flex-1 relative">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Tìm kiếm tuyến đường..."
                        className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-neutral-200">
                    <p className="text-sm text-neutral-600">Tổng số tuyến đường</p>
                    <p className="text-2xl font-bold text-neutral-800 mt-1">{stats.total}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-neutral-200">
                    <p className="text-sm text-neutral-600">Đang hoạt động</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">{stats.active}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-neutral-200">
                    <p className="text-sm text-neutral-600">Tạm ngừng</p>
                    <p className="text-2xl font-bold text-orange-600 mt-1">{stats.inactive}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-neutral-200">
                    <p className="text-sm text-neutral-600">Đã xóa</p>
                    <p className="text-2xl font-bold text-red-600 mt-1">{stats.deleted}</p>
                </div>
            </div>

            {/* Routes List */}
            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                {filteredRoutes.length === 0 ? (
                    <div className="text-center py-12">
                        <MapPin className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                        <p className="text-neutral-600">
                            {searchQuery ? "Không tìm thấy tuyến đường nào" : "Chưa có tuyến đường nào"}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-neutral-200">
                        {paginatedRoutes.map((route) => (
                            <div
                                key={route._id}
                                className={`p-6 hover:bg-neutral-50 transition ${!route.isActive ? 'opacity-60' : ''}`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-neutral-800">
                                                {route.name}
                                            </h3>
                                            {route.isDeleted ? (
                                                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                                                    🗑️ Đã xóa
                                                </span>
                                            ) : !route.isActive ? (
                                                <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                                                    Ngừng hoạt động
                                                </span>
                                            ) : null}
                                        </div>
                                        {route.description && (
                                            <p className="text-sm text-neutral-600 mb-3">{route.description}</p>
                                        )}

                                        {/* Route Info */}
                                        <div className="flex items-center gap-6 text-sm text-neutral-600 mb-3">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4" />
                                                <span>{route.distance} km</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span>⏱️</span>
                                                <span>{route.estimatedDuration} phút</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span>🚏</span>
                                                <span>{route.stationIds?.length || 0} trạm</span>
                                            </div>
                                        </div>

                                        {/* Stations Preview */}
                                        {route.stationIds && route.stationIds.length > 0 && (
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <span className="text-neutral-600">Lộ trình:</span>
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-green-600 font-medium">
                                                            {route.stationIds[0].name}
                                                        </span>
                                                        {!route.stationIds[0].isActive && (
                                                            <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 text-[10px] rounded">
                                                                Ngừng HĐ
                                                            </span>
                                                        )}
                                                    </div>
                                                    {route.stationIds.length > 2 && (
                                                        <>
                                                            <span className="text-neutral-400">→ ... →</span>
                                                            <div className="flex items-center gap-1">
                                                                <span className="text-red-600 font-medium">
                                                                    {route.stationIds[route.stationIds.length - 1].name}
                                                                </span>
                                                                {!route.stationIds[route.stationIds.length - 1].isActive && (
                                                                    <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 text-[10px] rounded">
                                                                        Ngừng HĐ
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </>
                                                    )}
                                                    {route.stationIds.length === 2 && (
                                                        <>
                                                            <span className="text-neutral-400">→</span>
                                                            <div className="flex items-center gap-1">
                                                                <span className="text-red-600 font-medium">
                                                                    {route.stationIds[1].name}
                                                                </span>
                                                                {!route.stationIds[1].isActive && (
                                                                    <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 text-[10px] rounded">
                                                                        Ngừng HĐ
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>

                                                {/* Warning if any station is inactive */}
                                                {route.stationIds.some((s: Station) => !s.isActive) && (
                                                    <div className="text-xs text-orange-600 flex items-center gap-1">
                                                        ⚠️ Có trạm ngừng hoạt động
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2">
                                        {route.isDeleted ? (
                                            <button
                                                onClick={() => handleRestoreClick(route._id, route.name)}
                                                className="px-3 py-1.5 text-sm font-medium text-green-600 hover:bg-green-50 rounded-lg transition"
                                            >
                                                ↻ Khôi phục
                                            </button>
                                        ) : (
                                            <Link
                                                href={`/admin/routes/${route._id}`}
                                                className="p-2 hover:bg-neutral-200 rounded-lg transition"
                                                title="Chỉnh sửa"
                                            >
                                                <Edit className="w-4 h-4 text-neutral-600" />
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-neutral-200">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-neutral-600">
                                Hiển thị {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredRoutes.length)} trong số {filteredRoutes.length} tuyến đường
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1.5 text-sm border border-neutral-300 rounded-lg hover:bg-neutral-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    ← Trước
                                </button>
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`w-8 h-8 text-sm rounded-lg transition ${currentPage === page
                                                    ? 'bg-black text-white'
                                                    : 'hover:bg-neutral-100 text-neutral-600'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1.5 text-sm border border-neutral-300 rounded-lg hover:bg-neutral-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Sau →
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Restore Confirmation Modal */}
            {showRestoreModal && restoreRoute && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <div className="flex items-start gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                <span className="text-2xl">↻</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-neutral-800 mb-2">
                                    Khôi phục tuyến đường
                                </h3>
                                <p className="text-sm text-neutral-600">
                                    Bạn có chắc chắn muốn khôi phục tuyến đường <strong>{restoreRoute.name}</strong> không?
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowRestoreModal(false);
                                    setRestoreRoute(null);
                                }}
                                className="flex-1 px-4 py-2.5 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                onClick={handleRestore}
                                className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                Khôi phục
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
