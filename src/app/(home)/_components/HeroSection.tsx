"use client";

import React from "react";
import { motion } from "framer-motion";
import Container from "@/app/components/layout/Container";
import Search from "@/app/components/search/Search";

const variants = {
  hidden: { opacity: 0, y: -800 },
  visible: { opacity: 1, y: 0 },
};

const HeroSection: React.FC = () => {
  return (
    <motion.section
      className='relative flex h-screen w-full flex-1 items-center justify-center bg-[url("/assets/hero/herobg.png")] bg-cover bg-no-repeat bg-top'
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={variants}
      transition={{ duration: 0.85, ease: "easeInOut" }}
    >
      <Container className="absolute top-0 left-0 flex h-full w-full flex-col items-center justify-start gap-9 bg-gradient-to-b from-neutral-50/70 via-neutral-50/15 to-neutral-50/5 py-[9ch] text-center">
        <div className="space-y-2">
          <motion.p
            initial={{ opacity: 0, y: -800 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="text-lg font-medium text-neutral-400"
          >
            Get your bus tickets easily
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: -800 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.85, ease: "easeOut" }}
            className="text-5xl font-bold capitalize text-neutral-800"
          >
            Find the <span className="text-primary">best bus tickets</span> below!
          </motion.h1>
        </div>

        <Search />
      </Container>
    </motion.section>
  );
};

export default HeroSection;
