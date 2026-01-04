"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { TbArrowsExchange } from "react-icons/tb";
import { FaMapMarkedAlt, FaSearch } from "react-icons/fa";
import { StationAutocomplete } from "./StationAutocomplete";
import { getCurrentDate } from "@/lib/formatters";

const Search: React.FC = () => {
  const router = useRouter();
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [selectedDate, setSelectedDate] = useState(getCurrentDate());

  const handleSwap = () => {
    const temp = fromLocation;
    setFromLocation(toLocation);
    setToLocation(temp);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    // Build query params
    const params = new URLSearchParams();
    if (fromLocation) params.append("from", fromLocation);
    if (toLocation) params.append("to", toLocation);
    if (selectedDate) params.append("date", selectedDate);

    // Redirect to scheduling page
    router.push(`/scheduling?${params.toString()}`);
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: -800 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -800 }}
      transition={{ duration: 1.5, ease: "easeOut" }}
      className="w-full bg-neutral-50/20 border-2 border-neutral-300 shadow-lg rounded-xl p-5 mt-5"
      onSubmit={handleSearch}
    >
      <div className="w-full flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="lg:w-[60%] flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-5 relative">
          <div className="w-full lg:w-1/2">
            <StationAutocomplete
              value={fromLocation}
              onChange={setFromLocation}
              placeholder="Điểm xuất phát..."
              icon={<FaMapMarkedAlt className="w-5 h-5" />}
            />
          </div>

          <div className="w-full lg:w-1/2">
            <StationAutocomplete
              value={toLocation}
              onChange={setToLocation}
              placeholder="Điểm đến..."
              icon={<FaMapMarkedAlt className="w-5 h-5" />}
            />
          </div>

          <button
            type="button"
            onClick={handleSwap}
            className="lg:absolute lg:w-11 w-full lg:h-6 h-11 lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 rounded-full flex items-center justify-center bg-primary text-neutral-50 hover:bg-primary/90 transition-colors"
            aria-label="Swap routes"
          >
            <TbArrowsExchange className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 h-14 flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-5">
          <label className="flex-1 h-14 border-neutral-300 bg-white/70 text-base text-neutral-700 font-medium px-5 flex items-center gap-x-1 rounded-lg">
            <span className="sr-only">Date</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="flex-1 h-full border-none bg-transparent focus:outline-none"
            />
          </label>

          <button
            type="submit"
            className="w-full lg:w-fit px-5 h-14 bg-primary hover:bg-transparent border-2 border-primary rounded-xl text-base font-medium text-neutral-50 flex items-center justify-center gap-x-2 hover:text-primary ease-in-out duration-300"
          >
            <FaSearch />
            Search
          </button>
        </div>
      </div>
    </motion.form>
  );
};

export default Search;
