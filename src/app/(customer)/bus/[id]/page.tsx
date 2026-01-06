import Container from "@/components/layout/Container";
import TopBanner from "@/components/layout/TopBanner";
import Link from "next/link";
import WarningAlert from "@/components/alertmessage/WarningAlert";
import BusSeatWrapper from "@/components/busseat/BusSeatWrapper";
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
      Mỗi khách chỉ được đặt một chỗ ngồi. Nếu bạn gặp vấn đề khi đặt chỗ, vui
      lòng liên hệ với chúng tôi.{" "}
      <Link href="/contact" className="text-yellow-700 font-medium">
        Check!tout Support
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

          <BusSeatWrapper
            schedulingId={id}
            busData={busData}
            routeData={routeData}
            seatData={seatData}
            price={price}
            schedulingId={id}
            etd={data.etd}
            eta={data.eta}
            distance={routeData.distance}
            estimatedDuration={routeData.estimatedDuration}
          />
        </div>

        {/* Route Stops with Map */}
        {routeData.stationIds && routeData.stationIds.length > 0 && (
          <div className="w-full space-y-6">
            {/* Warning for inactive stations */}
            {routeData.stationIds.some(
              (station: any) => station.isActive === false
            ) && (
              <div className="w-full bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-sm text-orange-700">
                  ⚠️ <strong>Lưu ý:</strong> Một số trạm trên tuyến đường này
                  hiện đang tạm ngừng hoạt động. Vui lòng liên hệ nhà xe để biết
                  thêm chi tiết.
                </p>
              </div>
            )}

            {/* Interactive Map */}
            <div className="w-full bg-neutral-50 rounded-xl p-6 border border-neutral-200">
              <h2 className="text-xl font-semibold text-neutral-700 mb-4">
                Route Map
              </h2>
              <RouteMapWrapper stations={routeData.stationIds} height="500px" />
            </div>

            {/* Station List */}
            <div className="w-full bg-neutral-50 rounded-xl p-6 border border-neutral-200">
              <h2 className="text-xl font-semibold text-neutral-700 mb-4">
                Route Stops ({routeData.stationIds.length} stations)
              </h2>
              <div className="columns-1 md:columns-2 gap-8">
                {routeData.stationIds.map((station, index) => (
                  <div
                    key={station._id}
                    className={`flex items-start gap-3 break-inside-avoid mb-2 ${
                      station.isActive === false ? "opacity-50" : ""
                    }`}
                  >
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div
                        className={`w-7 h-7 rounded-full text-white flex items-center justify-center text-xs font-semibold ${
                          station.isActive === false
                            ? "bg-neutral-400"
                            : index === 0
                            ? "bg-green-500"
                            : index === routeData.stationIds.length - 1
                            ? "bg-red-500"
                            : "bg-blue-500"
                        }`}
                      >
                        {index + 1}
                      </div>
                      {index < routeData.stationIds.length - 1 && (
                        <div className="w-0.5 h-8 bg-neutral-300 my-0.5"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-neutral-700 text-sm">
                          {index === 0 && "🟢 "}
                          {index === routeData.stationIds.length - 1 && "🔴 "}
                          {station.name}
                        </h3>
                        {station.isActive === false && (
                          <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full">
                            Ngừng hoạt động
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-500 mt-0.5 line-clamp-1">
                        {station.address}
                      </p>
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
