import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Plus, X, Save, LogOut } from "lucide-react";

const FACULTIES = [
  "Administration", "Agriculture", "Arts", "Basic Medical Sciences",
  "Clinical Sciences", "Dentistry", "Education", "Environmental Design and Management",
  "Law", "Pharmacy", "Science", "Social Sciences", "Technology",
];

const RANKS = [
  "Graduate Assistant", "Assistant Lecturer", "Lecturer II", "Lecturer I",
  "Senior Lecturer", "Reader/Associate Professor", "Professor",
];

interface ProfileForm {
  name: string;
  faculty: string;
  department: string;
  rank: string;
  email: string;
  phone: string;
  office_location: string;
  bio: string;
  image_url: string;
  qualifications: string[];
  research_interests: string[];
  publications: string[];
}

const emptyForm: ProfileForm = {
  name: "", faculty: "", department: "", rank: "", email: "", phone: "",
  office_location: "", bio: "", image_url: "",
  qualifications: [], research_interests: [], publications: [],
};

const MyProfile = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form, setForm] = useState<ProfileForm>(emptyForm);
  const [existingId, setExistingId] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);

  // Temp inputs for array fields
  const [newQualification, setNewQualification] = useState("");
  const [newInterest, setNewInterest] = useState("");
  const [newPublication, setNewPublication] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("staff_members")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        setExistingId(data.id);
        setForm({
          name: data.name,
          faculty: data.faculty,
          department: data.department,
          rank: data.rank ?? "",
          email: data.email ?? user.email ?? "",
          phone: data.phone ?? "",
          office_location: data.office_location ?? "",
          bio: data.bio ?? "",
          image_url: data.image_url ?? "",
          qualifications: data.qualifications ?? [],
          research_interests: data.research_interests ?? [],
          publications: data.publications ?? [],
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
      faculty: form.faculty,
      department: form.department.trim(),
      rank: form.rank || null,
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      office_location: form.office_location.trim() || null,
      bio: form.bio.trim() || null,
      image_url: form.image_url.trim() || null,
      qualifications: form.qualifications.length ? form.qualifications : null,
      research_interests: form.research_interests.length ? form.research_interests : null,
      publications: form.publications.length ? form.publications : null,
    };

    let error;
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
      toast({ title: "Profile saved!" });
    }
    setSaving(false);
  };

  const addToArray = (field: keyof Pick<ProfileForm, "qualifications" | "research_interests" | "publications">, value: string, setter: (v: string) => void) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setForm((f) => ({ ...f, [field]: [...f[field], trimmed] }));
    setter("");
  };

  const removeFromArray = (field: keyof Pick<ProfileForm, "qualifications" | "research_interests" | "publications">, index: number) => {
    setForm((f) => ({ ...f, [field]: f[field].filter((_, i) => i !== index) }));
  };

  if (authLoading || loadingProfile) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 pt-24 pb-16 max-w-3xl mx-auto px-4 w-full">
          <Skeleton className="h-10 w-1/3 mb-6" />
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <section className="flex-1 pt-24 pb-16 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between mb-8">
              <h1 className="font-display text-3xl font-bold text-foreground">
                {existingId ? "Edit Your Profile" : "Create Your Profile"}
              </h1>
              <Button variant="outline" size="sm" onClick={() => { signOut(); navigate("/"); }}>
                <LogOut size={16} /> Sign Out
              </Button>
            </div>

            <form onSubmit={handleSave} className="space-y-8">
              {/* Basic Information */}
              <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                <h2 className="font-display text-lg font-semibold text-card-foreground">Basic Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Dr. John Doe" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rank">Rank</Label>
                    <Select value={form.rank} onValueChange={(v) => setForm({ ...form, rank: v })}>
                      <SelectTrigger><SelectValue placeholder="Select rank" /></SelectTrigger>
                      <SelectContent>
                        {RANKS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="faculty">Faculty *</Label>
                    <Select value={form.faculty} onValueChange={(v) => setForm({ ...form, faculty: v })}>
                      <SelectTrigger><SelectValue placeholder="Select faculty" /></SelectTrigger>
                      <SelectContent>
                        {FACULTIES.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department *</Label>
                    <Input id="department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} required placeholder="Computer Science" />
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                <h2 className="font-display text-lg font-semibold text-card-foreground">Contact Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@oauife.edu.ng" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+234 XXX XXX XXXX" />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="office">Office Location</Label>
                    <Input id="office" value={form.office_location} onChange={(e) => setForm({ ...form, office_location: e.target.value })} placeholder="Room 204, Faculty Building" />
                  </div>
                </div>
              </div>

              {/* Profile Photo */}
              <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                <h2 className="font-display text-lg font-semibold text-card-foreground">Profile Photo</h2>
                <div className="space-y-2">
                  <Label htmlFor="image_url">Image URL</Label>
                  <Input id="image_url" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://example.com/photo.jpg" />
                  {form.image_url && (
                    <div className="w-24 h-24 rounded-xl overflow-hidden border border-border mt-2">
                      <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              {/* Bio */}
              <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                <h2 className="font-display text-lg font-semibold text-card-foreground">Biography</h2>
                <Textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="Write a brief bio about your academic career, research focus, and teaching experience…"
                  rows={5}
                />
              </div>

              {/* Qualifications */}
              <ArraySection
                title="Qualifications"
                items={form.qualifications}
                inputValue={newQualification}
                setInputValue={setNewQualification}
                placeholder="e.g. Ph.D. Computer Science, University of Lagos"
                onAdd={() => addToArray("qualifications", newQualification, setNewQualification)}
                onRemove={(i) => removeFromArray("qualifications", i)}
              />

              {/* Research Interests */}
              <ArraySection
                title="Research Interests"
                items={form.research_interests}
                inputValue={newInterest}
                setInputValue={setNewInterest}
                placeholder="e.g. Machine Learning"
                onAdd={() => addToArray("research_interests", newInterest, setNewInterest)}
                onRemove={(i) => removeFromArray("research_interests", i)}
              />

              {/* Publications */}
              <ArraySection
                title="Publications"
                items={form.publications}
                inputValue={newPublication}
                setInputValue={setNewPublication}
                placeholder="e.g. Doe, J. (2024). Title. Journal Name, 12(3), 45-67."
                onAdd={() => addToArray("publications", newPublication, setNewPublication)}
                onRemove={(i) => removeFromArray("publications", i)}
              />

              <Button type="submit" size="lg" className="w-full" disabled={saving}>
                <Save size={18} />
                {saving ? "Saving…" : existingId ? "Update Profile" : "Create Profile"}
              </Button>
            </form>
          </motion.div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

function ArraySection({ title, items, inputValue, setInputValue, placeholder, onAdd, onRemove }: {
  title: string;
  items: string[];
  inputValue: string;
  setInputValue: (v: string) => void;
  placeholder: string;
  onAdd: () => void;
  onRemove: (i: number) => void;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-4">
      <h2 className="font-display text-lg font-semibold text-card-foreground">{title}</h2>
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onAdd(); } }}
        />
        <Button type="button" variant="secondary" size="icon" onClick={onAdd}>
          <Plus size={18} />
        </Button>
      </div>
      {items.length > 0 && (
        <ul className="space-y-2">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground bg-muted rounded-lg px-3 py-2">
              <span className="flex-1">{item}</span>
              <button type="button" onClick={() => onRemove(i)} className="text-destructive hover:text-destructive/80 shrink-0 mt-0.5">
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default MyProfile;
