import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Building2, GitBranch, GraduationCap, Users } from "lucide-react";
import { useStaffStats, useStaffRealtime } from "@/hooks/useStaff";

const icons = [Building2, GitBranch, GraduationCap, Users];
const labels = ["Faculties", "Departments", "Professors", "Total Staff"];

const DURATION = 1200; // ms
const FRAME_MS = 16;

function AnimatedNumber({ value }: { value: number | string }) {
  const [display, setDisplay] = useState(typeof value === "number" ? value : 0);
  const prevRef = useRef(typeof value === "number" ? value : 0);

  useEffect(() => {
    if (typeof value !== "number") return;
    const from = prevRef.current;
    const to = value;
    prevRef.current = to;
    if (from === to) {
      setDisplay(to);
      return;
    }

    const totalFrames = Math.round(DURATION / FRAME_MS);
    let frame = 0;

    const timer = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (frame >= totalFrames) {
        clearInterval(timer);
        setDisplay(to);
      }
    }, FRAME_MS);

    return () => clearInterval(timer);
  }, [value]);

  if (typeof value === "string") return <>{value}</>;
  return <>{display.toLocaleString()}</>;
}

const StatsSection = () => {
  useStaffRealtime();
  const { data } = useStaffStats();

  const values: (number | string)[] = data
    ? [14, 97, 400, data.totalStaff]
    : [14, 97, 400, "—"];

  return (
    <section className="bg-stats-bg py-12">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
        {values.map((value, i) => {
          const Icon = icons[i];
          return (
            <motion.div
              key={labels[i]}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <Icon className="mx-auto mb-3 text-accent" size={28} strokeWidth={1.5} />
              <p className="font-display text-3xl sm:text-4xl font-bold text-primary-foreground">
                <AnimatedNumber value={value} />
              </p>
              <p className="text-primary-foreground/60 text-sm mt-1 tracking-wide">
                {labels[i]}
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default StatsSection;
