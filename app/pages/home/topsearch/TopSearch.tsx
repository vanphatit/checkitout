import React from "react";
import RootLayout from "@/app/layout/RootLayout";
import TopSearchCard from "@/app/components/topsearch/TopSearchCard";

const TopSearch: React.FC = () => {
  return (
    <RootLayout className="space-y-12">
      {/* Tag */}
      <div className="w-full flex items-center justify-center text-center">
        <h1 className="text-3xl text-neutral-800 dark:text-secondary font-bold">
          Top Search <span className="text-primary">Routes</span>
        </h1>
      </div>
      {/* Top Search tickets routes card */}
      <div className="w-full grid grid-cols-3 gap-5">
        <TopSearchCard
          routeFrom="New York"
          routeTo="Washington D.C."
          timeDuration="3Hrs"
          price="120.000"
        />
        <TopSearchCard
          routeFrom="New York"
          routeTo="Washington D.C."
          timeDuration="3Hrs"
          price="120.000"
        />
        <TopSearchCard
          routeFrom="New York"
          routeTo="Washington D.C."
          timeDuration="3Hrs"
          price="120.000"
        />
        <TopSearchCard
          routeFrom="New York"
          routeTo="Washington D.C."
          timeDuration="3Hrs"
          price="120.000"
        />
        <TopSearchCard
          routeFrom="New York"
          routeTo="Washington D.C."
          timeDuration="3Hrs"
          price="120.000"
        />
        <TopSearchCard
          routeFrom="New York"
          routeTo="Washington D.C."
          timeDuration="3Hrs"
          price="120.000"
        />
      </div>
    </RootLayout>
  );
};
export default TopSearch;
