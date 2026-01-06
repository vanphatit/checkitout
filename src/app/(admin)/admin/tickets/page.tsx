import TicketManagementClient from "./TicketManagementClient";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    status?: string;
    period?: string;
    paymentMethod?: string;
    search?: string;
  }>;
}) {
  const sParams = await searchParams;

  return (
    <TicketManagementClient
      page={Number(sParams.page ?? 1)}
      status={sParams.status ?? ""}
      period={sParams.period ?? ""}
      paymentMethod={sParams.paymentMethod ?? ""}
      search={sParams.search ?? ""}
    />
  );
}
