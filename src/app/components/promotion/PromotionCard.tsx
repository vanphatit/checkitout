"use client";

import { useState } from "react";

interface PromotionCardProps {
  title: string;
  code: string;
  description: string;
}

const PromotionCard: React.FC<PromotionCardProps> = ({ title, code, description }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full rounded-xl p-4 border-2 border-neutral-300 bg-white shadow-sm flex flex-col justify-between space-y-4">
      <div className="space-y-2">
        <h4 className="text-lg font-semibold text-neutral-800">{title}</h4>
        <p className="text-sm text-neutral-500">{description}</p>
      </div>

      <div className="relative h-4 my-1">
        <div
          className="absolute inset-x-0 h-0.5"
          style={{
            backgroundColor: "rgb(229, 231, 235)",
            backgroundImage: "radial-gradient(circle, white 6px, transparent 6px)",
            backgroundRepeat: "repeat-x",
            backgroundPosition: "center",
            backgroundSize: "16px 1px",
            top: "50%",
            transform: "translateY(-50%)",
          }}
        />
        <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border border-gray-200" />
        <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border border-gray-200" />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-base font-semibold text-neutral-700 tracking-wide">
          {code}
        </span>
        <button
          onClick={handleCopy}
          className={`px-4 py-1.5 text-sm font-semibold rounded-xl transition duration-200 ${
            copied
              ? "bg-green-500 text-white"
              : "bg-primary text-white hover:bg-transparent hover:text-primary border-2 border-primary"
          }`}
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
};

export default PromotionCard;
