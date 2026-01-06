"use client";

import { useState } from "react";
import { Calendar } from "lucide-react";

interface PromotionCardProps {
  title: string;
  code: string;
  description: string;
  recurringDay?: number;
  recurringMonth?: number;
  onCopy?: (code: string) => void;
}

const PromotionCard: React.FC<PromotionCardProps> = ({
  title,
  code,
  description,
  recurringDay,
  recurringMonth,
  onCopy,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      if (onCopy) {
        onCopy(code);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const formatRecurringDate = () => {
    if (!recurringDay || !recurringMonth) return "";
    const day = String(recurringDay).padStart(2, "0");
    const month = String(recurringMonth).padStart(2, "0");
    return `${day}/${month}`;
  };

  return (
    <div className="w-full rounded-xl p-4 border-2 border-neutral-300 bg-white dark:bg-neutral-800 dark:border-neutral-600 shadow-sm flex flex-col justify-between space-y-4">
      <div className="space-y-2">
        <h4 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">
          {title}
        </h4>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {description}
        </p>
        {recurringDay && recurringMonth && (
          <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
            <Calendar className="w-3.5 h-3.5" />
            <span className="font-medium">
              Áp dụng ngày {formatRecurringDate()} hàng năm
            </span>
          </div>
        )}
      </div>

      <div className="relative h-4 my-1">
        <div
          className="absolute inset-x-0 h-0.5"
          style={{
            backgroundColor: "rgb(229, 231, 235)",
            backgroundImage:
              "radial-gradient(circle, white 6px, transparent 6px)",
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
