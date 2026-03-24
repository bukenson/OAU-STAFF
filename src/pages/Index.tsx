import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import StatsSection from "@/components/StatsSection";
import FeaturedStaff from "@/components/FeaturedStaff";
import Footer from "@/components/Footer";

const Index = () => {
  const navigate = useNavigate();

  const handleSearch = (query: string, filter: string) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (filter && filter !== "all") params.set("filter", filter);
    navigate(`/staff?${params.toString()}`);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection onSearch={handleSearch} />
      <StatsSection />
      <FeaturedStaff />
      <Footer />
    </div>
  );
};

export default Index;
