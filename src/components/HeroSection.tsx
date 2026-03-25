import { useState, useEffect, useCallback, useRef } from "react";
import { Search, ChevronDown } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import heroImage from "@/assets/oau-campus-hero.jpg";
import heroNightImage from "@/assets/oau-campus-hero-night.jpg";

const WORDS = ["Staff Directory", "Faculty Finder", "Department Search", "Academic Lookup"];
const TYPING_SPEED = 120;
const DELETE_SPEED = 60;
const PAUSE_AFTER_TYPE = 2000;
const HERO_SLIDES = [heroImage, heroNightImage];
const SLIDE_INTERVAL = 6000;

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
  const [imageLoaded, setImageLoaded] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);
  const { display: typedText, opacity: textOpacity } = useTypingEffect(WORDS);

  useEffect(() => {
    let loadedCount = 0;

    HERO_SLIDES.forEach((slide) => {
      const img = new Image();
      img.src = slide;
      img.onload = () => {
        loadedCount += 1;
        if (loadedCount === HERO_SLIDES.length) {
          setImageLoaded(true);
        }
      };
    });
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % HERO_SLIDES.length);
    }, SLIDE_INTERVAL);

    return () => window.clearInterval(intervalId);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query, filter);
  };

  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 600], [0, 150]);
  const overlayOpacity = useTransform(scrollY, [0, 400], [0.85, 1]);

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {HERO_SLIDES.map((slide, index) => (
        <motion.div
          key={slide}
          className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          style={{
            backgroundImage: `url(${slide})`,
            backgroundPosition: "center 40%",
            y: bgY,
            opacity: activeSlide === index ? 1 : 0,
          }}
        />
      ))}
      {!imageLoaded && (
        <div className="absolute inset-0 bg-primary animate-pulse" />
      )}
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
            className="bg-white text-foreground border border-border rounded-lg px-4 py-3.5 text-sm font-body focus:outline-none focus:ring-2 focus:ring-accent sm:w-40"
          >
            <option value="all" className="text-foreground">All</option>
            <option value="name" className="text-foreground">Name</option>
            <option value="department" className="text-foreground">Department</option>
            <option value="faculty" className="text-foreground">Faculty</option>
            <option value="email" className="text-foreground">Email</option>
            <option value="rank" className="text-foreground">Rank</option>
            <option value="interest" className="text-foreground">Area of Interest</option>
          </select>

          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for staff..."
              className="w-full bg-white text-foreground placeholder:text-muted-foreground border border-border rounded-lg pl-4 pr-12 py-3.5 text-sm font-body focus:outline-none focus:ring-2 focus:ring-accent"
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

      <div className="absolute bottom-20 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2">
        {HERO_SLIDES.map((slide, index) => (
          <button
            key={slide}
            type="button"
            onClick={() => setActiveSlide(index)}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              activeSlide === index
                ? "w-8 bg-accent"
                : "w-2.5 bg-primary-foreground/45 hover:bg-primary-foreground/70"
            }`}
            aria-label={`Show hero slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
