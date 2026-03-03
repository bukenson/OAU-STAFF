import { motion } from "framer-motion";
import { Building2, GitBranch, GraduationCap, Users } from "lucide-react";

const stats = [
  { icon: Building2, value: 14, label: "Faculties" },
  { icon: GitBranch, value: 118, label: "Departments" },
  { icon: GraduationCap, value: 16, label: "Professors" },
  { icon: Users, value: 31, label: "Total Staff" },
];

const StatsSection = () => {
  return (
    <section className="bg-stats-bg py-12">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="text-center"
          >
            <stat.icon className="mx-auto mb-3 text-accent" size={28} strokeWidth={1.5} />
            <p className="font-display text-3xl sm:text-4xl font-bold text-primary-foreground">
              {stat.value}
            </p>
            <p className="text-primary-foreground/60 text-sm mt-1 tracking-wide">
              {stat.label}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default StatsSection;
