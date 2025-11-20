import React from "react";
import { IconType } from "react-icons";

interface ServiceCardProps {
  icon: IconType | React.ElementType;
  title: string;
  desc: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ icon: Icon, title, desc }) => {
  return (
    <div className="w-full bg-neutral-200 hover:bg-neutral-300 rounded-xl p-7 flex items-center justify-center gap-4 flex-col text-center cursor-pointer duration-300">
      <div className="w-full flex items-center justify-center gap-x-3">
        <div className="w-12 h-12 rounded-xl bg-neutral-400/40 flex items-center justify-center">
          {Icon && <Icon className="w-7 h-7 text-neutral-800" />}
        </div>
        <div className="text-left space-y-1">
          <h3 className="text-2xl text-neutral-800 font-bold">{title}</h3>
          <p className="text-sm text-neutral-600 font-normal">{desc}</p>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
