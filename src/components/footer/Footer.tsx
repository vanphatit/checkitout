"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Container from "../layout/Container";
import { FaInstagram, FaX, FaYoutube } from "react-icons/fa6";
import { FaFacebook } from "react-icons/fa";
import { getCurrentDate } from "@/lib/formatters";
import { routeService, RouteData } from "@/services/routeService";

const Footer: React.FC = () => {
  const router = useRouter();
  const [routes, setRoutes] = useState<RouteData[]>([]);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const data = await routeService.getAllRoutes();
        // Take first 4 routes for footer
        setRoutes(data.slice(0, 4));
      } catch (error) {
        console.error("Error fetching routes:", error);
      }
    };
    fetchRoutes();
  }, []);

  const extractStations = (routeName: string) => {
    const parts = routeName.split(" - ");
    return {
      from: parts[0] || "",
      to: parts[1] || "",
    };
  };

  const handleRouteClick = (from: string, to: string) => {
    const params = new URLSearchParams();
    params.append("from", from);
    params.append("to", to);
    params.append("date", getCurrentDate());
    router.push(`/scheduling?${params.toString()}`);
  };

  return (
    <footer className="w-full bg-neutral-950 dark:bg-primary py-12">
      <Container className="space-y-10">
        <div className="w-full grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="md:col-span-2 space-y-8 md:pr-10">
            <div className="space-y-3">
              <Link
                href="/"
                className="text-4xl md:text-5xl xl:text-6xl text-primary dark:text-white font-bold"
              >
                Check!tOut
              </Link>
              <p className="text-sm text-neutral-400 dark:text-neutral-200 font-normal">
                Your gateway to unforgettable journeys.
              </p>
            </div>
            <div className="flex items-center gap-x-5">
              {[FaInstagram, FaFacebook, FaYoutube, FaX].map((Icon, idx) => (
                <div
                  key={idx}
                  className="w-11 h-11 rounded-xl bg-neutral-800/40 hover:bg-primary dark:hover:bg-secondary flex items-center justify-center cursor-pointer ease-in-out duration-500"
                >
                  <Icon className="w-5 h-5 text-neutral-50" />
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-5">
            <h2 className="text-lg text-neutral-100 font-semibold">
              Quick Links
            </h2>
            <div className="space-y-2">
              {[
                "About Us",
                "My Account",
                "Reserve your ticket",
                "Create your account",
              ].map((label) => (
                <Link
                  key={label}
                  href="/"
                  className="block text-base text-neutral-500 dark:text-neutral-200 hover:text-neutral-300 font-normal ease-in-out duration-300"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
          <div className="space-y-5">
            <h2 className="text-lg text-neutral-100 font-semibold">
              Top Reserve Routes
            </h2>
            <div className="space-y-2">
              {routes.length > 0 ? (
                routes.map((route) => {
                  const { from, to } = extractStations(route.name);
                  return (
                    <button
                      key={route._id}
                      onClick={() => handleRouteClick(from, to)}
                      className="block text-base text-neutral-500 dark:text-neutral-200 hover:text-neutral-300 font-normal ease-in-out duration-300 text-left"
                    >
                      {from} - {to}
                    </button>
                  );
                })
              ) : (
                <div className="text-sm text-neutral-500">Loading routes...</div>
              )}
            </div>
          </div>
          <div className="space-y-5">
            <h2 className="text-lg text-neutral-100 font-semibold">
              Support Links
            </h2>
            <div className="space-y-2">
              {[
                "Privacy Policy",
                "Terms & Conditions",
                "Help & Support Center",
                "FAQ",
              ].map((label) => (
                <Link
                  key={label}
                  href="/"
                  className="block text-base text-neutral-500 dark:text-neutral-200 hover:text-neutral-300 font-normal ease-in-out duration-300"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full h-px bg-neutral-800/50 dark:bg-secondary/50" />

        <div className="w-full flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-neutral-600 dark:text-neutral-200 font-normal">
            © 2025 Check!tOut. All rights reserved.
          </p>
          <div className="flex items-center justify-center gap-x-2">
            {["mastercard", "creditcard", "paypal"].map((name) => (
              <Image
                key={name}
                src={`/assets/images/${name}.png`}
                alt={name}
                width={60}
                height={40}
                className="h-9 object-contain object-center"
              />
            ))}
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
