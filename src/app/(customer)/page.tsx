import HeroSection from "@/components/home/hero/HeroSection";
import ServicesSection from "@/components/home/service/ServicesSection";
import TopSearchSection from "@/components/home/search/TopSearchSection";
import PromoCarousel from "@/components/home/promo/PromoCarousel";

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
