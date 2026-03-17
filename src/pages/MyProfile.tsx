import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { LogOut, Save, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProfilePhotoSection from "@/components/profile/ProfilePhotoSection";
import BasicInfoSection from "@/components/profile/BasicInfoSection";

import ArrayFieldSection from "@/components/profile/ArrayFieldSection";
import ProfileLinksSection from "@/components/profile/ProfileLinksSection";
import RichTextSection from "@/components/profile/RichTextSection";

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

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      let { data } = await supabase
        .from("staff_members")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!data && user.email) {
        const { data: claimResult, error: claimError } = await supabase.functions.invoke("claim-profile");
        if (!claimError && claimResult?.claimed) {
          const { data: claimed } = await supabase
            .from("staff_members")
            .select("*")
            .eq("id", claimResult.id)
            .single();
          if (claimed) {
            data = claimed;
            toast({ title: "Profile found!", description: "Your existing staff profile has been linked to your account." });
          }
        }
      }

      if (data) {
        setExistingId(data.id);
        const isAcademic = ACADEMIC_RANKS.includes(data.rank ?? "");
        setForm({
          name: data.name,
          email: data.email ?? user.email ?? "",
          phone: data.phone ?? "",
          faculty: data.faculty,
          department: data.department,
          status_availability: (data as any).status_availability ?? "Active",
          staff_category: isAcademic ? "academic" : (data.rank ? "non-academic" : "academic"),
          rank: data.rank ?? "",
          qualifications: data.qualifications ?? [],
          specializations: (data as any).specializations ?? [],
          publication_link: data.publication_link ?? [],
          research_interests: data.research_interests ?? [],
          office_location: data.office_location ?? "",
          bio: data.bio ?? "",
          publications: data.publications ?? [],
          conferences: (data as any).conferences ?? [],
          image_url: data.image_url ?? "",
        });
      } else {
        setForm({ ...emptyForm, email: user.email ?? "" });
      }
      setLoadingProfile(false);
    };
    load();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    const payload = {
      user_id: user.id,
      name: form.name.trim(),
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      faculty: form.faculty,
      department: form.department.trim(),
      status_availability: form.status_availability || "Active",
      rank: form.rank || null,
      qualifications: form.qualifications.length ? form.qualifications : null,
      specializations: form.specializations.length ? form.specializations : null,
      publication_link: form.publication_link.length ? form.publication_link : null,
      research_interests: form.research_interests.length ? form.research_interests : null,
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
        <section className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground text-sm">Loading your profile…</p>
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
                {existingId ? "Welcome back!" : "Create Your Profile"}
              </h1>
              <p className="text-primary-foreground/80 text-sm mt-1">
                {existingId ? "Update your staff profile details below" : "Fill in your details to set up your staff profile"}
              </p>
            </div>

            <form onSubmit={handleSave} className="bg-card border border-border border-t-0 rounded-b-xl p-6 sm:p-8 space-y-6">
              {/* Sign out link */}
              <div className="flex justify-end">
                <Button variant="ghost" size="sm" onClick={() => { signOut(); navigate("/"); }}>
                  <LogOut size={16} /> Sign Out
                </Button>
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
              <div className="space-y-2">
                <label className="text-sm font-semibold text-primary">Research Interest</label>
                <input
                  className="w-full border border-input bg-background rounded-md px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  value={form.research_interests.join(", ")}
                  onChange={(e) => updateForm({ research_interests: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
                  placeholder="Research Interest"
                />
              </div>

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
                {saving ? "Saving…" : "Submit"}
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
