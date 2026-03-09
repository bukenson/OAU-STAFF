import { useState, useEffect } from "react";
import { X, Plus, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface StaffFormData {
  id?: string;
  name: string;
  faculty: string;
  department: string;
  rank: string;
  email: string;
    bio: string;
  qualifications: string[];
  research_interests: string[];
  publications: string[];
  image_url: string;
}

const EMPTY_FORM: StaffFormData = {
  name: "", faculty: "", department: "", rank: "",
  email: "", office_location: "", bio: "",
  qualifications: [], research_interests: [], publications: [], image_url: "",
};

interface StaffFormProps {
  staff?: StaffFormData | null;
  onSave: () => void;
  onCancel: () => void;
}

export default function StaffForm({ staff, onSave, onCancel }: StaffFormProps) {
  const [form, setForm] = useState<StaffFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (staff) setForm({ ...EMPTY_FORM, ...staff });
    else setForm(EMPTY_FORM);
  }, [staff]);

  const set = (key: keyof StaffFormData, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const setArrayItem = (key: "qualifications" | "research_interests" | "publications", index: number, value: string) => {
    setForm((f) => {
      const arr = [...f[key]];
      arr[index] = value;
      return { ...f, [key]: arr };
    });
  };

  const addArrayItem = (key: "qualifications" | "research_interests" | "publications") =>
    setForm((f) => ({ ...f, [key]: [...f[key], ""] }));

  const removeArrayItem = (key: "qualifications" | "research_interests" | "publications", index: number) =>
    setForm((f) => ({ ...f, [key]: f[key].filter((_, i) => i !== index) }));

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please upload an image file.", variant: "destructive" });
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("staff-photos").upload(path, file);
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from("staff-photos").getPublicUrl(path);
    set("image_url", urlData.publicUrl);
    setUploading(false);
    toast({ title: "Photo uploaded" });
  };

  const handleSave = async () => {
    if (!form.name || !form.faculty || !form.department) {
      toast({ title: "Missing fields", description: "Name, faculty, and department are required.", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      faculty: form.faculty.trim(),
      department: form.department.trim(),
      rank: form.rank.trim() || null,
      email: form.email.trim() || null,
      office_location: form.office_location.trim() || null,
      bio: form.bio.trim() || null,
      qualifications: form.qualifications.filter(Boolean).length > 0 ? form.qualifications.filter(Boolean) : null,
      research_interests: form.research_interests.filter(Boolean).length > 0 ? form.research_interests.filter(Boolean) : null,
      publications: form.publications.filter(Boolean).length > 0 ? form.publications.filter(Boolean) : null,
      image_url: form.image_url || null,
    };

    let error;
    if (form.id) {
      ({ error } = await supabase.from("staff_members").update(payload).eq("id", form.id));
    } else {
      ({ error } = await supabase.from("staff_members").insert(payload));
    }

    setSaving(false);
    if (error) {
      toast({ title: "Error saving", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: form.id ? "Staff updated" : "Staff created" });
    onSave();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-foreground">
          {form.id ? "Edit Staff Member" : "Add New Staff Member"}
        </h2>
        <Button variant="ghost" size="icon" onClick={onCancel}><X size={18} /></Button>
      </div>

      {/* Photo */}
      <div className="flex items-center gap-4">
        {form.image_url ? (
          <img src={form.image_url} alt="" className="w-20 h-20 rounded-lg object-cover border border-border" />
        ) : (
          <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center text-muted-foreground text-2xl font-bold">
            {form.name.charAt(0) || "?"}
          </div>
        )}
        <div>
          <Label htmlFor="photo-upload" className="cursor-pointer inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80">
            {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
            {uploading ? "Uploading..." : "Upload photo"}
          </Label>
          <input id="photo-upload" type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
        </div>
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><Label>Name *</Label><Input value={form.name} onChange={(e) => set("name", e.target.value)} /></div>
        <div><Label>Rank</Label><Input value={form.rank} onChange={(e) => set("rank", e.target.value)} placeholder="e.g. Professor, Senior Lecturer" /></div>
        <div><Label>Faculty *</Label><Input value={form.faculty} onChange={(e) => set("faculty", e.target.value)} /></div>
        <div><Label>Department *</Label><Input value={form.department} onChange={(e) => set("department", e.target.value)} /></div>
        <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} /></div>
        <div className="sm:col-span-2"><Label>Office Location</Label><Input value={form.office_location} onChange={(e) => set("office_location", e.target.value)} /></div>
      </div>

      {/* Bio */}
      <div>
        <Label>Biography</Label>
        <Textarea rows={4} value={form.bio} onChange={(e) => set("bio", e.target.value)} />
      </div>

      {/* Array fields */}
      {(["qualifications", "research_interests", "publications"] as const).map((field) => (
        <div key={field}>
          <div className="flex items-center justify-between mb-2">
            <Label className="capitalize">{field.replace("_", " ")}</Label>
            <Button variant="outline" size="sm" onClick={() => addArrayItem(field)}>
              <Plus size={14} className="mr-1" /> Add
            </Button>
          </div>
          <div className="space-y-2">
            {form[field].map((item, i) => (
              <div key={i} className="flex gap-2">
                {field === "publications" ? (
                  <Textarea rows={2} value={item} onChange={(e) => setArrayItem(field, i, e.target.value)} className="flex-1" />
                ) : (
                  <Input value={item} onChange={(e) => setArrayItem(field, i, e.target.value)} className="flex-1" />
                )}
                <Button variant="ghost" size="icon" onClick={() => removeArrayItem(field, i)} className="shrink-0 text-destructive hover:text-destructive">
                  <X size={14} />
                </Button>
              </div>
            ))}
            {form[field].length === 0 && (
              <p className="text-sm text-muted-foreground italic">No {field.replace("_", " ")} added yet.</p>
            )}
          </div>
        </div>
      ))}

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-border">
        <Button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90">
          {saving && <Loader2 size={14} className="mr-2 animate-spin" />}
          {form.id ? "Save Changes" : "Create Staff Member"}
        </Button>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}
