import { motion } from "framer-motion";
import { Building2, GitBranch, GraduationCap, Users } from "lucide-react";
import { useStaffStats } from "@/hooks/useStaff";

const icons = [Building2, GitBranch, GraduationCap, Users];
const labels = ["Faculties", "Departments", "Professors", "Total Staff"];

const StatsSection = () => {
  const { data } = useStaffStats();

  const values = data
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
                {value}
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
