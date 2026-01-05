'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, MapPin, Info, Bus as BusIcon } from 'lucide-react';
import { schedulingService } from '@/services/schedulingService';
import { routeService, RouteData } from '@/services/routeService';
import { busService } from '@/services/busService';
import { toast } from 'sonner';
import RouteMapWrapper from '@/components/map/RouteMapWrapper';
import type { Bus } from '@/types/bus';

export default function NewSchedulingPage() {
  const router = useRouter();

  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [selectedRouteId, setSelectedRouteId] = useState('');
  const [selectedBusIds, setSelectedBusIds] = useState<string[]>([]);
  const [departureDate, setDepartureDate] = useState('');
  const [etd, setEtd] = useState('');
  const [arrivalDate, setArrivalDate] = useState('');
  const [eta, setEta] = useState('');
  const [price, setPrice] = useState('');

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

  // Auto-calculate ETA when route or etd changes
  useEffect(() => {
    if (selectedRouteId && etd && departureDate && routes.length > 0) {
      const selectedRoute = routes.find(r => r._id === selectedRouteId);
      if (selectedRoute?.estimatedDuration) {
        const [hours, minutes] = etd.split(':').map(Number);
        const totalMinutes = hours * 60 + minutes + selectedRoute.estimatedDuration;

        const etaHours = Math.floor(totalMinutes / 60) % 24;
        const etaMinutes = totalMinutes % 60;
        setEta(`${String(etaHours).padStart(2, '0')}:${String(etaMinutes).padStart(2, '0')}`);

        // Check if arrival is next day
        const daysToAdd = Math.floor((hours * 60 + minutes + selectedRoute.estimatedDuration) / 1440);
        if (daysToAdd > 0) {
          const depDate = new Date(departureDate);
          depDate.setDate(depDate.getDate() + daysToAdd);
          setArrivalDate(depDate.toISOString().split('T')[0]);
        } else {
          setArrivalDate(departureDate);
        }
      }
    }
  }, [selectedRouteId, etd, departureDate, routes]);

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
  const selectedBuses = buses.filter(b => selectedBusIds.includes(b._id));

  const handleBusSelection = (busId: string) => {
    setSelectedBusIds(prev =>
      prev.includes(busId) ? prev.filter(id => id !== busId) : [...prev, busId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRouteId || selectedBusIds.length === 0 || !departureDate || !etd || !price) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    try {
      setSaving(true);

      const createData: any = {
        routeId: selectedRouteId,
        busIds: selectedBusIds,
        departureDate: new Date(departureDate).toISOString(),
        etd,
        arrivalDate: new Date(arrivalDate).toISOString(),
        eta,
        price: parseFloat(price),
      };

      await schedulingService.createScheduling(createData);
      toast.success('Tạo lịch trình thành công');
      router.push('/admin/scheduling');
    } catch (error: any) {
      console.error('Error creating scheduling:', error);
      toast.error(error.response?.data?.message || 'Không thể tạo lịch trình');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <Link
            href="/admin/scheduling"
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tạo Lịch Trình Mới</h1>
            <p className="text-sm text-gray-500 mt-1">Thêm lịch trình cho xe khách</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Route Selection */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                  1
                </div>
                <h2 className="text-lg font-semibold">Chọn Tuyến Đường</h2>
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

            {/* Step 2: Bus Selection */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                  2
                </div>
                <h2 className="text-lg font-semibold">Chọn Xe</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {buses.filter(bus => bus.status === 'AVAILABLE').map((bus) => (
                  <label
                    key={bus._id}
                    className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all ${selectedBusIds.includes(bus._id)
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
                    <div className="flex-1">
                      <div className="font-medium">{bus.busNo}</div>
                      <div className="text-sm text-gray-500">{bus.plateNo} - {bus.type}</div>
                      {bus.driverName && (
                        <div className="text-xs text-gray-400 mt-1">Tài xế: {bus.driverName}</div>
                      )}
                    </div>
                  </label>
                ))}
              </div>

              {buses.filter(bus => bus.status === 'AVAILABLE').length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Không có xe nào khả dụng
                </div>
              )}
            </div>

            {/* Step 3: Schedule Details */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                  3
                </div>
                <h2 className="text-lg font-semibold">Chi Tiết Lịch Trình</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày khởi hành <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

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
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày đến (tự động)
                  </label>
                  <input
                    type="date"
                    value={arrivalDate}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giờ đến (ETA - tự động)
                  </label>
                  <input
                    type="time"
                    value={eta}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giá vé (VNĐ) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                    min="0"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Tạo lịch trình
                  </>
                )}
              </button>
              <Link
                href="/admin/scheduling"
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Hủy
              </Link>
            </div>
          </div>

          {/* Right Column - Preview */}
          <div className="space-y-6">
            {/* Route Map - Always visible */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                Bản đồ tuyến đường
              </h3>
              {selectedRoute ? (
                <>
                  <div className="h-96 bg-gray-100 rounded-lg overflow-hidden mb-4">
                    <RouteMapWrapper stations={selectedRoute.stationIds} />
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Khoảng cách:</span>
                      <span className="font-medium">{selectedRoute.distance} km</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Thời gian ước tính:</span>
                      <span className="font-medium">
                        {Math.floor((selectedRoute.estimatedDuration || 0) / 60)}h{(selectedRoute.estimatedDuration || 0) % 60}m
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Giá cơ bản:</span>
                      <span className="font-medium">{selectedRoute.basePrice?.toLocaleString()} VNĐ</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-96 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Chọn tuyến đường để xem bản đồ</p>
                  </div>
                </div>
              )}
            </div>

            {/* Selected Buses Summary - Always visible */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <BusIcon className="w-5 h-5 text-blue-600" />
                Xe đã chọn ({selectedBuses.length})
              </h3>
              {selectedBuses.length > 0 ? (
                <div className="space-y-3">
                  {selectedBuses.map((bus) => (
                    <div key={bus._id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="font-medium">{bus.busNo}</div>
                      <div className="text-sm text-gray-600">{bus.plateNo}</div>
                      <div className="text-sm text-gray-500">{bus.type} - {bus.vacancy} chỗ</div>
                      {bus.driverName && (
                        <div className="text-xs text-gray-400 mt-1">Tài xế: {bus.driverName}</div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-gray-400">
                  <BusIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Chưa chọn xe nào</p>
                </div>
              )}
            </div>

            {/* Summary Info */}
            {selectedRoute && selectedBuses.length > 0 && (
              <div className="bg-blue-50 rounded-xl p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-600" />
                  Tóm tắt
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tuyến đường:</span>
                    <span className="font-medium">{selectedRoute.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Số xe:</span>
                    <span className="font-medium">{selectedBuses.length} xe</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tổng chỗ ngồi:</span>
                    <span className="font-medium">
                      {selectedBuses.reduce((sum, bus) => sum + (bus.vacancy || 0), 0)} chỗ
                    </span>
                  </div>
                  {etd && eta && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Thời gian:</span>
                      <span className="font-medium">{etd} → {eta}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
