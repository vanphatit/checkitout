"use client";
import React from "react";
import { motion } from "framer-motion";
import RootLayout from "@/app/layout/RootLayout";
import Search from "@/app/components/search/Search";

const HeroSection: React.FC = () => {
  const variants = {
    hidden: { opacity: 0, y: -800 },
    visible: { opacity: 1, y: 0 },
  };
  return (
    <motion.div
      className='w-full flex-1 h-screen bg-[url("/assets/hero/herobg.png")] bg-cover bg-no-repeat bg-top relative'
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={variants}
      transition={{ duration: 0.85, ease: "easeInOut" }}
    >
      <RootLayout className="absolute top-0 left-0 w-full h-full py-[9ch] bg-gradient-to-b from-neutral-50/70 via-neutral-50/15 to-neutral-50/5 items-center justify-start text-center flex-col gap-9">
        {/* Title Section */}
        <div className="space-y-2">
          <motion.p
            initial={{ opacity: 0, y: -800 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="text-lg text-neutral-400 font-medium"
          >
            Get your bus tickets easily
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: -800 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.85, ease: "easeOut" }}
            className="text-5xl text-neutral-800 font-bold capitalize"
          >
            Find the <span className="text-primary">best bus tickets</span>{" "}
            below!
          </motion.h1>
        </div>

        {/* Search Section */}
        <Search />
      </RootLayout>
    </motion.div>
  );
};

export default HeroSection;
