import { motion } from "framer-motion";
import { Mail, Phone } from "lucide-react";
import { Link } from "react-router-dom";

export interface StaffMember {
  id?: string;
  name: string;
  faculty: string;
  department: string;
  email?: string;
  phone?: string;
  status?: string;
  image?: string;
}

interface StaffCardProps {
  staff: StaffMember;
  index: number;
  featured?: boolean;
}

const StaffCard = ({ staff, index, featured = false }: StaffCardProps) => {
  const cardContent = (
    <motion.div
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className={`group bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${
        featured ? "" : ""
      }`}
    >
      <div className="relative h-48 bg-muted overflow-hidden">
        {staff.image ? (
          <img
            src={staff.image}
            alt={staff.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary/10">
            <span className="font-display text-4xl font-bold text-primary/30">
              {staff.name.charAt(0)}
            </span>
          </div>
        )}
        {staff.status && (
          <span className="absolute top-3 right-3 bg-accent text-accent-foreground text-xs font-semibold px-2.5 py-1 rounded-full">
            {staff.status}
          </span>
        )}
      </div>

      <div className="p-5">
        <h3 className="font-display text-lg font-semibold text-card-foreground mb-1 line-clamp-1">
          {staff.name}
        </h3>
        <p className="text-sm text-accent font-medium mb-2">{staff.faculty}</p>
        <p className="text-sm text-muted-foreground mb-4">{staff.department}</p>

        {featured && (
          <div className="space-y-2 pt-3 border-t border-border">
            {staff.email && (
              <a
                href={`mailto:${staff.email}`}
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                <Mail size={14} />
                <span className="truncate">{staff.email}</span>
              </a>
            )}
            {staff.phone && (
              <a
                href={`tel:${staff.phone}`}
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                <Phone size={14} />
                <span>{staff.phone}</span>
              </a>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StaffCard;
