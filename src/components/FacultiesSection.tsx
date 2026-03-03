import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

const faculties = [
  "Agriculture",
  "Art",
  "Basic Medical Sciences",
  "Clinical Sciences",
  "Dentistry",
  "EDM",
  "Education",
  "Law",
  "Pharmacy",
  "Science",
  "Social Sciences",
  "Technology",
  "Administration",
];

const FacultiesSection = () => {
  return (
    <section id="faculties" className="py-20 bg-muted/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-accent font-medium tracking-[0.2em] uppercase text-sm mb-3">
            Browse By
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
            Faculties
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {faculties.map((faculty, i) => (
            <motion.a
              key={faculty}
              href="#"
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.03 }}
              className="group flex items-center justify-between bg-card border border-border rounded-lg px-5 py-4 hover:border-accent/50 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-accent" />
                <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                  Faculty of {faculty}
                </span>
              </div>
              <ChevronRight
                size={18}
                className="text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all"
              />
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FacultiesSection;
