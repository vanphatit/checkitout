"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, Calendar, Edit, Clock, Filter, Bus, Users, Trash2 } from "lucide-react";
import { schedulingService } from "@/services/schedulingService";
import { Scheduling, SchedulingStats } from "@/types/scheduling";
import { toast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/useDebounce";

export default function SchedulingPage() {
    const [schedulings, setSchedulings] = useState<Scheduling[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearch = useDebounce(searchQuery, 500);
    const [statusFilter, setStatusFilter] = useState<string>("");
    const [sortBy, setSortBy] = useState<string>("departureDate");
    const [sortOrder, setSortOrder] = useState<string>("desc");
    const [showFilters, setShowFilters] = useState(false);
    const [showRestoreModal, setShowRestoreModal] = useState(false);
    const [restoreScheduling, setRestoreScheduling] = useState<{ id: string; name: string } | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const itemsPerPage = 10;

    const [stats, setStats] = useState<SchedulingStats>({
        total: 0,
        active: 0,
        inactive: 0,
        deleted: 0,
        scheduled: 0,
        inProgress: 0,
        completed: 0,
        cancelled: 0,
        delayed: 0
    });

    useEffect(() => {
        fetchStats();
        fetchSchedulings();
    }, [currentPage, debouncedSearch, statusFilter, sortBy, sortOrder]);

    const fetchStats = async () => {
        try {
            const data = await schedulingService.getStats();
            setStats(data);
        } catch (err) {
            console.error('Error fetching stats:', err);
        }
    };

    const fetchSchedulings = async () => {
        try {
            setLoading(true);
            const response = await schedulingService.getSchedulings({
                page: currentPage,
                limit: itemsPerPage,
                query: debouncedSearch || undefined,
                status: statusFilter || undefined,
                sortBy: sortBy,
                sortOrder: sortOrder as 'asc' | 'desc',
                includeDeleted: true
            });

            setSchedulings(response.data);
            setTotalPages(response.pagination.totalPages);
            setTotal(response.pagination.total);
        } catch (error) {
            console.error("Error fetching schedulings:", error);
            toast({
                variant: "destructive",
                title: "Lỗi",
                description: "Không thể tải danh sách lịch trình"
            });
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch, statusFilter, sortBy, sortOrder]);

    const handleRestoreClick = (schedulingId: string, routeName: string) => {
        setRestoreScheduling({ id: schedulingId, name: routeName });
        setShowRestoreModal(true);
    };

    const handleRestore = async () => {
        if (!restoreScheduling) return;

        try {
            await schedulingService.restoreScheduling(restoreScheduling.id);
            setShowRestoreModal(false);
            setRestoreScheduling(null);
            toast({
                title: "Thành công",
                description: "Khôi phục lịch trình thành công!"
            });
            fetchSchedulings();
            fetchStats();
        } catch (err) {
            console.error('Error restoring scheduling:', err);
            setShowRestoreModal(false);
            setRestoreScheduling(null);
            toast({
                variant: "destructive",
                title: "Lỗi",
                description: "Lỗi khi khôi phục lịch trình"
            });
        }
    };

    const getStatusBadge = (status: string) => {
        const badges = {
            'scheduled': 'bg-blue-100 text-blue-700',
            'in-progress': 'bg-yellow-100 text-yellow-700',
            'completed': 'bg-green-100 text-green-700',
            'cancelled': 'bg-red-100 text-red-700',
            'delayed': 'bg-orange-100 text-orange-700'
        };
        const labels = {
            'scheduled': 'Đã lên lịch',
            'in-progress': 'Đang chạy',
            'completed': 'Hoàn thành',
            'cancelled': 'Đã hủy',
            'delayed': 'Bị trễ'
        };
        return (
            <span className={`px-2 py-1 text-xs rounded-full ${badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-700'}`}>
                {labels[status as keyof typeof labels] || status}
            </span>
        );
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    if (loading && schedulings.length === 0) {
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
                    <h1 className="text-3xl font-bold text-neutral-800">Quản lý lịch trình</h1>
                    <p className="text-neutral-600 mt-1">Quản lý lịch trình xe buýt</p>
                </div>
                <Link
                    href="/admin/scheduling/new"
                    className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-neutral-800 transition"
                >
                    <Plus className="w-4 h-4" />
                    Thêm lịch trình
                </Link>
            </div>

            {/* Search Bar with Filters */}
            <div className="bg-white p-4 rounded-xl border border-neutral-200 space-y-4">
                <div className="flex items-center gap-4">
                    <div className="flex-1 relative">
                        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Tìm kiếm lịch trình..."
                            className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition ${showFilters || statusFilter
                            ? 'bg-blue-50 border-blue-500 text-blue-700'
                            : 'border-neutral-300 hover:bg-neutral-50'
                            }`}
                    >
                        <Filter className="w-4 h-4" />
                        Bộ lọc
                        {statusFilter && (
                            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                        )}
                    </button>
                </div>

                {/* Filters Panel */}
                {showFilters && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-neutral-200">
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">Trạng thái</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-3 py-1.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                            >
                                <option value="">Tất cả</option>
                                <option value="scheduled">Đã lên lịch</option>
                                <option value="in-progress">Đang chạy</option>
                                <option value="completed">Hoàn thành</option>
                                <option value="cancelled">Đã hủy</option>
                                <option value="delayed">Bị trễ</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">Sắp xếp theo</label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full px-3 py-1.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                            >
                                <option value="departureDate">Ngày khởi hành</option>
                                <option value="createdAt">Ngày tạo</option>
                                <option value="price">Giá vé</option>
                                <option value="availableSeats">Số chỗ trống</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">Thứ tự</label>
                            <select
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
                                className="w-full px-3 py-1.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                            >
                                {sortBy === 'price' ? (
                                    <>
                                        <option value="asc">Giá thấp → cao</option>
                                        <option value="desc">Giá cao → thấp</option>
                                    </>
                                ) : sortBy === 'availableSeats' ? (
                                    <>
                                        <option value="desc">Nhiều chỗ nhất</option>
                                        <option value="asc">Ít chỗ nhất</option>
                                    </>
                                ) : (
                                    <>
                                        <option value="desc">Mới nhất</option>
                                        <option value="asc">Cũ nhất</option>
                                    </>
                                )}
                            </select>
                        </div>
                        {(statusFilter || sortBy !== 'departureDate' || sortOrder !== 'desc') && (
                            <div className="md:col-span-3">
                                <button
                                    onClick={() => {
                                        setStatusFilter("");
                                        setSortBy("departureDate");
                                        setSortOrder("desc");
                                    }}
                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    Đặt lại bộ lọc
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-white p-4 rounded-xl border border-neutral-200">
                    <p className="text-sm text-neutral-600">Tổng số</p>
                    <p className="text-2xl font-bold text-neutral-800 mt-1">{stats.total}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-neutral-200">
                    <p className="text-sm text-neutral-600">Đã lên lịch</p>
                    <p className="text-2xl font-bold text-blue-600 mt-1">{stats.scheduled}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-neutral-200">
                    <p className="text-sm text-neutral-600">Đang chạy</p>
                    <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.inProgress}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-neutral-200">
                    <p className="text-sm text-neutral-600">Hoàn thành</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">{stats.completed}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-neutral-200">
                    <p className="text-sm text-neutral-600">Đã xóa</p>
                    <p className="text-2xl font-bold text-red-600 mt-1">{stats.deleted}</p>
                </div>
            </div>

            {/* Schedulings List */}
            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                {schedulings.length === 0 ? (
                    <div className="text-center py-12">
                        <Calendar className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                        <p className="text-neutral-600">
                            {searchQuery ? "Không tìm thấy lịch trình nào" : "Chưa có lịch trình nào"}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-neutral-200">
                        {schedulings.map((scheduling) => (
                            <div
                                key={scheduling._id}
                                className={`p-6 hover:bg-neutral-50 transition ${!scheduling.isActive ? 'opacity-60' : ''}`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-neutral-800">
                                                {scheduling.routeId.name}
                                            </h3>
                                            {getStatusBadge(scheduling.status)}
                                            {scheduling.isDeleted ? (
                                                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full flex items-center gap-1">
                                                    <Trash2 className="w-3 h-3" />
                                                    Đã xóa
                                                </span>
                                            ) : !scheduling.isActive ? (
                                                <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                                                    Ngừng hoạt động
                                                </span>
                                            ) : null}
                                        </div>

                                        {/* Scheduling Info */}
                                        <div className="flex items-center gap-6 text-sm text-neutral-600 mb-3">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                <span>{formatDate(scheduling.departureDate)}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4" />
                                                <span>{scheduling.etd}</span>
                                                {scheduling.eta && <span>→ {scheduling.eta}</span>}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Bus className="w-4 h-4" />
                                                <span>{scheduling.busIds.length} xe</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Users className="w-4 h-4" />
                                                <span>{scheduling.availableSeats}/{scheduling.totalSeats || scheduling.availableSeats} ghế</span>
                                            </div>
                                        </div>

                                        {/* Bus Info */}
                                        <div className="text-sm text-neutral-600">
                                            <span className="font-medium">Xe:</span>{' '}
                                            {scheduling.busIds.map((bus, idx) => (
                                                <span key={bus._id}>
                                                    {bus.plateNo}
                                                    {idx < scheduling.busIds.length - 1 && ', '}
                                                </span>
                                            ))}
                                        </div>

                                        {scheduling.driver && (
                                            <div className="text-sm text-neutral-600 mt-1">
                                                <span className="font-medium">Tài xế:</span> {scheduling.driver.name} - {scheduling.driver.phone}
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2">
                                        {scheduling.isDeleted ? (
                                            <button
                                                onClick={() => handleRestoreClick(scheduling._id, scheduling.routeId.name)}
                                                className="px-3 py-1.5 text-sm font-medium text-green-600 hover:bg-green-50 rounded-lg transition"
                                            >
                                                ↻ Khôi phục
                                            </button>
                                        ) : (
                                            <Link
                                                href={`/admin/scheduling/${scheduling._id}`}
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
                                Hiển thị {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, total)} trong số {total} lịch trình
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
                                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                        let pageNum;
                                        if (totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (currentPage <= 3) {
                                            pageNum = i + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = currentPage - 2 + i;
                                        }
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setCurrentPage(pageNum)}
                                                className={`w-8 h-8 text-sm rounded-lg transition ${currentPage === pageNum
                                                    ? 'bg-black text-white'
                                                    : 'hover:bg-neutral-100 text-neutral-600'
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
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
            {showRestoreModal && restoreScheduling && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <div className="flex items-start gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                <span className="text-2xl">↻</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-neutral-800 mb-2">
                                    Khôi phục lịch trình
                                </h3>
                                <p className="text-sm text-neutral-600">
                                    Bạn có chắc chắn muốn khôi phục lịch trình <strong>{restoreScheduling.name}</strong> không?
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowRestoreModal(false);
                                    setRestoreScheduling(null);
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
