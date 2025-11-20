"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaBars, FaPhone } from "react-icons/fa6";
import { LiaTimesSolid } from "react-icons/lia";
import Container from "../layout/Container";
import ThemeToggle from "../theme/ThemeToggle";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/bus", label: "Bus" },
  { href: "/services", label: "Services" },
];

const Navbar: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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
              scrolled ? "/assets/images/logo-black.png" : "/assets/images/logo-primary.png"
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
          {open ? <LiaTimesSolid className="text-xl" /> : <FaBars className="text-xl" />}
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
          </ul>

          <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:pl-6 border-t lg:border-0 pt-3 lg:pt-0">
            <Link
              href="/login"
              className="text-sm font-semibold text-neutral-800 hover:text-primary dark:text-neutral-200 dark:hover:text-white"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="rounded-md border-2 border-primary bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-transparent hover:text-primary dark:text-primary dark:bg-white dark:hover:bg-transparent dark:hover:text-white dark:border-primary"
            >
              Sign up
            </Link>
            <div className="hidden lg:flex items-center gap-2 text-primary font-semibold">
              <FaPhone className="text-base" />
              <span className="text-sm">+84 123 456 789</span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </Container>
    </nav>
  );
};

export default Navbar;
