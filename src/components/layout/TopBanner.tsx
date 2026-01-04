"use client";

import React from "react";
import { motion } from "framer-motion";
import Container from "./Container";

interface TopBannerProps {
  bgImg: string;
  title?: string;
  titleColor?: string;
  className?: string;
}

const variants = {
  hidden: { opacity: 0, y: -800 },
  visible: { opacity: 1, y: 0 },
};

const TopBanner: React.FC<TopBannerProps> = ({
  bgImg,
  title,
  titleColor = "text-neutral-800",
  className,
}) => {
  return (
    <motion.div
      className={`w-full h-[30vh] bg-cover bg-no-repeat bg-center relative ${
        className || ""
      }`}
      style={{ backgroundImage: `url(${bgImg})` }}
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={variants}
      transition={{ duration: 0.85, ease: "easeInOut" }}
    >
      <Container className="absolute top-0 left-0 w-full h-full pb-10 pt-[9ch] bg-gradient-to-b from-neutral-600/90 via-neutral-600/60 to-neutral-900/70 flex items-center justify-end flex-col gap-3">
        <motion.h1
          initial={{ opacity: 0, y: -800 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.85, ease: "easeOut" }}
          className={`text-5xl ${titleColor} font-bold capitalize`}
        >
          {title}
        </motion.h1>
      </Container>
    </motion.div>
  );
};

export default TopBanner;
