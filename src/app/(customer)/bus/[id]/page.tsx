import Container from "@/components/layout/Container";
import TopBanner from "@/components/layout/TopBanner";
import Link from "next/link";
import WarningAlert from "@/components/alertmessage/WarningAlert";
import BusSeat from "@/components/busseat/BusSeat";
import RouteMapWrapper from "@/components/map/RouteMapWrapper";
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
  const driverName = data.driver?.name || "N/A";
  const busPlate = busData.plateNo || "N/A";
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
        title={`${busPlate} - ${driverName}`}
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
            etd={data.etd}
            eta={data.eta}
            distance={routeData.distance}
            estimatedDuration={routeData.estimatedDuration}
          />
        </div>

        {/* Route Stops with Map */}
        {routeData.stationIds && routeData.stationIds.length > 0 && (
          <div className="w-full space-y-6">
            {/* Interactive Map */}
            <div className="w-full bg-neutral-50 rounded-xl p-6 border border-neutral-200">
              <h2 className="text-xl font-semibold text-neutral-700 mb-4">Route Map</h2>
              <RouteMapWrapper stations={routeData.stationIds} height="500px" />
            </div>

            {/* Station List */}
            <div className="w-full bg-neutral-50 rounded-xl p-6 border border-neutral-200">
              <h2 className="text-xl font-semibold text-neutral-700 mb-4">
                Route Stops ({routeData.stationIds.length} stations)
              </h2>
              <div className="columns-1 md:columns-2 gap-8">
                {routeData.stationIds.map((station, index) => (
                  <div key={station._id} className="flex items-start gap-3 break-inside-avoid mb-2">
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className={`w-7 h-7 rounded-full text-white flex items-center justify-center text-xs font-semibold ${index === 0 ? "bg-green-500" :
                        index === routeData.stationIds.length - 1 ? "bg-red-500" :
                          "bg-blue-500"
                        }`}>
                        {index + 1}
                      </div>
                      {index < routeData.stationIds.length - 1 && (
                        <div className="w-0.5 h-8 bg-neutral-300 my-0.5"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-2">
                      <h3 className="font-medium text-neutral-700 text-sm">
                        {index === 0 && "🟢 "}
                        {index === routeData.stationIds.length - 1 && "🔴 "}
                        {station.name}
                      </h3>
                      <p className="text-xs text-neutral-500 mt-0.5 line-clamp-1">{station.address}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Booking summary */}
        <div className="w-full flex flex-col items-center gap-8 text-center">
          {/* Summary content */}
        </div>
      </Container>
    </div>
  );
}
