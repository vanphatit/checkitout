"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { FaWifi } from "react-icons/fa";
import { GiCharging, GiWaterBottle } from "react-icons/gi";
import { IoTv } from "react-icons/io5";
import { getCurrentDate } from "@/lib/formatters";

interface TopSearchProps {
  routeFrom: string;
  routeTo: string;
  timeDuration: string;
  price: string;
}

const TopSearchCard: React.FC<TopSearchProps> = ({
  routeFrom,
  routeTo,
  timeDuration,
  price,
}) => {
  const router = useRouter();

  const handleReserve = () => {
    const params = new URLSearchParams();
    params.append("from", routeFrom);
    params.append("to", routeTo);
    params.append("date", getCurrentDate());
    router.push(`/scheduling?${params.toString()}`);
  };

  return (
    <div className="w-full rounded-xl p-5 border-2 border-neutral-300 space-y-10 dark:bg-neutral-800 dark:border-neutral-700">
      <div className="space-y-3.5 w-full">
        <div className="space-y-0">
          <div className="w-full flex items-center justify-between">
            <p className="text-xs text-neutral-400 font-normal">From</p>
            <p className="text-xs text-neutral-400 font-normal">To</p>
          </div>
          <div className="w-full flex items-center justify-between gap-x-3">
            <h3 className="text-xl text-neutral-600 font-semibold truncate max-w-[100px]">{routeFrom}</h3>
            <div className="flex-1 border-dashed border border-neutral-400 relative min-w-[80px]">
              <p className="absolute w-fit px-3 h-6 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-neutral-50 rounded-full flex items-center justify-center text-sm text-neutral-500 font-normal border-dashed border border-neutral-400 whitespace-nowrap">
                {timeDuration}
              </p>
            </div>
            <h3 className="text-xl text-neutral-600 font-semibold truncate max-w-[100px]">{routeTo}</h3>
          </div>
        </div>

        <div className="w-full flex items-center gap-3 flex-wrap">
          {[
            { label: "internet", Icon: FaWifi },
            { label: "snacks", Icon: GiWaterBottle },
            { label: "TV", Icon: IoTv },
            { label: "charging", Icon: GiCharging },
          ].map(({ label, Icon }) => (
            <div key={label} className="flex items-center gap-x-1">
              <Icon className="w-3 h-3 text-neutral-500" />
              <p className="text-xs text-neutral-600 font-normal">{label}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="w-full flex items-center justify-between">
        <h3 className="text-xl text-neutral-700 dark:text-neutral-200 font-semibold">
          {price}
        </h3>
        <button
          onClick={handleReserve}
          className="w-fit px-5 py-1.5 bg-primary dark:bg-secondary hover:bg-transparent dark:hover:bg-primary border-2 border-primary dark:border-secondary hover:border-primary dark:hover:border-secondary rounded-xl text-base font-normal text-neutral-50 dark:text-primary flex items-center justify-center gap-x-2 hover:text-primary dark:hover:text-white ease-in-out duration-300"
        >
          Reserve Seat
        </button>
      </div>
    </div>
  );
};

export default TopSearchCard;
