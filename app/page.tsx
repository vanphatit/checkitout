import HeroSection from "@/app/pages/home/hero/HeroSection";
import Services from "@/app/pages/home/services/Services";
import TopSearch from "@/app/pages/home/topsearch/TopSearch";
import PromoCarousel from "@/app/pages/home/promotion/PromoCarousel";
const Home: React.FC = () => {
  return (
    <div className="space-y-16 w-full min-h-screen pb-16">
      {/* Hero Section */}
      <HeroSection />
      {/* Services Section */}
      <Services />
      {/* Top Search Section */}
      <TopSearch />
      {/* Promotion Carousel Section */}
      <PromoCarousel />
    </div>
  );
};
export default Home;
