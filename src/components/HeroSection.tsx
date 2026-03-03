import { useState } from "react";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import heroImage from "@/assets/oau-campus-hero.jpg";

interface HeroSectionProps {
  onSearch: (query: string, filter: string) => void;
}

const HeroSection = ({ onSearch }: HeroSectionProps) => {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query, filter);
  };

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/60 to-primary/90" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-accent font-medium tracking-[0.3em] uppercase text-sm mb-4">
            Obafemi Awolowo University, Ile-Ife
          </p>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-primary-foreground leading-tight mb-6 text-balance">
            Staff Directory
          </h1>
          <p className="text-primary-foreground/70 text-lg sm:text-xl max-w-2xl mx-auto mb-10 font-light">
            Find staff by name, faculty, department, and rank across all 13 faculties
          </p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto"
        >
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-card/10 backdrop-blur-md border border-primary-foreground/20 text-primary-foreground rounded-lg px-4 py-3.5 text-sm font-body focus:outline-none focus:ring-2 focus:ring-accent sm:w-40"
          >
            <option value="all" className="text-foreground">All</option>
            <option value="name" className="text-foreground">Name</option>
            <option value="department" className="text-foreground">Department</option>
            <option value="faculty" className="text-foreground">Faculty</option>
          </select>

          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for staff..."
              className="w-full bg-card/10 backdrop-blur-md border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40 rounded-lg pl-4 pr-12 py-3.5 text-sm font-body focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-accent hover:bg-accent/90 text-accent-foreground rounded-md p-2 transition-colors"
            >
              <Search size={18} />
            </button>
          </div>
        </motion.form>
      </div>
    </section>
  );
};

export default HeroSection;
