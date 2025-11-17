import React from "react";
import { FaWifi } from "react-icons/fa";
import { GiCharging, GiWaterBottle } from "react-icons/gi";
import { IoTv } from "react-icons/io5";

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
  return (
    <div className="w-full rounded-xl p-5 border-2 border-neutral-300 space-y-10 dark:bg-neutral-800 dark:border-neutral-700">
      <div className="space-y-3.5 w-full">
        {/* Route */}
        <div className="space-y-0">
          <div className="w-full flex items-center justify-between">
            <p className="text-xs text-neutral-400 font-normal">From</p>
            <p className="text-xs text-neutral-400 font-normal">To</p>
          </div>
          <div className="w-full flex items-center justify-between gap-x-3">
            {/* From */}
            <h1 className="text-xl text-neutral-600 font-semibold">
              {routeFrom}
            </h1>
            {/*  Time Duration */}
            <div className="flex-1 border-dashed border border-neutral-400 relative">
              <p className="absolute w-fit px-3 h-6 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-neutral-50 rounded-full flex items-center justify-center text-sm text-neutral-500 font-normal border-dashed border border-neutral-400">
                {timeDuration}
              </p>
            </div>
            {/* To */}
            <h1 className="text-xl text-neutral-600 font-semibold">
              {routeTo}
            </h1>
          </div>
        </div>

        {/* Facilities */}
        <div className="w-full flex items-center gap-3 flex-wrap">
          {/* First One */}
          <div className="flex items-center gap-x-1">
            <FaWifi className="w-3 h-3 text-neutral-500" />
            <p className="text-xs text-neutral-600 font-normal">internet</p>
          </div>
          {/* Second One */}
          <div className="flex items-center gap-x-1">
            <GiWaterBottle className="w-3 h-3 text-neutral-500" />
            <p className="text-xs text-neutral-600 font-normal">snacks</p>
          </div>
          {/* Third One */}
          <div className="flex items-center gap-x-1">
            <IoTv className="w-3 h-3 text-neutral-500" />
            <p className="text-xs text-neutral-600 font-normal">TV</p>
          </div>
          {/* Fourth One */}
          <div className="flex items-center gap-x-1">
            <GiCharging className="w-3 h-3 text-neutral-500" />
            <p className="text-xs text-neutral-600 font-normal">charging</p>
          </div>
        </div>
      </div>
      <div className="w-full flex items-center justify-between">
        <h1 className="text-xl text-neutral-700 dark:text-neutral-200 font-semibold">
          {price}
        </h1>
        <button className="w-fit px-5 py-1.5 bg-primary dark:bg-secondary hover:bg-transparent dark:hover:bg-primary border-2 border-primary dark:border-secondary hover:border-primary dark:hover:border-secondary rounded-xl text-base font-normal text-neutral-50 dark:text-primary flex items-center justify-center gap-x-2 hover:text-primary dark:hover:text-white ease-in-out duration-300">
          Reserve Seat
        </button>
      </div>
    </div>
  );
};
export default TopSearchCard;
