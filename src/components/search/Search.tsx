"use client";

import React from "react";
import { motion } from "framer-motion";
import { TbArrowsExchange } from "react-icons/tb";
import { FaMapMarkedAlt, FaSearch } from "react-icons/fa";

const Search: React.FC = () => {
  return (
    <motion.form
      initial={{ opacity: 0, y: -800 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -800 }}
      transition={{ duration: 1.5, ease: "easeOut" }}
      className="w-full bg-neutral-50/20 border-2 border-neutral-300 shadow-lg rounded-xl p-5 mt-5"
      onSubmit={(e) => e.preventDefault()}
    >
      <div className="w-full flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="lg:w-[60%] flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-5 relative">
          <label className="w-full lg:w-1/2 h-14 border-neutral-300 bg-white/70 text-base text-neutral-700 font-medium px-5 flex items-center gap-x-1 rounded-lg">
            <span className="sr-only">From</span>
            <input
              type="text"
              placeholder="From..."
              className="flex-1 h-full border-none bg-transparent focus:outline-none"
            />
            <FaMapMarkedAlt className="w-5 h-5 text-neutral-400" />
          </label>

          <label className="w-full lg:w-1/2 h-14 border-neutral-300 bg-white/70 text-base text-neutral-700 font-medium px-5 flex items-center gap-x-1 rounded-lg">
            <span className="sr-only">To</span>
            <input
              type="text"
              placeholder="To..."
              className="flex-1 h-full border-none bg-transparent focus:outline-none"
            />
            <FaMapMarkedAlt className="w-5 h-5 text-neutral-400" />
          </label>

          <button
            type="button"
            className="lg:absolute lg:w-11 w-full lg:h-6 h-11 lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 rounded-full flex items-center justify-center bg-primary text-neutral-50"
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
