import React, { ReactNode } from "react";

interface RootLayoutProps {
  children: ReactNode;
  className?: string;
}

const RootLayout: React.FC<RootLayoutProps> = ({ children, className }) => {
  const baseClasses = "w-full lg:px-24 md:px-16 sm:px-7 px-4";

  return <div className={`${baseClasses} ${className || ""}`}>{children}</div>;
};

export default RootLayout;
