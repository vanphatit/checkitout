import React from "react";
import RootLayout from "@/app/layout/RootLayout";
import ServiceCard from "@/app/components/service/ServiceCard";
import { RiRefund2Line, RiSecurePaymentLine } from "react-icons/ri";
import { PiHeadsetFill } from "react-icons/pi";

const Services: React.FC = () => {
  return (
    <RootLayout className="space-y-12">
      {/* Tag */}
      <div className="w-full flex items-center justify-center text-center">
        <h1 className="text-3xl text-neutral-800 dark:text-secondary font-bold">
          Our <span className="text-primary">Services</span>
        </h1>
      </div>
      {/* Service Cards */}
      <div className="w-full grid grid-cols-3 gap-10">
        <ServiceCard
          icon={RiSecurePaymentLine}
          title="Secure Payment"
          desc="Your transactions are safe with us."
        />
        <ServiceCard
          icon={RiRefund2Line}
          title="Secure Payment"
          desc="Your transactions are safe with us."
        />
        <ServiceCard
          icon={PiHeadsetFill}
          title="Secure Payment"
          desc="Your transactions are safe with us."
        />
      </div>
    </RootLayout>
  );
};
export default Services;
