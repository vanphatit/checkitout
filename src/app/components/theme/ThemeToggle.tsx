"use client";

import React, { useEffect, useState } from "react";
import { FaMoon, FaSun } from "react-icons/fa6";

type ThemeType = "light" | "dark";

/**
 * Simple local-storage backed theme toggle.
 */
const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<ThemeType>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = (localStorage.getItem("theme") as ThemeType) || "light";
    setTheme(savedTheme);
    document.documentElement.classList.toggle("dark", savedTheme === "dark");
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [mounted, theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-800/80" />
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

export default ThemeToggle;
