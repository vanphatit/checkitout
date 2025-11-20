import { ArrowUpRight, PackageCheck, ShoppingBag, Sparkles, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const stats = [
  {
    label: "Active listings",
    value: "128",
    change: "+12%",
    icon: ShoppingBag,
  },
  {
    label: "Orders in transit",
    value: "42",
    change: "+8%",
    icon: Truck,
  },
  {
    label: "Fulfillment rate",
    value: "98.2%",
    change: "+1.3%",
    icon: PackageCheck,
  },
];

export default function SellerHomePage() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label} className="border-white/10 bg-white/5 text-gray-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">
                  {item.label}
                </CardTitle>
                <Icon className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold text-white">{item.value}</div>
                <p className="text-xs text-emerald-300/80">{item.change} vs last week</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-white/10 bg-white/5 text-gray-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-white">
            <Sparkles className="h-5 w-5 text-primary" />
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
