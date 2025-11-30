"use client";

import { useState } from "react";
import Container from "@/components/layout/Container";
import PromotionCard from "@/components/promotion/PromotionCard";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface Promo {
  id: number | string;
  title: string;
  code: string;
  description: string;
}

const promos: Promo[] = [
  {
    id: 1,
    title: "Bus Promo 1",
    code: "BUS10",
    description: "Giảm 10% vé bus",
  },
  {
    id: 2,
    title: "Bus Promo 2",
    code: "BUS20",
    description: "Giảm 20% vé bus",
  },
  {
    id: 3,
    title: "Bus Promo 3",
    code: "BUS30",
    description: "Giảm 30% vé bus",
  },
  {
    id: 4,
    title: "Bus Promo 4",
    code: "BUS40",
    description: "Giảm 40% vé bus",
  },
  {
    id: 5,
    title: "Bus Promo 5",
    code: "BUS50",
    description: "Giảm 50% vé bus",
  },
];

const PromoCarousel: React.FC = () => {
  const [startIndex, setStartIndex] = useState(0);
  const cardsToShow = 3;

  const handlePrev = () =>
    setStartIndex((prev) => Math.max(prev - cardsToShow, 0));
  const handleNext = () =>
    setStartIndex((prev) =>
      Math.min(prev + cardsToShow, promos.length - cardsToShow)
    );

  const isAtStart = startIndex === 0;
  const isAtEnd = startIndex + cardsToShow >= promos.length;

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
            {promos.map((promo) => (
              <div
                key={promo.id}
                className="flex-shrink-0 w-[calc(33.333%-1.2rem)] min-w-[240px]"
              >
                <PromotionCard
                  title={promo.title}
                  code={promo.code}
                  description={promo.description}
                />
              </div>
            ))}
          </div>
        </div>

        {!isAtStart && (
          <button
            onClick={handlePrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-white shadow rounded-full flex items-center justify-center z-10"
            aria-label="Previous promotions"
          >
            <ArrowLeft size={20} className="text-primary" />
          </button>
        )}

        {!isAtEnd && (
          <button
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-white shadow rounded-full flex items-center justify-center z-10"
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
