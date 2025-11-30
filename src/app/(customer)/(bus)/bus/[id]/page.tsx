"use client";
import * as React from "react";
import Container from "@/components/layout/Container";
import TopBanner from "@/components/layout/TopBanner";
import Link from "next/link";
import WarningAlert from "@/components/alertmessage/WarningAlert";
import BusSeat from "@/components/busseat/BusSeat";
const Detail: React.FC = () => {
  const warningMessage = (
    <>
      One individual only can book 3 seats. If you want to book more seats.
      Please{" "}
      <Link href="/contact" className="text-yellow-700 font-medium">
        Contact our support team.
      </Link>
    </>
  );

  return (
    <div className="w-full min-h-screen space-y-16 pb-16">
      <TopBanner
        bgImg="/assets/images/seats.png"
        title="Bus Details"
        titleColor="text-cream"
      />

      <Container className="space-y-12 w-full pb-16">
        {/* Seat layout and selection action detail */}
        <div className="w-full space-y-8">
          {/* Warning message */}
          <WarningAlert message={warningMessage} />

          {/* Seat layout */}
          <BusSeat />
        </div>

        {/* Booking summary and payment action detail */}
        <div className="w-full flex flex-col items-center gap-8 text-center">
          {/* Content booking summary */}
        </div>
      </Container>
    </div>
  );
};

export default Detail;
