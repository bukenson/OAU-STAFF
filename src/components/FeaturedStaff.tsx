import { Link } from "react-router-dom";
import StaffCard from "./StaffCard";
import { useStaff } from "@/hooks/useStaff";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

const FeaturedStaff = () => {
  const { data: staff, isLoading } = useStaff();
  const allStaff = staff ?? [];
  // Recently added: first 8 from the query (already sorted by created_at desc)
  const recentlyAdded = allStaff.slice(0, 4);
  // Featured: prioritize those with images
  const sorted = [...allStaff].sort((a, b) => {
    const aHas = a.image ? 0 : 1;
    const bHas = b.image ? 0 : 1;
    return aHas - bHas;
  });
  const featured = sorted.slice(0, 16);

  return (
    <>
      {/* Recently Added Staff */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-accent font-medium tracking-[0.2em] uppercase text-sm mb-3">
              New Additions
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
              Recently Added Staff
            </h2>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-card rounded-xl border border-border overflow-hidden">
                  <Skeleton className="aspect-[3/4] w-full" />
                  <div className="p-5 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6"
            >
              {recentlyAdded.map((s, i) => (
                <StaffCard key={s.id || s.name + i} staff={s} index={i} />
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Featured Staff */}
      <section id="staff" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-accent font-medium tracking-[0.2em] uppercase text-sm mb-3">
              Our People
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
              Featured Staff
            </h2>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-card rounded-xl border border-border overflow-hidden">
                  <Skeleton className="aspect-[3/4] w-full" />
                  <div className="p-5 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6"
            >
              {featured.map((s, i) => (
                <StaffCard key={s.id || s.name + i} staff={s} index={i} />
              ))}
            </motion.div>
          )}

          <div className="text-center mt-10">
            <Link
              to="/staff"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors"
            >
              View All Staff →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default FeaturedStaff;
