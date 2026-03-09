import React, { useState } from "react";
import { Mail } from "lucide-react";
import { Link } from "react-router-dom";

export interface StaffMember {
  id?: string;
  name: string;
  faculty: string;
  department: string;
  email?: string;
  status?: string;
  image?: string;
  research_interests?: string[];
}

interface StaffCardProps {
  staff: StaffMember;
  index: number;
}

const StaffCard = React.memo(({ staff }: StaffCardProps) => {
  const [imgError, setImgError] = useState(false);

  const card = (
    <div className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="relative aspect-[3/4] bg-muted overflow-hidden">
        {staff.image && !imgError ? (
          <img
            src={staff.image}
            alt={staff.name}
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary/10">
            <span className="font-display text-5xl font-bold text-primary/30">
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
        <p className="text-sm text-muted-foreground mb-3">{staff.department}</p>

        {staff.research_interests && staff.research_interests.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {staff.research_interests.slice(0, 3).map((interest) => (
              <span
                key={interest}
                className="bg-accent/10 text-accent text-[10px] font-medium px-2 py-0.5 rounded-full leading-tight"
              >
                {interest}
              </span>
            ))}
            {staff.research_interests.length > 3 && (
              <span className="text-muted-foreground text-[10px] font-medium px-1.5 py-0.5">
                +{staff.research_interests.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="pt-3 border-t border-border">
          {staff.email && (
            <span className="flex items-center gap-2 text-xs text-muted-foreground">
              <Mail size={14} />
              <span className="truncate">{staff.email}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );

  if (staff.id) {
    return (
      <Link to={`/staff/${staff.id}`} className="block">
        {card}
      </Link>
    );
  }

  return card;
});

StaffCard.displayName = "StaffCard";

export default StaffCard;
