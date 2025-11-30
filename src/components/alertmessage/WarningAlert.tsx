"use client";
import * as React from "react";
import { FaX } from "react-icons/fa6";

interface IWarningAlertProps {
  message: React.ReactNode;
}

const WarningAlert: React.FunctionComponent<IWarningAlertProps> = ({
  message,
}) => {
  const [isVisible, setIsVisible] = React.useState(true);

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className="flex items-center justify-between p-4 text-sm text-yellow-600 bg-yellow-100 rounded-xl"
      role="alert"
    >
      <span>{message}</span>
      <button
        className="ml-4 text-red-600 hover:text-red-800/90"
        onClick={handleClose}
        aria-label="Close"
      >
        <FaX className="w-3 h-3" />
      </button>
    </div>
  );
};

export default WarningAlert;
