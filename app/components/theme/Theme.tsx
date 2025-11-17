"use client";

import React, { useState, useLayoutEffect } from "react";
import { FaMoon, FaSun } from "react-icons/fa6";

// Định nghĩa kiểu Theme
type ThemeType = "light" | "dark";

const Theme: React.FC = () => {
  // 1. Khởi tạo State và Đọc localStorage (Chỉ chạy trên Client sau Hydration)
  const [theme, setTheme] = useState<ThemeType>(() => {
    // Chỉ chạy MỘT lần trong quá trình khởi tạo trên client
    if (typeof window !== "undefined") {
      // Lấy giá trị đã lưu
      const savedTheme = localStorage.getItem("theme") as ThemeType | null;
      // Dùng giá trị đã lưu, nếu không có thì dùng 'light'
      return savedTheme || "light";
    }
    // Giá trị mặc định được dùng trong quá trình SSR (Server Side Rendering)
    return "light";
  });

  // 2. Sử dụng useLayoutEffect để áp dụng lớp CSS ngay lập tức
  // useLayoutEffect chạy đồng bộ sau DOM mutation nhưng trước khi trình duyệt vẽ lại,
  // giúp tránh hiện tượng nhấp nháy UI (flickering).
  useLayoutEffect(() => {
    if (typeof window === "undefined") return;

    const root = document.documentElement;

    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // Đồng bộ trạng thái theme vào localStorage
    localStorage.setItem("theme", theme);
  }, [theme]);

  // 3. Hàm chuyển đổi theme
  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

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
