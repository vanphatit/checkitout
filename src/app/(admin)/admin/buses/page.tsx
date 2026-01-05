import BusManagementClient from "./BusManagementClient";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; status?: string }>;
}) {
  const sParams = await searchParams;

  return (
    <BusManagementClient
      page={Number(sParams.page ?? 1)}
      search={sParams.search ?? ""}
      status={sParams.status ?? ""}
    />
  );
}
