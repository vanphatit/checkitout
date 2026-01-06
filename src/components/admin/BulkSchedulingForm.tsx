'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, DollarSign, MapPin, Bus as BusIcon, CheckCircle2 } from 'lucide-react';
import { schedulingService } from '@/services/schedulingService';
import { routeService, RouteData } from '@/services/routeService';
import { busService } from '@/services/busService';
import { toast } from 'sonner';
import type { Bus } from '@/types/bus';

interface BulkSchedulingFormProps {
    onSuccess: () => void;
}

const WEEKDAYS = [
    { value: 'monday', label: 'Thứ 2' },
    { value: 'tuesday', label: 'Thứ 3' },
    { value: 'wednesday', label: 'Thứ 4' },
    { value: 'thursday', label: 'Thứ 5' },
    { value: 'friday', label: 'Thứ 6' },
    { value: 'saturday', label: 'Thứ 7' },
    { value: 'sunday', label: 'Chủ Nhật' },
];

export default function BulkSchedulingForm({ onSuccess }: BulkSchedulingFormProps) {
    const [routes, setRoutes] = useState<RouteData[]>([]);
    const [buses, setBuses] = useState<Bus[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form state
    const [selectedRouteId, setSelectedRouteId] = useState('');
    const [selectedBusIds, setSelectedBusIds] = useState<string[]>([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [recurringDays, setRecurringDays] = useState<string[]>([]);
    const [etd, setEtd] = useState('');
    const [price, setPrice] = useState('');
    const [note, setNote] = useState('');

    // Load routes and buses
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const [routesData, busesResponse] = await Promise.all([
                    routeService.getAllRoutes(),
                    busService.getBuses({ limit: 100 })
                ]);

                const busesData = busesResponse.data;
                setRoutes(routesData);
                setBuses(busesData);
            } catch (error: any) {
                console.error('Error loading data:', error);
                toast.error(error.response?.data?.message || 'Không thể tải dữ liệu');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    // Auto-fill ETD from selected route
    useEffect(() => {
        if (selectedRouteId && routes.length > 0) {
            const selectedRoute = routes.find(r => r._id === selectedRouteId);
            if (selectedRoute?.etd) {
                setEtd(selectedRoute.etd);
            }
        }
    }, [selectedRouteId, routes]);

    // Auto-suggest price based on route
    useEffect(() => {
        if (selectedRouteId && routes.length > 0) {
            const selectedRoute = routes.find(r => r._id === selectedRouteId);
            if (selectedRoute?.basePrice) {
                setPrice(selectedRoute.basePrice.toString());
            }
        }
    }, [selectedRouteId, routes]);

    const selectedRoute = routes.find(r => r._id === selectedRouteId);

    const handleBusSelection = (busId: string) => {
        setSelectedBusIds(prev =>
            prev.includes(busId) ? prev.filter(id => id !== busId) : [...prev, busId]
        );
    };

    const handleWeekdayToggle = (day: string) => {
        setRecurringDays(prev =>
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedRouteId || selectedBusIds.length === 0 || !startDate || !endDate || recurringDays.length === 0 || !etd || !price) {
            toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }

        if (new Date(endDate) < new Date(startDate)) {
            toast.error('Ngày kết thúc phải sau ngày bắt đầu');
            return;
        }

        try {
            setSaving(true);

            const createData = {
                routeId: selectedRouteId,
                busIds: selectedBusIds,
                etd,
                startDate,
                endDate,
                recurringDays,
                price: parseFloat(price),
                note: note || undefined,
            };

            const result = await schedulingService.createBulk(createData);

            toast.success(`Tạo thành công ${result.schedules.length} lịch trình`);

            // Show conflict warnings if any
            if (result.totalConflicts > 0) {
                setTimeout(() => {
                    toast.warning(
                        `Có ${result.totalConflicts} xe bị conflict trong ${result.conflictDetails.length} ngày`,
                        { duration: 5000 }
                    );
                }, 300);

                // Show details for first few conflicts
                result.conflictDetails.slice(0, 3).forEach((detail, index) => {
                    setTimeout(() => {
                        const conflictMsg = detail.conflicts
                            .map(c => `${c.plateNo}: ${c.message}`)
                            .join(', ');
                        toast.warning(
                            `Ngày ${detail.date}: ${conflictMsg}`,
                            { duration: 5000 }
                        );
                    }, (index + 2) * 300);
                });
            }

            onSuccess();
        } catch (error: any) {
            console.error('Error creating bulk scheduling:', error);
            toast.error(error.response?.data?.message || 'Không thể tạo lịch trình');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Route Selection */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold">Tuyến Đường</h3>
                </div>
                <select
                    value={selectedRouteId}
                    onChange={(e) => setSelectedRouteId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                >
                    <option value="">-- Chọn tuyến đường --</option>
                    {routes.map((route) => (
                        <option key={route._id} value={route._id}>
                            {route.name} - {route.distance}km - {Math.floor((route.estimatedDuration || 0) / 60)}h{(route.estimatedDuration || 0) % 60}m
                        </option>
                    ))}
                </select>
            </div>

            {/* Bus Selection */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <BusIcon className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold">Chọn Xe ({selectedBusIds.length})</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {buses.filter(bus => bus.status === 'AVAILABLE').map((bus) => (
                        <label
                            key={bus._id}
                            className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${selectedBusIds.includes(bus._id)
                                ? 'border-blue-600 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <input
                                type="checkbox"
                                checked={selectedBusIds.includes(bus._id)}
                                onChange={() => handleBusSelection(bus._id)}
                                className="w-4 h-4 text-blue-600"
                            />
                            <div className="flex-1 min-w-0">
                                <div className="font-medium truncate">{bus.busNo}</div>
                                <div className="text-xs text-gray-500 truncate">{bus.plateNo}</div>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            {/* Date Range & Recurring Days */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold">Khoảng Thời Gian & Ngày Lặp Lại</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ngày bắt đầu <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ngày kết thúc <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            min={startDate || new Date().toISOString().split('T')[0]}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Chọn ngày lặp lại <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                        {WEEKDAYS.map((day) => (
                            <button
                                key={day.value}
                                type="button"
                                onClick={() => handleWeekdayToggle(day.value)}
                                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${recurringDays.includes(day.value)
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                                    }`}
                            >
                                {day.label}
                            </button>
                        ))}
                    </div>
                    {recurringDays.length > 0 && (
                        <p className="mt-2 text-sm text-gray-600">
                            <CheckCircle2 className="w-4 h-4 inline mr-1 text-green-500" />
                            Sẽ tạo lịch trình cho: {recurringDays.map(d => WEEKDAYS.find(w => w.value === d)?.label).join(', ')}
                        </p>
                    )}
                </div>
            </div>

            {/* Time & Price */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold">Thời Gian & Giá Vé</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Giờ khởi hành (ETD) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="time"
                            value={etd}
                            onChange={(e) => setEtd(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                        {selectedRoute?.etd && (
                            <p className="mt-1 text-xs text-gray-500">
                                Tự động lấy từ route: {selectedRoute.etd}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Giờ đến dự kiến (ETA - preview)
                        </label>
                        <input
                            type="time"
                            value={selectedRoute && etd ? (() => {
                                const [hours, minutes] = etd.split(':').map(Number);
                                const totalMinutes = hours * 60 + minutes + (selectedRoute.estimatedDuration || 0);
                                const etaHours = Math.floor(totalMinutes / 60) % 24;
                                const etaMinutes = totalMinutes % 60;
                                return `${String(etaHours).padStart(2, '0')}:${String(etaMinutes).padStart(2, '0')}`;
                            })() : ''}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                            readOnly
                        />
                        {selectedRoute && etd && (
                            <p className="mt-1 text-xs text-gray-500">
                                Tự động tính từ ETD + {Math.floor((selectedRoute.estimatedDuration || 0) / 60)}h{(selectedRoute.estimatedDuration || 0) % 60}m
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Giá vé (VNĐ) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            min="0"
                            placeholder="250000"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                        {selectedRoute?.basePrice && (
                            <p className="mt-1 text-xs text-gray-500">
                                Giá đề xuất: {selectedRoute.basePrice.toLocaleString()} VNĐ
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Summary Preview */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-3">📋 Tóm tắt</h4>
                <ul className="space-y-2 text-sm text-blue-800">
                    <li>• Tuyến: {selectedRoute?.name || 'Chưa chọn'}</li>
                    <li>• Số xe: {selectedBusIds.length} xe</li>
                    <li>• Từ: {startDate ? new Date(startDate).toLocaleDateString('vi-VN') : 'Chưa chọn'} đến {endDate ? new Date(endDate).toLocaleDateString('vi-VN') : 'Chưa chọn'}</li>
                    <li>• Lặp lại: {recurringDays.length > 0 ? recurringDays.map(d => WEEKDAYS.find(w => w.value === d)?.label).join(', ') : 'Chưa chọn'}</li>
                    <li className="font-semibold text-blue-900 pt-2 border-t border-blue-200">
                        ⏱ Hệ thống sẽ tự động tạo lịch trình cho tất cả các ngày phù hợp trong khoảng thời gian này
                    </li>
                </ul>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
                <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 font-medium transition-colors"
                >
                    {saving ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Đang tạo...
                        </>
                    ) : (
                        <>
                            <CheckCircle2 className="w-5 h-5" />
                            Tạo Lịch Trình Hàng Loạt
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
