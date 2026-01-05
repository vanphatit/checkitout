"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaBars, FaPhone } from "react-icons/fa6";
import { LiaTimesSolid } from "react-icons/lia";
import Container from "../layout/Container";
import ThemeToggle from "../theme/ThemeToggle";
import { CircleUserRound, LogOut } from "lucide-react";

import { useAuth } from "@/hooks";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/route", label: "Tuyến đường" },
  { href: "/scheduling", label: "Lịch trình" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
];

const getTicketLink = (role?: string) => {
  if (role === "ADMIN" || role === "SELLER") {
    return "/admin/tickets";
  }
  return "/my-tickets";
};

const Navbar: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const roleKey = (user?.role ?? "CUSTOMER").toUpperCase();

  const roleStyles: Record<
    string,
    { border: string; text: string; bg: string; hover: string }
  > = {
    CUSTOMER: {
      border: "border-primary",
      text: "text-primary",
      bg: "bg-primary/10",
      hover: "hover:bg-primary/20",
    },
    ADMIN: {
      border: "border-red-500",
      text: "text-red-600",
      bg: "bg-red-50",
      hover: "hover:bg-red-100",
    },
    SELLER: {
      border: "border-orange-400",
      text: "text-orange-600",
      bg: "bg-orange-50",
      hover: "hover:bg-orange-100",
    },
  };

  const roleStyle = roleStyles[roleKey] ?? roleStyles.CUSTOMER;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const linkClass = scrolled
    ? "text-neutral-700 hover:text-primary dark:text-neutral-200 dark:hover:text-white"
    : "text-primary hover:text-secondary dark:text-primary dark:hover:text-secondary";

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled
          ? "bg-white/90 shadow-sm backdrop-blur dark:bg-neutral-900/80"
          : "bg-transparent"
      }`}
    >
      <Container className="flex h-16 items-center justify-between gap-6">
        <Link
          href="/"
          className="mr-auto flex items-center gap-2 text-2xl font-bold"
        >
          <span className={scrolled ? "text-neutral-900" : "text-primary"}>
            Check!tOut
          </span>
          <Image
            src={
              scrolled
                ? "/assets/images/logo-black.png"
                : "/assets/images/logo-primary.png"
            }
            alt="Logo"
            width={36}
            height={36}
            className="h-9 w-9 object-contain"
          />
        </Link>

        <button
          onClick={() => setOpen((prev) => !prev)}
          className="flex lg:hidden items-center justify-center rounded-md p-2 text-neutral-700 hover:bg-neutral-100"
          aria-label="Toggle navigation"
        >
          {open ? (
            <LiaTimesSolid className="text-xl" />
          ) : (
            <FaBars className="text-xl" />
          )}
        </button>

        <div
          className={`${
            open ? "flex" : "hidden"
          } lg:flex absolute lg:static top-16 left-0 w-full lg:w-auto bg-white dark:bg-neutral-900 lg:bg-transparent lg:dark:bg-transparent shadow lg:shadow-none flex-col lg:flex-row gap-4 lg:items-center px-4 py-4 lg:p-0`}
        >
          <ul className="flex flex-col lg:flex-row gap-4 lg:items-center">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`text-base font-medium ${linkClass}`}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            {isAuthenticated && user && (
              <li>
                <Link
                  href={getTicketLink(user.role)}
                  className={`text-base font-medium ${linkClass}`}
                  onClick={() => setOpen(false)}
                >
                  Ticket
                </Link>
              </li>
            )}
          </ul>

          <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:pl-6 border-t lg:border-0 pt-3 lg:pt-0">
            {isAuthenticated && user ? (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    asChild
                    variant="outline"
                    className={`justify-center gap-2 rounded-full border ${roleStyle.border} ${roleStyle.bg} ${roleStyle.text} ${roleStyle.hover}`}
                    onClick={() => setOpen(false)}
                  >
                    <Link href="/profile" className="flex items-center gap-2">
                      {user.avatarUrl ? (
                        <div className="relative h-6 w-6 overflow-hidden rounded-full border-2 border-current">
                          <Image
                            src={user.avatarUrl}
                            alt={`${user.firstName} ${user.lastName}`}
                            fill
                            className="object-cover"
                            sizes="24px"
                          />
                        </div>
                      ) : (
                        <CircleUserRound className="h-4 w-4" />
                      )}
                      <span className="font-semibold">
                        {user.firstName} {user.lastName}
                      </span>
                    </Link>
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-full border border-neutral-200 text-neutral-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                    onClick={() => {
                      logout();
                      setOpen(false);
                    }}
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-semibold text-neutral-800 hover:text-primary dark:text-neutral-200 dark:hover:text-white"
                  onClick={() => setOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="rounded-md border-2 border-primary bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-transparent hover:text-primary dark:text-primary dark:bg-white dark:hover:bg-transparent dark:hover:text-white dark:border-primary"
                  onClick={() => setOpen(false)}
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </Container>
    </nav>
  );
};

export default Navbar;
