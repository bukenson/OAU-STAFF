import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import StatsSection from "@/components/StatsSection";
import FeaturedStaff from "@/components/FeaturedStaff";
import FacultiesSection from "@/components/FacultiesSection";
import Footer from "@/components/Footer";

const Index = () => {
  const handleSearch = (query: string, filter: string) => {
    console.log("Search:", query, "Filter:", filter);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection onSearch={handleSearch} />
      <StatsSection />
      <FeaturedStaff />
      <FacultiesSection />
      <Footer />
    </div>
  );
};

export default Index;
