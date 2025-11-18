"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

import { LiaTimesSolid } from "react-icons/lia";
import { FaBars, FaPhone } from "react-icons/fa6";
import Theme from "../theme/Theme";

interface NavLink {
  href: string;
  label: string;
}

const scrollColor = "primary";

const navLinks: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/bus", label: "Bus" },
  { href: "/services", label: "Services" },
];

const Navbar: React.FC = () => {
  const [open, setOpen] = useState<boolean>(false);
  // State mới để theo dõi trạng thái cuộn
  const [scrolled, setScrolled] = useState<boolean>(false);

  // --- Logic Xử lý Cuộn ---
  const handleScroll = () => {
    // Đặt ngưỡng cuộn (ví dụ: 80px)
    const offset = window.scrollY;
    if (offset > 80) {
      setScrolled(true);
    } else {
      setScrolled(false);
    }
  };

  useEffect(() => {
    // Đăng ký sự kiện cuộn khi component được mount
    window.addEventListener("scroll", handleScroll);

    // Dọn dẹp sự kiện khi component unmount
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []); // Chỉ chạy một lần khi mount

  // --- Logic Xử lý Menu ---
  const handleClick = (): void => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (): void => {
    setOpen(false);
  };

  const navbarClasses = `
    w-full h-[8ch] flex items-center md:flex-row lg:px-28 md:px-16 sm:px-7 px-4 fixed top-0 z-50 transition-all duration-300 ease-in-out
    ${scrolled ? "bg-neutral-100 dark:bg-primary shadow-md" : "bg-transparent"}
  `;

  // Lớp text cho các link khi cuộn (đảm bảo text luôn dễ đọc)
  const linkTextClasses = `
  text-base font-medium transition-colors duration-300
  ${
    scrolled
      ? "text-neutral-600 hover:text-primary dark:text-neutral-900 dark:hover:text-white"
      : "text-primary hover:text-secondary dark:text-primary dark:hover:text-secondary"
  }
`;

  return (
    <div className={navbarClasses}>
      {/* Logo section */}
      <Link
        href={"/"}
        className="mr-16 font-bold text-3xl flex justify-center items-center gap-x-1"
      >
        {!scrolled ? (
          <>
            <h1 className={`text-${scrollColor} font-bold`}>Check!tOut</h1>
            <Image
              src="/assets/images/logo-primary.png"
              alt="Logo"
              width={40}
              height={40}
            />
          </>
        ) : (
          <>
            <h1 className="text-black font-bold">Check!tOut</h1>
            <Image
              src="/assets/images/logo-black.png"
              alt="Logo"
              width={40}
              height={40}
            />
          </>
        )}
      </Link>

      {/* Toggle button */}
      <button
        onClick={handleClick}
        className="flex-1 lg:hidden text-neutral-600 dark:text-neutral-300 ease-in-out duration-300 flex items-center justify-end"
      >
        {open ? (
          <LiaTimesSolid className="text-xl" />
        ) : (
          <FaBars className="text-xl" />
        )}
      </button>

      <div
        className={`${
          open
            ? "flex absolute top-14 left-0 w-full h-auto md:h-auto md:relative"
            : "hidden"
        } flex-1 md:flex flex-col md:flex-row gap-x-5 gap-y-2 md:items-center md:p-0 sm:p-4 p-4 justify-between md:bg-transparent md:shadow-none shadow-md rounded-md
        ${scrolled ? "bg-neutral-100" : "bg-neutral-900/90 md:bg-transparent"}
        `}
      >
        <ul className="list-none flex md:items-center items-start gap-x-5 gap-y-1 flex-wrap md:flex-row flex-col">
          {navLinks.map((link, index) => (
            <li key={index}>
              <Link
                href={link.href}
                onClick={handleClose}
                className={linkTextClasses}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex md:items-center items-start gap-x-5 gap-y-2 flex-wrap md:flex-row flex-col text-base font-medium text-neutral-800">
          <Link
            href="/login"
            className="px-4 py-2 w-fit cursor-pointer text-text-base dark:text-text-inverted hover:text-primary dark:hover:text-secondary transition-colors duration-300 rounded-md"
          >
            <span className="font-bold">Login</span>
          </Link>
          <Link
            href="/signup"
            className="
              bg-primary dark:bg-white text-white dark:text-primary
              rounded-md px-4 py-2 w-fit cursor-pointer
              border-2 border-primary dark:border-neutral-100
              hover:bg-neutral-100 hover:text-primary dark:hover:text-neutral-900 hover:border-primary dark:hover:border-secondary
              transition-colors duration-300
            "
          >
            <span className="font-bold">Sign up</span>
          </Link>
          <Theme />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
