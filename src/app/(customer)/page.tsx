import HeroSection from "@/app/(home)/_components/HeroSection";
import ServicesSection from "@/app/(home)/_components/ServicesSection";
import TopSearchSection from "@/app/(home)/_components/TopSearchSection";
import PromoCarousel from "@/app/(home)/_components/PromoCarousel";

const HomePage: React.FC = () => {
  return (
    <div className="w-full min-h-screen space-y-16 pb-16">
      <HeroSection />
      <ServicesSection />
      <TopSearchSection />
      <PromoCarousel />
    </div>
  );
};

export default HomePage;
