"use client";

import React, { useState, useEffect } from "react";
import { FaMoon, FaSun } from "react-icons/fa6";

type ThemeType = "light" | "dark";

const Theme: React.FC = () => {
  const [theme, setTheme] = useState<ThemeType>("light");
  const [mounted, setMounted] = useState(false);

  // Chạy sau khi client đã mount → tránh mismatch
  useEffect(() => {
    const savedTheme = (localStorage.getItem("theme") as ThemeType) || "light";
    setTheme(savedTheme);

    const root = document.documentElement;
    root.classList.toggle("dark", savedTheme === "dark");

    setMounted(true);
  }, []);

  // Apply lại khi theme thay đổi
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");

    localStorage.setItem("theme", theme);
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // CHẶN render icon trước khi mounted xong
  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-800/80"></div>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="dark:text-neutral-100 text-neutral-800 text-lg w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-800/80 flex items-center justify-center transition-colors duration-300"
      aria-label="Toggle Theme"
    >
      {theme === "dark" ? <FaMoon /> : <FaSun />}
    </button>
  );
};

export default Theme;
