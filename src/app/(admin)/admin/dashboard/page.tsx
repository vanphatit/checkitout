"use client";

import { useEffect, useState } from "react";
import {
    DollarSign,
    Ticket,
    Bus,
    Users,
    Calendar,
    TrendingUp,
    BarChart3,
    Circle,
    PlayCircle,
    CheckCircle,
    XCircle
} from "lucide-react";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    AreaChart,
    Area,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from "recharts";
import { RoleGuard } from "@/components/providers/RoleGuard";
import { StatCard } from "@/components/admin/StatCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { statisticsService, type OverviewStats, type RevenueTrendData, type TopRouteData, type TicketStatusDistribution, type SchedulingStatusDistribution, type SchedulingSummary, type BusTodayData, type OccupancyTrendData, type SchedulingDetailToday } from "@/services/statisticsService";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Colors for charts
const COLORS = {
    primary: '#3b82f6',
    success: '#22c55e',
    warning: '#eab308',
    danger: '#ef4444',
    info: '#06b6d4',
    purple: '#a855f7',
};

const TICKET_STATUS_COLORS = {
    PENDING: COLORS.warning,
    CONFIRMED: COLORS.success,
    CANCELLED: COLORS.danger,
    COMPLETED: COLORS.info, SUCCESS: COLORS.primary,
    FAILED: COLORS.danger,
    TRANSFER: COLORS.purple,
};

const SCHEDULING_STATUS_COLORS = {
    SCHEDULED: COLORS.info,
    RUNNING: COLORS.success,
    COMPLETED: COLORS.primary,
    CANCELLED: COLORS.danger,
};

