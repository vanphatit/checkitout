import type { ReactNode } from "react";
import Navbar from "@/app/components/navigation/Navbar";
import Footer from "@/app/components/footer/Footer";

export default function CustomerLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 pt-20">{children}</main>
      <Footer />
    </div>
  );
}
