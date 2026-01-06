"use client";

import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  DollarSign,
  PackageCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ticketService } from "@/services/ticketService";
import type { SellerTicketStats } from "@/types/ticket";

export default function SellerHomePage() {
  const [stats, setStats] = useState<SellerTicketStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await ticketService.getSellerStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch seller stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const statsCards = [
    {
      label: "Total Income",
      value: stats ? formatCurrency(stats.totalIncome) : "Loading...",
      change: isLoading ? "..." : "+12%",
      icon: DollarSign,
    },
    {
      label: "Tickets Sold",
      value: stats ? stats.ticketCount.toString() : "Loading...",
      change: isLoading ? "..." : "+8%",
      icon: ShoppingBag,
    },
    {
      label: "Average Price",
      value: stats ? formatCurrency(stats.averagePrice) : "Loading...",
      change: isLoading ? "..." : "+1.3%",
      icon: PackageCheck,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {statsCards.map((item) => {
          const Icon = item.icon;
          return (
            <Card
              key={item.label}
              className="border-white/10 bg-white/5 text-gray-100"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">
                  {item.label}
                </CardTitle>
                <Icon className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold text-white">
                  {item.value}
                </div>
                <p className="text-xs text-emerald-300/80">
                  {item.change} vs last week
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-white/10 bg-white/5 text-gray-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-white">
            <Truck className="h-5 w-5 text-primary" />
            Seller quick actions
          </CardTitle>
          <CardDescription className="text-gray-400">
            Launch updates, review orders, and keep your storefront healthy.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: "Create new listing", action: "Start" },
            { label: "Review pending orders", action: "Open" },
            { label: "Adjust payouts", action: "Manage" },
            { label: "Edit store details", action: "Edit" },
            { label: "Message customers", action: "Reply" },
            { label: "Promote top items", action: "Boost" },
          ].map((item) => (
            <Button
              key={item.label}
              variant="outline"
              className="flex h-auto items-center justify-between rounded-xl border-white/20 bg-white/5 px-4 py-3 text-left text-sm font-medium text-gray-100 hover:bg-white/10"
            >
              <span className="pr-2">{item.label}</span>
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
