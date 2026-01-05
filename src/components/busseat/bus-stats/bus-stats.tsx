// src/components/busseat/bus-stats/bus-stats.tsx
import { FiTruck, FiCheckCircle, FiXCircle } from "react-icons/fi";
import { BusStatistics } from "@/services/busService";

export default function BusStats({ data }: { data: BusStatistics }) {
  const statsConfig = [
    {
      label: "Total Buses",
      value: data.total || 0,
      desc: "Tổng quy mô đội xe",
      icon: <FiTruck />,
      styles: "bg-blue-50 text-blue-600 border-blue-100",
    },
    {
      label: "Active",
      value: data.active || 0,
      desc: "Xe đang hoạt động",
      icon: <FiCheckCircle />,
      styles: "bg-emerald-50 text-emerald-600 border-emerald-100",
    },
    {
      label: "Inactive",
      value: data.inactive || 0,
      desc: "Xe đang tạm ngưng",
      icon: <FiXCircle />,
      styles: "bg-rose-50 text-rose-600 border-rose-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {statsConfig.map((stat) => (
        <div
          key={stat.label}
          className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex justify-between items-start"
        >
          <div>
            <p className="text-slate-400 text-[11px] font-black uppercase tracking-wider">
              {stat.label}
            </p>
            <h3 className="text-3xl font-black text-slate-900 mt-2">
              {stat.value}
            </h3>
            <p className="text-slate-400 text-xs mt-2 font-medium">
              {stat.desc}
            </p>
          </div>
          <div className={`p-3 rounded-xl border ${stat.styles}`}>
            <span className="text-xl">{stat.icon}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
