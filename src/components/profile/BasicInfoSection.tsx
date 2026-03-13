import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ProfileForm, StaffCategory } from "@/pages/MyProfile";

interface Props {
  form: ProfileForm;
  updateForm: (updates: Partial<ProfileForm>) => void;
  faculties: string[];
  academicRanks: string[];
  statusOptions: string[];
}

const BasicInfoSection = ({ form, updateForm, faculties, academicRanks, statusOptions }: Props) => {
  return (
    <div className="space-y-5">
      {/* Name */}
      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-primary">
          Name (With your title e.g. Prof. Dr. Mr. Mrs. e.t.c.)
        </label>
        <Input
          value={form.name}
          onChange={(e) => updateForm({ name: e.target.value })}
          required
          placeholder="Enter your First name, then Last name"
        />
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-primary">
          Email Address (With your OAU Email Address)
        </label>
        <Input
          type="email"
          value={form.email}
          onChange={(e) => updateForm({ email: e.target.value })}
          placeholder="you@oauife.edu.ng"
        />
      </div>

      {/* Phone */}
      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-primary">Phone Number</label>
        <Input
          type="tel"
          value={form.phone}
          onChange={(e) => updateForm({ phone: e.target.value })}
          placeholder="Phone"
        />
      </div>

      {/* Faculty */}
      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-primary">Faculty</label>
        <Select value={form.faculty} onValueChange={(v) => updateForm({ faculty: v })}>
          <SelectTrigger><SelectValue placeholder="Select Faculty" /></SelectTrigger>
          <SelectContent>
            {faculties.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Department */}
      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-primary">Department</label>
        <Input
          value={form.department}
          onChange={(e) => updateForm({ department: e.target.value })}
          required
          placeholder="Select Department"
        />
      </div>

      {/* Status Availability */}
      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-primary">Status Availability</label>
        <Select value={form.status_availability} onValueChange={(v) => updateForm({ status_availability: v })}>
          <SelectTrigger><SelectValue placeholder="Active/On Leave/Contract/Sabbatical/Retired" /></SelectTrigger>
          <SelectContent>
            {statusOptions.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Staff Category */}
      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-primary">Staff Category</label>
        <Select value={form.staff_category} onValueChange={(v: StaffCategory) => updateForm({ staff_category: v, rank: "" })}>
          <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="academic">Academic Staff</SelectItem>
            <SelectItem value="non-academic">Non-Academic Staff</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Rank/Status/Level */}
      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-primary">Rank/Status/Level</label>
        {form.staff_category === "academic" ? (
          <Select value={form.rank} onValueChange={(v) => updateForm({ rank: v })}>
            <SelectTrigger><SelectValue placeholder="Select Rank" /></SelectTrigger>
            <SelectContent>
              {academicRanks.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
        ) : (
          <Input
            value={form.rank}
            onChange={(e) => updateForm({ rank: e.target.value })}
            placeholder="e.g. Senior Administrative Officer"
          />
        )}
      </div>
    </div>
  );
};

export default BasicInfoSection;
