import HeroSection from "@/app/(home)/hero/HeroSection";
import ServicesSection from "@/app/(home)/service/ServicesSection";
import TopSearchSection from "@/app/(home)/search/TopSearchSection";
import PromoCarousel from "@/app/(home)/promo/PromoCarousel";

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
