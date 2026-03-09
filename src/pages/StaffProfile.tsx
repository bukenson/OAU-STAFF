import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, MapPin, GraduationCap, BookOpen, FlaskConical, LogIn, Pencil } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useStaffProfile } from "@/hooks/useStaff";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

const StaffProfile = () => {
  const { id } = useParams<{ id: string }>();
  const { data: staff, isLoading, error } = useStaffProfile(id);
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Determine if the logged-in user owns this profile
  const isOwner = user && staff?.user_id === user.id;
  // Show claim button if: profile has no user_id, user is not logged in or logged in but doesn't own it
  const canClaim = staff && !staff.user_id && !isOwner;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <section className="pt-24 pb-16 bg-primary">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/staff"
            className="inline-flex items-center gap-2 text-primary-foreground/60 hover:text-accent text-sm mb-8 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Staff List
          </Link>

          {isLoading ? (
            <div className="flex flex-col sm:flex-row gap-8">
              <Skeleton className="w-40 h-40 rounded-xl shrink-0" />
              <div className="space-y-3 flex-1">
                <Skeleton className="h-8 w-2/3" />
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-5 w-1/2" />
              </div>
            </div>
          ) : !staff ? (
            <div className="text-center py-12">
              <h2 className="font-display text-2xl font-bold text-primary-foreground mb-2">
                Staff member not found
              </h2>
              <Link to="/staff" className="text-accent hover:text-accent/80 text-sm">
                Return to staff list
              </Link>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col sm:flex-row gap-8"
            >
              <div className="w-44 h-56 rounded-xl overflow-hidden shrink-0 border-2 border-accent/30 bg-muted">
                {staff.image_url ? (
                  <img
                    src={staff.image_url}
                    alt={staff.name}
                    className="w-full h-full object-cover object-top"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary-foreground/10">
                    <span className="font-display text-5xl font-bold text-primary-foreground/30">
                      {staff.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <h1 className="font-display text-3xl sm:text-4xl font-bold text-primary-foreground mb-2">
                  {staff.name}
                </h1>
                {staff.rank && (
                  <span className="inline-block bg-accent text-accent-foreground text-sm font-semibold px-3 py-1 rounded-full mb-3">
                    {staff.rank}
                  </span>
                )}
                <p className="text-primary-foreground/70 text-lg">
                  Faculty of {staff.faculty} · {staff.department}
                </p>
                {staff.office_location && (
                  <p className="text-primary-foreground/50 text-sm mt-2 flex items-center gap-2">
                    <MapPin size={14} />
                    {staff.office_location}
                  </p>
                )}
                {/* Claim / Edit button */}
                {isOwner && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="mt-4"
                    onClick={() => navigate("/my-profile")}
                  >
                    <Pencil size={14} />
                    Edit Your Profile
                  </Button>
                )}
                {/* Claim button hidden for now */}
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {staff && (
        <section className="flex-1 py-12 bg-background">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main content */}
              <div className="lg:col-span-2 space-y-10">
                {/* Bio */}
                {staff.bio && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <h2 className="font-display text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                      <BookOpen size={20} className="text-accent" />
                      Biography
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">{staff.bio}</p>
                  </motion.div>
                )}

                {/* Research Interests */}
                {staff.research_interests && staff.research_interests.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h2 className="font-display text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                      <FlaskConical size={20} className="text-accent" />
                      Research Interests
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {staff.research_interests.map((interest) => (
                        <span
                          key={interest}
                          className="bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full text-sm font-medium"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Publications */}
                {staff.publications && staff.publications.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h2 className="font-display text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                      <BookOpen size={20} className="text-accent" />
                      Publications
                    </h2>
                    <ul className="space-y-3">
                      {staff.publications.map((pub, i) => (
                        <li
                          key={i}
                          className="flex gap-3 text-muted-foreground text-sm leading-relaxed"
                        >
                          <span className="text-accent font-semibold shrink-0">{i + 1}.</span>
                          {pub}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}

                {/* Empty state when no details */}
                {!staff.bio && (!staff.publications || staff.publications.length === 0) && (
                  <div className="text-center py-12 text-muted-foreground">
                    <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
                    <p>No additional details available for this staff member yet.</p>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Contact Card */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="bg-card rounded-xl border border-border p-6"
                >
                  <h3 className="font-display text-lg font-semibold text-card-foreground mb-4">
                    Contact Information
                  </h3>
                  <div className="space-y-3">
                    {staff.email ? (
                      <a
                        href={`mailto:${staff.email}`}
                        className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Mail size={16} className="text-accent shrink-0" />
                        <span className="truncate">{staff.email}</span>
                      </a>
                    ) : (
                      <p className="flex items-center gap-3 text-sm text-muted-foreground/50">
                        <Mail size={16} className="shrink-0" />
                        Not available
                      </p>
                    )}
                    {staff.office_location && (
                      <p className="flex items-center gap-3 text-sm text-muted-foreground">
                        <MapPin size={16} className="text-accent shrink-0" />
                        {staff.office_location}
                      </p>
                    )}
                  </div>
                </motion.div>

                {/* Qualifications Card */}
                {staff.qualifications && staff.qualifications.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="bg-card rounded-xl border border-border p-6"
                  >
                    <h3 className="font-display text-lg font-semibold text-card-foreground mb-4 flex items-center gap-2">
                      <GraduationCap size={18} className="text-accent" />
                      Qualifications
                    </h3>
                    <ul className="space-y-2">
                      {staff.qualifications.map((q, i) => (
                        <li
                          key={i}
                          className="text-sm text-muted-foreground flex items-start gap-2"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                          {q}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default StaffProfile;
