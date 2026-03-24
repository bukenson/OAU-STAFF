import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import ProfileSkeleton from "@/components/profile/ProfileSkeleton";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { LogOut, Save, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProfilePhotoSection from "@/components/profile/ProfilePhotoSection";
import BasicInfoSection from "@/components/profile/BasicInfoSection";

import ArrayFieldSection from "@/components/profile/ArrayFieldSection";
import ProfileLinksSection from "@/components/profile/ProfileLinksSection";
import RichTextSection from "@/components/profile/RichTextSection";
import ChipInput from "@/components/profile/ChipInput";
import { sanitizeText, sanitizeUrl } from "@/lib/sanitize";

const FACULTIES = [
  "Administration", "Agriculture", "Arts", "Basic Medical Sciences",
  "Clinical Sciences", "Dentistry", "Education", "Environmental Design and Management",
  "Law", "Pharmacy", "Science", "Social Sciences", "Technology",
];

const ACADEMIC_RANKS = [
  "Graduate Assistant", "Assistant Lecturer", "Lecturer II", "Lecturer I",
  "Senior Lecturer", "Reader/Associate Professor", "Professor",
];

const STATUS_OPTIONS = ["Active", "On Leave", "Contract", "Sabbatical", "Retired"];

export type StaffCategory = "academic" | "non-academic";

export interface ProfileForm {
  name: string;
  email: string;
  phone: string;
  faculty: string;
  department: string;
  status_availability: string;
  staff_category: StaffCategory;
  rank: string;
  qualifications: string[];
  specializations: string[];
  publication_link: string[];
  research_interests: string[];
  office_location: string;
  bio: string;
  publications: string[];
  conferences: string[];
  image_url: string;
}

const emptyForm: ProfileForm = {
  name: "", email: "", phone: "", faculty: "", department: "",
  status_availability: "Active", staff_category: "academic", rank: "",
  qualifications: [], specializations: [], publication_link: [],
  research_interests: [], office_location: "", bio: "",
  publications: [], conferences: [], image_url: "",
};

const MyProfile = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState<ProfileForm>(emptyForm);
  const [existingId, setExistingId] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [redirected, setRedirected] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const redirectToAuth = useCallback(() => {
    if (!redirected) {
      setRedirected(true);
      navigate("/auth");
    }
  }, [navigate, redirected]);

  useEffect(() => {
    if (!authLoading && !user) {
      redirectToAuth();
    }
  }, [authLoading, user, redirectToAuth]);

  const loadedForUser = useRef<string | null>(null);

  useEffect(() => {
    if (!user || loadedForUser.current === user.id) return;
    loadedForUser.current = user.id;
    setLoadingProfile(true);
    setProfileError(null);

    const load = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from("staff_members")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (fetchError) {
          console.error("Error fetching profile:", fetchError);
          setProfileError(fetchError.message);
          throw fetchError;
        }

        let profileData = data;

        if (!profileData && user.email) {
          try {
            const { data: claimResult, error: claimError } = await supabase.functions.invoke("claim-profile");
            if (!claimError && claimResult?.claimed) {
              const { data: claimed, error: claimedFetchError } = await supabase
                .from("staff_members")
                .select("*")
                .eq("id", claimResult.id)
                .single();
              
              if (!claimedFetchError && claimed) {
                profileData = claimed;
                toast({ title: "Profile found!", description: "Your existing staff profile has been linked to your account." });
              }
            }
          } catch (claimErr) {
            console.error("Claim function error:", claimErr);
          }
        }

        if (profileData) {
          setExistingId(profileData.id);
          const isAcademic = ACADEMIC_RANKS.includes(profileData.rank ?? "");
          setForm({
            name: profileData.name || "",
            email: profileData.email ?? user.email ?? "",
            phone: profileData.phone ?? "",
            faculty: profileData.faculty || "",
            department: profileData.department || "",
            status_availability: profileData.status_availability ?? "Active",
            staff_category: isAcademic ? "academic" : (profileData.rank ? "non-academic" : "academic"),
            rank: profileData.rank ?? "",
            qualifications: profileData.qualifications ?? [],
            specializations: profileData.specializations ?? [],
            publication_link: profileData.publication_link ?? [],
            research_interests: profileData.research_interests ?? [],
            office_location: profileData.office_location ?? "",
            bio: profileData.bio ?? "",
            publications: profileData.publications ?? [],
            conferences: profileData.conferences ?? [],
            image_url: profileData.image_url ?? "",
          });
        } else {
          setForm({ ...emptyForm, email: user.email ?? "" });
        }
      } catch (err) {
        console.error("Error loading profile:", err);
        const message = err instanceof Error ? err.message : "Failed to load profile";
        setProfileError(message);
        toast({
          title: "Error loading profile",
          description: message,
          variant: "destructive",
        });
      } finally {
        setLoadingProfile(false);
      }
    };
    load();
  }, [user, toast]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    const sanitizedLinks = form.publication_link
      .map(link => sanitizeUrl(link.trim()))
      .filter(Boolean);

    const payload = {
      user_id: user.id,
      name: sanitizeText(form.name.trim()),
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      faculty: form.faculty,
      department: sanitizeText(form.department.trim()),
      status_availability: form.status_availability || "Active",
      rank: form.rank || null,
      qualifications: form.qualifications.length ? form.qualifications.map(q => sanitizeText(q.trim())) : null,
      specializations: form.specializations.length ? form.specializations.map(s => sanitizeText(s.trim())) : null,
      publication_link: sanitizedLinks.length ? sanitizedLinks : null,
      research_interests: form.research_interests.length ? form.research_interests.map(r => sanitizeText(r.trim())) : null,
      office_location: form.office_location.trim() || null,
      bio: form.bio.trim() || null,
      publications: form.publications.length ? form.publications : null,
      conferences: form.conferences.length ? form.conferences : null,
      image_url: form.image_url.trim() || null,
    };

    let error;
    const isNewProfile = !existingId;
    if (existingId) {
      ({ error } = await supabase.from("staff_members").update(payload).eq("id", existingId));
    } else {
      const res = await supabase.from("staff_members").insert(payload).select("id").single();
      error = res.error;
      if (res.data) setExistingId(res.data.id);
    }

    if (error) {
      toast({ title: "Error saving profile", description: error.message, variant: "destructive" });
    } else {
      toast({ title: isNewProfile ? "🎉 Profile created!" : "Profile saved!" });
      if (isNewProfile) {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#1b5e20", "#4caf50", "#81c784", "#ffb300", "#fff"],
        });
      }
      queryClient.invalidateQueries({ queryKey: ["staff-stats"] });
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      // Redirect to home page
      setTimeout(() => navigate("/"), 1200);
    }
    setSaving(false);
  };

  const updateForm = (updates: Partial<ProfileForm>) => setForm(f => ({ ...f, ...updates }));

  const addToArray = (field: keyof ProfileForm, value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setForm(f => ({ ...f, [field]: [...(f[field] as string[]), trimmed] }));
  };

  const removeFromArray = (field: keyof ProfileForm, index: number) => {
    setForm(f => ({ ...f, [field]: (f[field] as string[]).filter((_, i) => i !== index) }));
  };

  if (authLoading || loadingProfile) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <section className="flex-1 bg-background">
          <ProfileSkeleton />
        </section>
        <Footer />
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <section className="flex-1 flex items-center justify-center bg-background px-4">
          <div className="text-center max-w-md">
            <h2 className="text-xl font-bold text-destructive mb-2">Failed to Load Profile</h2>
            <p className="text-muted-foreground mb-4">{profileError}</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
              <Button variant="outline" onClick={() => navigate("/")}>
                Go Home
              </Button>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <section className="flex-1 pt-24 pb-16 bg-background">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Header */}
            <div className="bg-primary text-primary-foreground text-center py-4 rounded-t-xl mb-0">
              <h1 className="font-display text-xl font-bold">
                {existingId ? "Edit Your Staff Profile" : "Create Your Staff Profile"}
              </h1>
              <p className="text-primary-foreground/80 text-sm mt-1">
                {existingId ? "Keep your profile information up to date" : "Fill in your details to set up your staff profile"}
              </p>
            </div>

            <form onSubmit={handleSave} className="bg-card border border-border border-t-0 rounded-b-xl p-6 sm:p-8 space-y-6">
              {/* Sign out link */}
              <div className="flex items-center justify-between">
                {existingId && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={`/staff/${existingId}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink size={16} /> View Public Profile
                    </a>
                  </Button>
                )}
                <div className="ml-auto">
                  <Button variant="ghost" size="sm" onClick={() => { signOut(); navigate("/"); }}>
                    <LogOut size={16} /> Sign Out
                  </Button>
                </div>
              </div>

              {/* Photo Upload */}
              <ProfilePhotoSection
                imageUrl={form.image_url}
                userName={form.name}
                userId={user?.id}
                onImageChange={(url) => updateForm({ image_url: url })}
              />

              {/* Name */}
              <BasicInfoSection
                form={form}
                updateForm={updateForm}
                faculties={FACULTIES}
                academicRanks={ACADEMIC_RANKS}
                statusOptions={STATUS_OPTIONS}
              />

              {/* Academic Qualifications */}
              <ArrayFieldSection
                label="Academic Qualifications"
                items={form.qualifications}
                placeholder="Enter a qualification (e.g., PhD in Computer Science)"
                buttonLabel="Add More Qualifications"
                onAdd={(val) => addToArray("qualifications", val)}
                onRemove={(i) => removeFromArray("qualifications", i)}
              />

              {/* Area(s) of Specialization */}
              <ArrayFieldSection
                label="Area(s) of Specialization"
                items={form.specializations}
                placeholder="Enter a specialization (e.g., Artificial Intelligence)"
                buttonLabel="Add More Specializations"
                onAdd={(val) => addToArray("specializations", val)}
                onRemove={(i) => removeFromArray("specializations", i)}
              />

              {/* Profile Links */}
              <ProfileLinksSection
                links={form.publication_link}
                onAdd={(val) => addToArray("publication_link", val)}
                onRemove={(i) => removeFromArray("publication_link", i)}
              />

              {/* Research Interest */}
              <ChipInput
                label="Research Interest"
                items={form.research_interests}
                placeholder="e.g., Machine Learning"
                onAdd={(val) => addToArray("research_interests", val)}
                onRemove={(i) => removeFromArray("research_interests", i)}
              />

              {/* Office Address */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-primary">Office Address</label>
                <input
                  className="w-full border border-input bg-background rounded-md px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  value={form.office_location}
                  onChange={(e) => updateForm({ office_location: e.target.value })}
                  placeholder="Office Location"
                />
              </div>

              {/* Career Summary/Bio */}
              <RichTextSection
                label="Career Summary/Bio (Make use of Bold, Italics, Underline for standout information)"
                value={form.bio}
                onChange={(val) => updateForm({ bio: val })}
                placeholder="Enter your career summary here"
              />

              {/* Publications */}
              <RichTextSection
                label="Publications (You can make it an ordered or unordered list)"
                value={form.publications.join("\n")}
                onChange={(val) => updateForm({ publications: val.split("\n").filter(Boolean) })}
                placeholder="Enter your publications"
              />

              {/* Journal/Workshops/Conferences */}
              <RichTextSection
                label="Journal/Workshops/Conferences (List your Journal/Workshops/Conferences attended in Last five (5) years.)"
                value={form.conferences.join("\n")}
                onChange={(val) => updateForm({ conferences: val.split("\n").filter(Boolean) })}
                placeholder="Enter your Journals, Articles, conferences attended in last 5 years"
              />

              {/* Submit */}
              <Button type="submit" size="lg" className="w-full" disabled={saving}>
                <Save size={18} />
                {saving ? "Saving..." : (existingId ? "Save Changes" : "Create Profile")}
              </Button>
            </form>
          </motion.div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default MyProfile;
