'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Trash2, MapPin, User, Info, Bus as BusIcon } from 'lucide-react';
import { schedulingService } from '@/services/schedulingService';
import { routeService, RouteData } from '@/services/routeService';
import { busService } from '@/services/busService';
import { toast } from 'sonner';
import RouteMapWrapper from '@/components/map/RouteMapWrapper';
import type { Bus } from '@/types/bus';

export default function EditSchedulingPage() {
  const params = useParams();
  const router = useRouter();

  const [scheduling, setScheduling] = useState<any>(null);
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Form state
  const [selectedRouteId, setSelectedRouteId] = useState('');
  const [selectedBusIds, setSelectedBusIds] = useState<string[]>([]);
  const [departureDate, setDepartureDate] = useState('');
  const [etd, setEtd] = useState('');
  const [arrivalDate, setArrivalDate] = useState('');
  const [eta, setEta] = useState('');
  const [price, setPrice] = useState('');
  const [status, setStatus] = useState<'scheduled' | 'in-progress' | 'completed' | 'cancelled'>('scheduled');
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [driverLicense, setDriverLicense] = useState('');
  const [conductorName, setConductorName] = useState('');
  const [conductorPhone, setConductorPhone] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Load scheduling, routes, and buses in parallel
        const [schedulingData, routesData, busesResponse] = await Promise.all([
          schedulingService.getSchedulingById(params.id as string),
          routeService.getAllRoutes(),
          busService.getBuses({ limit: 100 })
        ]);

        const busesData = busesResponse.data;

        setScheduling(schedulingData);
        setRoutes(routesData);
        setBuses(busesData);

        // Populate form with existing data
        const routeId = typeof schedulingData.routeId === 'string'
          ? schedulingData.routeId
          : schedulingData.routeId?._id || '';
        setSelectedRouteId(routeId);
        setSelectedBusIds(schedulingData.busIds?.map((b: any) => b._id || b) || []);

        // Format dates for input[type="date"]
        const depDate = new Date(schedulingData.departureDate);
        setDepartureDate(depDate.toISOString().split('T')[0]);

        const arrDate = schedulingData.arrivalDate ? new Date(schedulingData.arrivalDate) : null;
        setArrivalDate(arrDate ? arrDate.toISOString().split('T')[0] : '');

        setEtd(schedulingData.etd || '');
        setEta(schedulingData.eta || '');
        setPrice(schedulingData.price?.toString() || '');
        const validStatuses = ['scheduled', 'in-progress', 'completed', 'cancelled'] as const;
        const currentStatus = schedulingData.status || 'scheduled';
        setStatus(validStatuses.includes(currentStatus as any) ? currentStatus as any : 'scheduled');

        setIsActive(schedulingData.isActive ?? true);
      } catch (error: any) {
        console.error('Error loading data:', error);
        toast.error(error.response?.data?.message || 'Không thể tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      loadData();
    }
  }, [params.id]);

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

      const updateData: any = {
        routeId: selectedRouteId,
        busIds: selectedBusIds,
        departureDate: new Date(departureDate).toISOString(),
        etd,
        arrivalDate: new Date(arrivalDate).toISOString(),
        eta,
        price: parseFloat(price),
        status,
        isActive,
      };

      await schedulingService.updateScheduling(params.id as string, updateData);
      toast.success('Cập nhật lịch trình thành công');
      router.push('/admin/scheduling');
    } catch (error: any) {
      console.error('Error updating scheduling:', error);
      toast.error(error.response?.data?.message || 'Không thể cập nhật lịch trình');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await schedulingService.deleteScheduling(params.id as string);
      toast.success('Xóa lịch trình thành công');
      router.push('/admin/scheduling');
    } catch (error: any) {
      console.error('Error deleting scheduling:', error);
      toast.error(error.response?.data?.message || 'Không thể xóa lịch trình');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
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
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/scheduling"
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Chỉnh Sửa Lịch Trình</h1>
              <p className="text-sm text-gray-500 mt-1">Cập nhật thông tin lịch trình</p>
            </div>
          </div>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Xóa lịch trình
          </button>
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
                {buses.map((bus) => (
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
                    Ngày đến
                  </label>
                  <input
                    type="date"
                    value={arrivalDate}
                    onChange={(e) => setArrivalDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giờ đến (ETA)
                  </label>
                  <input
                    type="time"
                    value={eta}
                    onChange={(e) => setEta(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trạng thái <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="scheduled">Đã lên lịch</option>
                    <option value="in-progress">Đang chạy</option>
                    <option value="completed">Hoàn thành</option>
                    <option value="cancelled">Đã hủy</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Step 4: Driver & Conductor Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                  4
                </div>
                <h2 className="text-lg font-semibold">Thông Tin Tài Xế & Phụ Xe</h2>
              </div>

              <div className="space-y-4">
                <div className="border-b pb-4">
                  <h3 className="font-medium mb-3">Tài Xế</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Họ tên
                      </label>
                      <input
                        type="text"
                        value={driverName}
                        onChange={(e) => setDriverName(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nguyễn Văn A"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Số điện thoại
                      </label>
                      <input
                        type="tel"
                        value={driverPhone}
                        onChange={(e) => setDriverPhone(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0912345678"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Số giấy phép lái xe
                      </label>
                      <input
                        type="text"
                        value={driverLicense}
                        onChange={(e) => setDriverLicense(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="B2"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Phụ Xe</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Họ tên
                      </label>
                      <input
                        type="text"
                        value={conductorName}
                        onChange={(e) => setConductorName(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nguyễn Văn B"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Số điện thoại
                      </label>
                      <input
                        type="tel"
                        value={conductorPhone}
                        onChange={(e) => setConductorPhone(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0987654321"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Status */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <div>
                  <div className="font-medium">Kích hoạt lịch trình</div>
                  <div className="text-sm text-gray-500">Lịch trình sẽ hiển thị cho khách hàng</div>
                </div>
              </label>
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
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Cập nhật lịch trình
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Xác nhận xóa</h3>
            <p className="text-gray-600 mb-6">
              Bạn có chắc chắn muốn xóa lịch trình này? Hành động này không thể hoàn tác.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {deleting ? 'Đang xóa...' : 'Xóa'}
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
