"use client";

import * as React from "react";

interface IErrorMessageProps {
  message: string;
  initialCountdown?: number;
}

const ErrorMessage: React.FunctionComponent<IErrorMessageProps> = ({
  message,
  initialCountdown = 10,
}) => {
  const [isVisible, setIsVisible] = React.useState<boolean>(true);
  const [countdown, setCountdown] = React.useState<number>(initialCountdown);

  React.useEffect(() => {
    if (countdown === 0) {
      setIsVisible(false);
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  // Nếu không hiển thị, trả về null
  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed top-28 p-4 right-4 mb-4 text-sm text-neutral-50 bg-red-500 rounded-xl shadow-lg transition-transform transform-gpu animate-slide-in">
      <div className="flex items-center justify-between">
        <span>{message}</span>
        <span className="ml-4 font-bold">{countdown}</span>
      </div>
    </div>
  );
};

export default ErrorMessage;
