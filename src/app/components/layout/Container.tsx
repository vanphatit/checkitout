import React from "react";
import clsx from "clsx";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Responsive horizontal padding wrapper to keep sections aligned.
 */
const Container: React.FC<ContainerProps> = ({ children, className }) => {
  return (
    <div className={clsx("w-full lg:px-24 md:px-16 sm:px-7 px-4", className)}>
      {children}
    </div>
  );
};

export default Container;
