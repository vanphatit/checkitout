import React from "react";
import Container from "@/app/components/layout/Container";
import ServiceCard from "@/app/components/service/ServiceCard";
import { RiRefund2Line, RiSecurePaymentLine } from "react-icons/ri";
import { PiHeadsetFill } from "react-icons/pi";

const ServicesSection: React.FC = () => {
  return (
    <Container className="space-y-12">
      <div className="w-full text-center">
        <h2 className="text-3xl font-bold text-neutral-800 dark:text-secondary">
          Our <span className="text-primary">Services</span>
        </h2>
      </div>
      <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-3">
        <ServiceCard
          icon={RiSecurePaymentLine}
          title="Secure Payment"
          desc="Your transactions are safe with us."
        />
        <ServiceCard
          icon={RiRefund2Line}
          title="Easy Refunds"
          desc="Hassle-free refund process when plans change."
        />
        <ServiceCard
          icon={PiHeadsetFill}
          title="24/7 Support"
          desc="We are here to help you at any time."
        />
      </div>
    </Container>
  );
};

export default ServicesSection;
