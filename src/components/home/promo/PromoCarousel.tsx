"use client";

import { useState, useEffect } from "react";
import Container from "@/components/layout/Container";
import PromotionCard from "@/components/promotion/PromotionCard";
import { ArrowLeft, ArrowRight, Loader2, Tag } from "lucide-react";
import { promotionService } from "@/services/promotionService";
import type { Promotion } from "@/types/promotion";

const PromoCarousel: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [startIndex, setStartIndex] = useState(0);
  const cardsToShow = 3;

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        setIsLoading(true);
        const response = await promotionService.getPromotions({
          page: 1,
          limit: 10,
          sortBy: "createdAt",
          sortOrder: "desc",
        });

        // Backend returns nested structure: response.data.data
        const promotionsData = Array.isArray(response.data?.data)
          ? response.data.data
          : [];

        // Calculate next occurrence for promotions and sort by nearest date
        const now = new Date();
        const currentYear = now.getFullYear();

        const promotionsWithNextDate = promotionsData.map((promo) => {
          // Handle Recurring promotions
          if (
            promo.type === "Recurring" &&
            promo.recurringMonth &&
            promo.recurringDay
          ) {
            // Create date for this year
            let nextDate = new Date(
              currentYear,
              promo.recurringMonth - 1,
              promo.recurringDay
            );

            // If the date has passed this year, use next year's date
            if (nextDate < now) {
              nextDate = new Date(
                currentYear + 1,
                promo.recurringMonth - 1,
                promo.recurringDay
              );
            }

            // Calculate days until next occurrence
            const daysUntil = Math.ceil(
              (nextDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
            );

            return { ...promo, nextDate, daysUntil };
          }

          // Handle Special promotions with start/end dates
          if (promo.type === "Special" && promo.startDate && promo.expiryDate) {
            const startDate = new Date(promo.startDate);
            const endDate = new Date(promo.expiryDate);

            // If promotion hasn't started yet, use start date
            if (startDate > now) {
              const daysUntil = Math.ceil(
                (startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
              );
              return { ...promo, nextDate: startDate, daysUntil };
            }

            // If promotion is active (between start and end), use end date
            if (now >= startDate && now <= endDate) {
              const daysUntil = Math.ceil(
                (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
              );
              return { ...promo, nextDate: endDate, daysUntil };
            }

            // If promotion has ended, put it at the end
            return {
              ...promo,
              nextDate: new Date(9999, 11, 31),
              daysUntil: Infinity,
            };
          }

          // Default promotions or promotions without dates go to the end
          return {
            ...promo,
            nextDate: new Date(9999, 11, 31),
            daysUntil: Infinity,
          };
        });

        // Sort by nearest occurrence
        const sortedPromotions = promotionsWithNextDate.sort((a, b) => {
          return a.daysUntil - b.daysUntil;
        });

        setPromotions(sortedPromotions);
      } catch (error) {
        console.error("Error fetching promotions:", error);
        setPromotions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPromotions();
  }, []);

  const handlePrev = () =>
    setStartIndex((prev) => Math.max(prev - cardsToShow, 0));
  const handleNext = () =>
    setStartIndex((prev) =>
      Math.min(prev + cardsToShow, promotions.length - cardsToShow)
    );

  const isAtStart = startIndex === 0;
  const isAtEnd = startIndex + cardsToShow >= promotions.length;

  const handleCopy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      // You can add a toast notification here
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  if (isLoading) {
    return (
      <Container className="space-y-12">
        <div className="w-full text-center">
          <h2 className="text-3xl font-bold text-neutral-800 dark:text-secondary">
            Promotions <span className="text-primary">Deals</span>
          </h2>
        </div>
        <div className="flex justify-center py-12">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      </Container>
    );
  }

  if (promotions.length === 0) {
    return (
      <Container className="space-y-12">
        <div className="w-full text-center">
          <h2 className="text-3xl font-bold text-neutral-800 dark:text-secondary">
            Promotions <span className="text-primary">Deals</span>
          </h2>
        </div>
        <div className="text-center py-12">
          <Tag className="w-16 h-16 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
          <p className="text-neutral-600 dark:text-neutral-400">
            Không có chương trình khuyến mãi nào
          </p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="space-y-12">
      <div className="w-full text-center">
        <h2 className="text-3xl font-bold text-neutral-800 dark:text-secondary">
          Promotions <span className="text-primary">Deals</span>
        </h2>
      </div>

      <div className="relative w-full">
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out gap-5"
            style={{
              transform: `translateX(-${(startIndex * 100) / cardsToShow}%)`,
            }}
          >
            {promotions.map((promo) => (
              <div
                key={promo._id}
                className="flex-shrink-0 w-[calc(33.333%-1.2rem)] min-w-[240px]"
              >
                <PromotionCard
                  title={promo.name}
                  code={promo.code}
                  description={
                    promo.description || `Giảm ${promo.value}% vé bus`
                  }
                  recurringDay={promo.recurringDay}
                  recurringMonth={promo.recurringMonth}
                  onCopy={handleCopy}
                />
              </div>
            ))}
          </div>
        </div>

        {!isAtStart && promotions.length > cardsToShow && (
          <button
            onClick={handlePrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-white dark:bg-neutral-800 shadow rounded-full flex items-center justify-center z-10 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
            aria-label="Previous promotions"
          >
            <ArrowLeft size={20} className="text-primary" />
          </button>
        )}

        {!isAtEnd && promotions.length > cardsToShow && (
          <button
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-white dark:bg-neutral-800 shadow rounded-full flex items-center justify-center z-10 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
            aria-label="Next promotions"
          >
            <ArrowRight size={20} className="text-primary" />
          </button>
        )}
      </div>
    </Container>
  );
};

export default PromoCarousel;
