"use client";

import React, { useEffect, useState } from "react";
import Container from "@/components/layout/Container";
import TopSearchCard from "@/components/topsearch/TopSearchCard";
import { routeService, RouteData } from "@/services/routeService";

const TopSearchSection: React.FC = () => {
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const data = await routeService.getAllRoutes();
        // Take first 6 routes
        setRoutes(data.slice(0, 6));
      } catch (error) {
        console.error("Error fetching routes:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRoutes();
  }, []);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const extractStations = (routeName: string) => {
    const parts = routeName.split(" - ");
    return {
      from: parts[0] || "",
      to: parts[1] || "",
    };
  };

  return (
    <Container className="space-y-12">
      <div className="w-full text-center">
        <h2 className="text-3xl font-bold text-neutral-800 dark:text-secondary">
          Top Search <span className="text-primary">Routes</span>
        </h2>
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid w-full grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {routes.map((route) => {
            const { from, to } = extractStations(route.name);
            return (
              <TopSearchCard
                key={route._id}
                routeFrom={from}
                routeTo={to}
                timeDuration={formatDuration(route.estimatedDuration || 0)}
                price={formatPrice(route.basePrice || 0)}
              />
            );
          })}
        </div>
      )}
    </Container>
  );
};

export default TopSearchSection;
