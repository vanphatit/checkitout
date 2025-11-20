import React from "react";
import Container from "@/app/components/layout/Container";
import TopSearchCard from "@/app/components/topsearch/TopSearchCard";

const defaultRoutes = [
  {
    routeFrom: "New York",
    routeTo: "Washington D.C.",
    timeDuration: "3Hrs",
    price: "$120.00",
  },
  {
    routeFrom: "Boston",
    routeTo: "New York",
    timeDuration: "4Hrs",
    price: "$150.00",
  },
  {
    routeFrom: "Chicago",
    routeTo: "Detroit",
    timeDuration: "5Hrs",
    price: "$90.00",
  },
  {
    routeFrom: "Seattle",
    routeTo: "Portland",
    timeDuration: "3.5Hrs",
    price: "$110.00",
  },
  {
    routeFrom: "San Diego",
    routeTo: "Los Angeles",
    timeDuration: "2.5Hrs",
    price: "$85.00",
  },
  {
    routeFrom: "Dallas",
    routeTo: "Austin",
    timeDuration: "3Hrs",
    price: "$95.00",
  },
];

const TopSearchSection: React.FC = () => {
  return (
    <Container className="space-y-12">
      <div className="w-full text-center">
        <h2 className="text-3xl font-bold text-neutral-800 dark:text-secondary">
          Top Search <span className="text-primary">Routes</span>
        </h2>
      </div>
      <div className="grid w-full grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {defaultRoutes.map((item) => (
          <TopSearchCard
            key={`${item.routeFrom}-${item.routeTo}`}
            routeFrom={item.routeFrom}
            routeTo={item.routeTo}
            timeDuration={item.timeDuration}
            price={item.price}
          />
        ))}
      </div>
    </Container>
  );
};

export default TopSearchSection;
