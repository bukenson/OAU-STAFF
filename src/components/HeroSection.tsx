import { useState, useEffect, useCallback } from "react";
import { Search, ChevronDown } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import heroImage from "@/assets/oau-campus-hero.jpg";

const WORDS = ["Staff Directory", "Faculty Finder", "Department Search", "Academic Lookup"];
const TYPING_SPEED = 120;
const DELETE_SPEED = 60;
const PAUSE_AFTER_TYPE = 2000;
const PAUSE_AFTER_DELETE = 500;

const useTypingEffect = (words: string[]) => {
  const [display, setDisplay] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const current = words[wordIndex];

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setOpacity(1);
        setDisplay(current.slice(0, display.length + 1));
        if (display.length + 1 === current.length) {
          setTimeout(() => {
            setOpacity(0);
            setTimeout(() => setIsDeleting(true), 300);
          }, PAUSE_AFTER_TYPE);
          return;
        }
      } else {
        setDisplay(current.slice(0, display.length - 1));
        if (display.length - 1 === 0) {
          setIsDeleting(false);
          setWordIndex((prev) => (prev + 1) % words.length);
          return;
        }
      }
    }, isDeleting ? DELETE_SPEED : TYPING_SPEED);

    return () => clearTimeout(timeout);
  }, [display, isDeleting, wordIndex, words]);

  return { display, opacity };
};

interface HeroSectionProps {
  onSearch: (query: string, filter: string) => void;
}

const HeroSection = ({ onSearch }: HeroSectionProps) => {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const { display: typedText, opacity: textOpacity } = useTypingEffect(WORDS);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query, filter);
  };

    const { scrollY } = useScroll();
    const bgY = useTransform(scrollY, [0, 600], [0, 150]);
    const overlayOpacity = useTransform(scrollY, [0, 400], [0.85, 1]);

    return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})`, backgroundPosition: "center 40%", y: bgY }}
      />
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-primary/85 via-primary/70 to-primary/95"
        style={{ opacity: overlayOpacity }}
      />

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
            <span style={{ opacity: textOpacity, transition: "opacity 0.3s ease-in-out" }}>{typedText}</span><span className="animate-pulse">|</span>
          </h1>
          <p className="text-primary-foreground text-lg sm:text-xl max-w-2xl mx-auto mb-10 font-semibold">
            Find staff by name, faculty, department, and rank across all 14 faculties
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

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <ChevronDown size={28} className="text-primary-foreground/50" />
      </motion.div>
    </section>
  );
};

export default HeroSection;
