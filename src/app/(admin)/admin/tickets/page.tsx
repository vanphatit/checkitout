import TicketManagementClient from "./TicketManagementClient";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    status?: string;
    period?: string;
    paymentMethod?: string;
  }>;
}) {
  const sParams = await searchParams;

  return (
    <TicketManagementClient
      page={Number(sParams.page ?? 1)}
      status={sParams.status ?? "SUCCESS"}
      period={sParams.period ?? "allTime"}
      paymentMethod={sParams.paymentMethod ?? ""}
    />
  );
}