export default function AdminDashboardPage() {
    const [overview, setOverview] = useState<OverviewStats | null>(null);
    const [revenueTrend, setRevenueTrend] = useState<RevenueTrendData[]>([]);
    const [topRoutes, setTopRoutes] = useState<TopRouteData[]>([]);
    const [ticketStatus, setTicketStatus] = useState<TicketStatusDistribution>({});
    const [schedulingStatus, setSchedulingStatus] = useState<SchedulingStatusDistribution>({
        SCHEDULED: 0,
        RUNNING: 0,
        COMPLETED: 0,
        CANCELLED: 0
    });
    const [schedulingSummary, setSchedulingSummary] = useState<SchedulingSummary | null>(null);
    const [busesToday, setBusesToday] = useState<BusTodayData[]>([]);
    const [occupancyTrend, setOccupancyTrend] = useState<OccupancyTrendData[]>([]);
    const [schedulingDetails, setSchedulingDetails] = useState<SchedulingDetailToday[]>([]);
    const [period, setPeriod] = useState<'7d' | '30d' | '12m'>('7d');
    const [loading, setLoading] = useState(true);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const [
                overviewData,
                revenueData,
                routesData,
                ticketData,
                schedulingData,
                summaryData,
                busesData,
                occupancyData,
                schedulingDetailsData
            ] = await Promise.all([
                statisticsService.getOverview(),
                statisticsService.getRevenueTrend(period),
                statisticsService.getTopRoutes(10),
                statisticsService.getTicketStatusDistribution(),
                statisticsService.getSchedulingStatusToday(),
                statisticsService.getTodaySchedulingSummary(),
                statisticsService.getBusesToday(),
                statisticsService.getOccupancyTrend(7),
                statisticsService.getSchedulingDetailsToday()
            ]);

            setOverview(overviewData);
            setRevenueTrend(revenueData);
            setTopRoutes(routesData);
            setTicketStatus(ticketData);
            setSchedulingStatus(schedulingData);
            setSchedulingSummary(summaryData);
            setBusesToday(busesData);
            setOccupancyTrend(occupancyData);
            setSchedulingDetails(schedulingDetailsData);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Không thể tải dữ liệu dashboard');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboardData();
    }, [period]);

    // Transform data for pie charts
    const ticketStatusData = Object.entries(ticketStatus).map(([name, value]) => ({
        name,
        value
    }));

    const SCHEDULING_STATUS_NORMALIZE: Record<string, string> = {
        'scheduled': 'SCHEDULED',
        'in-progress': 'RUNNING',
        'running': 'RUNNING',
        'completed': 'COMPLETED',
        'cancelled': 'CANCELLED',
    };

    const schedulingStatusData = Object.entries(schedulingStatus).map(
        ([name, value]) => ({
            name: SCHEDULING_STATUS_NORMALIZE[name] ?? name.toUpperCase(),
            value,
        })
    );

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(value);
    };

    const formatNumber = (value: number) => {
        return new Intl.NumberFormat('vi-VN').format(value);
    };

    if (loading) {
        return (
            <RoleGuard allowedRoles={['ADMIN']}>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <BarChart3 className="h-12 w-12 animate-pulse mx-auto mb-4 text-primary" />
                        <p className="text-muted-foreground">Đang tải dashboard...</p>
                    </div>
                </div>
            </RoleGuard>
        );
    }

    return (
        <RoleGuard allowedRoles={['ADMIN']}>
            <div className="container mx-auto p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                        <p className="text-muted-foreground">
                            Tổng quan hoạt động hệ thống
                        </p>
                    </div>
                    <Button onClick={loadDashboardData} variant="outline">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Làm mới
                    </Button>
                </div>

                {/* Overview Stats */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Doanh thu hôm nay"
                        value={overview ? formatCurrency(overview.todayRevenue) : '0 ₫'}
                        icon={DollarSign}
                        description="Tổng doanh thu trong ngày"
                    />
                    <StatCard
                        title="Vé đã bán"
                        value={overview ? formatNumber(overview.todayTickets) : 0}
                        icon={Ticket}
                        description="Số vé bán ra hôm nay"
                    />
                    <StatCard
                        title="Chuyến đi hôm nay"
                        value={overview ? formatNumber(overview.activeSchedulings) : 0}
                        icon={Bus}
                        description="Tổng số chuyến trong ngày"
                    />
                    <StatCard
                        title="Người dùng mới"
                        value={overview ? formatNumber(overview.newUsers) : 0}
                        icon={Users}
                        description="Đăng ký trong tháng này"
                    />
                </div>

                {/* Period Selector for Revenue */}
                <div className="flex items-center gap-2">
                    <Button
                        variant={period === '7d' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPeriod('7d')}
                    >
                        7 ngày
                    </Button>
                    <Button
                        variant={period === '30d' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPeriod('30d')}
                    >
                        30 ngày
                    </Button>
                    <Button
                        variant={period === '12m' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPeriod('12m')}
                    >
                        12 tháng
                    </Button>
                </div>

                {/* Revenue Trend - Full Width */}
                <Card>
                    <CardHeader>
                        <CardTitle>Biểu đồ doanh thu</CardTitle>
                        <CardDescription>Xu hướng doanh thu theo thời gian</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {revenueTrend.length === 0 ? (
                            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                                <div className="text-center">
                                    <DollarSign className="h-12 w-12 mx-auto mb-2 opacity-20" />
                                    <p className="text-sm">Chưa có dữ liệu doanh thu</p>
                                </div>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={revenueTrend}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis tickFormatter={(value) => `${value / 1000}k`} />
                                    <Tooltip formatter={(value) => formatCurrency(Number(value) || 0)} />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke={COLORS.primary}
                                        strokeWidth={2}
                                        name="Doanh thu"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                {/* Top Routes - Full Width */}
                <Card>
                    <CardHeader>
                        <CardTitle>Top tuyến đường</CardTitle>
                        <CardDescription>10 tuyến đường doanh thu cao nhất</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {topRoutes.length === 0 ? (
                            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                                <div className="text-center">
                                    <Bus className="h-12 w-12 mx-auto mb-2 opacity-20" />
                                    <p className="text-sm">Chưa có dữ liệu tuyến đường</p>
                                </div>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart
                                    data={topRoutes.map(route => {
                                        // Extract station names and create abbreviations
                                        const stations = route.routeName
                                            .replace(/Trạm\s+/g, '')
                                            .split(/\s+-\s+/);
                                        const shortName = stations.map(station => 
                                            station.split(' ')
                                                .map(word => word.charAt(0).toUpperCase())
                                                .join('')
                                        ).join('→');
                                        
                                        return {
                                            ...route,
                                            shortName,
                                            fullName: route.routeName
                                        };
                                    })}
                                    margin={{ bottom: 40 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="shortName"
                                        height={50}
                                        tick={{ fontSize: 12 }}
                                        interval={0}
                                    />
                                    <YAxis tickFormatter={(value) => `${value / 1000000}tr`} />
                                    <Tooltip
                                        formatter={(value) => formatCurrency(Number(value) || 0)}
                                        labelFormatter={(label, payload) => {
                                            const item = payload?.[0]?.payload;
                                            return item?.fullName || label;
                                        }}
                                    />
                                    <Legend />
                                    <Bar dataKey="revenue" fill={COLORS.success} name="Doanh thu" />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                {/* Charts Row 2: Ticket Status & Scheduling Status */}
                <div className="grid gap-4 md:grid-cols-2">
                    {/* Ticket Status Pie Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Trạng thái vé</CardTitle>
                            <CardDescription>Phân bố trạng thái vé hiện tại</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={ticketStatusData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {ticketStatusData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={TICKET_STATUS_COLORS[entry.name as keyof typeof TICKET_STATUS_COLORS] || COLORS.primary}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Scheduling Status Today */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Lịch trình hôm nay</CardTitle>
                            <CardDescription>Trạng thái các chuyến đi trong ngày</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={schedulingStatusData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                        innerRadius={40}
                                    >
                                        {schedulingStatusData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={
                                                    SCHEDULING_STATUS_COLORS[
                                                    entry.name.toUpperCase() as keyof typeof SCHEDULING_STATUS_COLORS
                                                    ] || COLORS.primary
                                                }
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Row 3: Buses Today & Occupancy Trend */}
                <div className="grid gap-4 md:grid-cols-2">
                    {/* Buses Operating Today */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Xe hoạt động hôm nay</CardTitle>
                            <CardDescription>Số chuyến của mỗi xe trong ngày</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={busesToday}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="licensePlate" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="schedulingCount" fill={COLORS.purple} name="Số chuyến" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Seat Occupancy Trend */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Tỷ lệ lấp đầy ghế</CardTitle>
                            <CardDescription>Xu hướng lấp đầy ghế 7 ngày qua</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={occupancyTrend}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis tickFormatter={(value) => `${value}%`} />
                                    <Tooltip formatter={(value) => `${Number(value || 0).toFixed(2)}%`} />
                                    <Legend />
                                    <Area
                                        type="monotone"
                                        dataKey="occupancy"
                                        stroke={COLORS.info}
                                        fill={COLORS.info}
                                        fillOpacity={0.6}
                                        name="Tỷ lệ lấp đầy"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Summary Stats */}
                <Card>
                    <CardHeader>
                        <CardTitle>Thống kê chi tiết</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">Tổng lịch trình hôm nay</p>
                                <p className="text-2xl font-bold">
                                    {schedulingSummary?.total || 0}
                                </p>
                                <div className="space-y-1 text-xs">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="flex items-center gap-1 text-cyan-600">
                                            <Circle className="h-3 w-3 fill-current" />
                                            Đã lên lịch:
                                        </span>
                                        <span className="font-medium">{schedulingSummary?.scheduled || 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="flex items-center gap-1 text-green-600">
                                            <PlayCircle className="h-3 w-3 fill-current" />
                                            Đang chạy:
                                        </span>
                                        <span className="font-medium">{schedulingSummary?.['in-progress'] || 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="flex items-center gap-1 text-blue-600">
                                            <CheckCircle className="h-3 w-3 fill-current" />
                                            Hoàn thành:
                                        </span>
                                        <span className="font-medium">{schedulingSummary?.completed || 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="flex items-center gap-1 text-red-600">
                                            <XCircle className="h-3 w-3 fill-current" />
                                            Đã hủy:
                                        </span>
                                        <span className="font-medium">{schedulingSummary?.cancelled || 0}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">Tổng số xe hoạt động</p>
                                <p className="text-2xl font-bold">{busesToday.length}</p>
                                <p className="text-xs text-muted-foreground">
                                    Trung bình {busesToday.length > 0
                                        ? (busesToday.reduce((sum, bus) => sum + bus.schedulingCount, 0) / busesToday.length).toFixed(1)
                                        : 0} chuyến/xe
                                </p>
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">Tuyến đường hàng đầu</p>
                                <p className="text-2xl font-bold">{topRoutes[0]?.routeName || 'N/A'}</p>
                                <p className="text-xs text-muted-foreground">
                                    {topRoutes[0] ? formatCurrency(topRoutes[0].revenue) : 'Chưa có dữ liệu'}
                                </p>
                            </div>
                        </div>
                    </CardContent >
                </Card >

                {/* Scheduling Details Table */}
                < Card >
                    <CardHeader>
                        <CardTitle>Chi tiết lịch trình hôm nay</CardTitle>
                        <CardDescription>
                            Danh sách các chuyến xe hôm nay với thông tin xe và tuyến đường
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Giờ khởi hành</TableHead>
                                        <TableHead>Tuyến đường</TableHead>
                                        <TableHead>Xe</TableHead>
                                        <TableHead>Trạng thái</TableHead>
                                        <TableHead className="text-right">Ghế trống</TableHead>
                                        <TableHead className="text-right">Lấp đầy</TableHead>
                                        <TableHead className="text-right">Giá vé</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {schedulingDetails.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center text-muted-foreground">
                                                Không có chuyến xe nào hôm nay
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        schedulingDetails.map((scheduling) => (
                                            <TableRow key={scheduling._id}>
                                                <TableCell className="font-medium">
                                                    {scheduling.departureTime}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <div className="font-medium">{scheduling.route.name}</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {scheduling.route.originStation} → {scheduling.route.destinationStation}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {scheduling.route.distance}km · {(scheduling.route.estimatedDuration / 60).toFixed(1)}h
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        {scheduling.buses.map((bus, idx) => (
                                                            <div key={bus._id}>
                                                                <div className="font-medium text-sm">{bus.name || 'N/A'}</div>
                                                                <div className="text-xs text-muted-foreground">
                                                                    {bus.licensePlate || 'N/A'} · {bus.type} · {bus.capacity || 0} chỗ
                                                                </div>
                                                            </div>
                                                        ))}
                                                        {scheduling.buses.length === 0 && (
                                                            <span className="text-xs text-red-500">Chưa có xe</span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {scheduling.status ? (
                                                        <Badge
                                                            variant={
                                                                scheduling.status.toUpperCase() === 'RUNNING' || scheduling.status.toUpperCase() === 'IN-PROGRESS' ? 'default' :
                                                                    scheduling.status.toUpperCase() === 'COMPLETED' ? 'secondary' :
                                                                        scheduling.status.toUpperCase() === 'CANCELLED' ? 'destructive' :
                                                                            'outline'
                                                            }
                                                            className="gap-1"
                                                        >
                                                            {scheduling.status.toUpperCase() === 'SCHEDULED' && (
                                                                <>
                                                                    <Calendar className="h-3 w-3" />
                                                                    Đã lên lịch
                                                                </>
                                                            )}
                                                            {(scheduling.status.toUpperCase() === 'RUNNING' || scheduling.status.toUpperCase() === 'IN-PROGRESS') && (
                                                                <>
                                                                    <Bus className="h-3 w-3" />
                                                                    Đang chạy
                                                                </>
                                                            )}
                                                            {scheduling.status.toUpperCase() === 'COMPLETED' && (
                                                                <>
                                                                    <CheckCircle className="h-3 w-3" />
                                                                    Hoàn thành
                                                                </>
                                                            )}
                                                            {scheduling.status.toUpperCase() === 'CANCELLED' && (
                                                                <>
                                                                    <XCircle className="h-3 w-3" />
                                                                    Đã hủy
                                                                </>
                                                            )}
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline">Không rõ</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <span className={scheduling.availableSeats < 5 ? 'text-red-500 font-semibold' : ''}>
                                                        {scheduling.availableSeats}/{scheduling.totalSeats}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <span className={parseFloat(scheduling.occupancyRate) > 80 ? 'text-green-600 font-semibold' : ''}>
                                                        {scheduling.occupancyRate}%
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right font-medium">
                                                    {formatCurrency(scheduling.price)}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card >
            </div >
        </RoleGuard >
    );
}
