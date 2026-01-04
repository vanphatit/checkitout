import Container from "@/components/layout/Container";
import TopBanner from "@/components/layout/TopBanner";
import Link from "next/link";
import WarningAlert from "@/components/alertmessage/WarningAlert";
import BusSeat from "@/components/busseat/BusSeat";
import { bookingService } from "@/services/bookingService";
import { seatService } from "@/services/seatService";

export default async function BusTicketCheckIn({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  const data = await bookingService.getSchedulingById(id);
  const busData = data.busIds[0];
  const seatData = await seatService.getSeatsByBusId(data.busIds[0]._id);
  const routeData = data.routeId;
  const price = data.price;
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
        title={`${busData.plateNo} - ${busData.driverName}`}
        titleColor="text-cream"
      />

      <Container className="space-y-12 w-full pb-16">
        {/* Seat layout and selection */}
        <div className="w-full space-y-8">
          <WarningAlert message={warningMessage} />

          <BusSeat
            busData={busData}
            routeData={routeData}
            seatData={seatData}
            price={price}
          />
        </div>

        {/* Booking summary */}
        <div className="w-full flex flex-col items-center gap-8 text-center">
          {/* Summary content */}
        </div>
      </Container>
    </div>
  );
}
