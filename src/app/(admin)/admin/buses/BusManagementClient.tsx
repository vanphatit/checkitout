"use client";
import { useEffect, useState } from "react";
import BusStats from "@/components/busseat/bus-stats/bus-stats";
import CreateBusModal from "@/components/busseat/form/CreateBusModal";
import EditBusModal from "@/components/busseat/form/EditBusModal";
import { busService } from "@/services/busService";
import { Bus } from "@/types/bus";
import Link from "next/link";
import {
  FiRefreshCw,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiSearch,
  FiFilter,
} from "react-icons/fi";

type Props = {
  page: number;
  search: string;
  status: string;
};

export default function BusManagementClient({ page, search, status }: Props) {
  const [response, setResponse] = useState<any>(null);
  const [statsData, setStatsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const currentPage = page || 1;
  const searchTerm = search || "";
  const statusFilter = status || "";

  useEffect(() => {
    setLoading(true);

    Promise.all([
      busService.getBuses({
        page: currentPage,
        limit: 10,
        search: searchTerm,
        status: statusFilter,
      }),
      busService.getBusStatistics(),
    ])
      .then(([res, stats]) => {
        setResponse(res);
        setStatsData(stats);
      })
      .finally(() => setLoading(false));
  }, [currentPage, searchTerm, statusFilter]);

  if (loading) {
    return <div className="p-10">Loading...</div>;
  }

  const busData: Bus[] = response?.data || [];
  const totalPages = response?.totalPages || 1;

  return (
    <div>
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h2 className="text-4xl font-black">
            Quản lý xe
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/buses"
            className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
          >
            <FiRefreshCw className="w-5 h-5 text-slate-600" />
          </Link>
          <CreateBusModal />
        </div>
      </div>

      <BusStats data={statsData} />

      {/* --- SEARCH & FILTER TOOLBAR --- */}
      <div className="mt-8 mb-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <form className="relative w-full md:w-96 group">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          <input
            type="text"
            name="search"
            defaultValue={searchTerm}
            placeholder="Tìm theo biển số, tài xế..."
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-400 transition-all shadow-sm"
          />
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2 ml-1 flex items-center gap-1">
            <FiFilter /> Filter:
          </span>
          {["ALL", "AVAILABLE", "UNAVAILABLE"].map((status) => (
            <Link
              key={status}
              href={`?status=${status === "ALL" ? "" : status}`}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all border whitespace-nowrap
                ${
                  statusFilter === status || (status === "ALL" && !statusFilter)
                    ? "bg-slate-900 text-white border-slate-900 shadow-md"
                    : "bg-white text-slate-500 border-slate-200 hover:border-slate-400"
                }`}
            >
              {status === "ALL"
                ? "Tất cả"
                : status === "AVAILABLE"
                ? "Đang chạy"
                : "Ngưng hoạt động"}
            </Link>
          ))}
        </div>
      </div>

      {/* --- DATA TABLE --- */}
      <div className="bg-white border border-slate-200 rounded-[24px] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="p-5 text-[11px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  Biển số xe
                </th>
                <th className="p-5 text-[11px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  Loại và chỗ ngồi
                </th>
                <th className="p-5 text-[11px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 text-center">
                  Trạng thái hoạt động
                </th>
                <th className="p-5 text-[11px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 text-right">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {busData.length > 0 ? (
                busData.map((bus: Bus) => (
                  <tr
                    key={bus._id}
                    className="group hover:bg-blue-50/30 transition-all duration-200"
                  >
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xs">
                          BUS
                        </div>
                        <div className="flex flex-col">
                          <span className="text-base font-bold text-slate-900">
                            {bus.plateNo}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">
                            ID: {bus._id.slice(-6)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-slate-700">
                          {bus.type}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <div className="flex -space-x-1">
                            {[...Array(3)].map((_, i) => (
                              <div
                                key={i}
                                className="w-4 h-4 rounded-full border-2 border-white bg-slate-200"
                              />
                            ))}
                          </div>
                          <span className="text-xs text-slate-400 font-medium">
                            {bus.seats.length} seats available
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex justify-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border
                          ${
                            bus.status === "AVAILABLE"
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                              : bus.status === "UNAVAILABLE"
                              ? "bg-rose-50 text-rose-600 border-rose-100"
                              : "bg-amber-50 text-amber-600 border-amber-100"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              bus.status === "AVAILABLE"
                                ? "bg-emerald-500 animate-pulse"
                                : bus.status === "UNAVAILABLE"
                                ? "bg-rose-500"
                                : "bg-amber-500"
                            }`}
                          />
                          {bus.status}
                        </span>
                      </div>
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <EditBusModal bus={bus} />
                        <button className="p-2.5 hover:bg-rose-50 rounded-xl border border-transparent hover:border-rose-100 text-slate-400 hover:text-rose-600 transition-all">
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 text-3xl">
                        📭
                      </div>
                      <p className="text-slate-400 uppercase tracking-widest text-xs">
                        No records found
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-5 flex items-center justify-between bg-slate-50/50 border-t border-slate-100">
          <span className="text-xs text-slate-400 uppercase tracking-widest">
            Page {currentPage} of {totalPages}
          </span>

          <nav className="flex items-center gap-2">
            <Link
              href={`?page=${
                currentPage > 1 ? currentPage - 1 : 1
              }&search=${searchTerm}&status=${statusFilter}`}
              className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-all ${
                currentPage <= 1
                  ? "opacity-30 pointer-events-none"
                  : "bg-white hover:border-slate-900 shadow-sm"
              }`}
            >
              <FiChevronLeft />
            </Link>

            <Link
              href={`?page=${
                currentPage < totalPages ? currentPage + 1 : totalPages
              }&search=${searchTerm}&status=${statusFilter}`}
              className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-all ${
                currentPage >= totalPages
                  ? "opacity-30 pointer-events-none"
                  : "bg-white hover:border-slate-900 shadow-sm"
              }`}
            >
              <FiChevronRight />
            </Link>
          </nav>
        </div>
      </div>
    </div>
  );
}
