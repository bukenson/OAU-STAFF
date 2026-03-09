import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Search, Plus, Pencil, Trash2, Users, Shield, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StaffForm from "@/components/admin/StaffForm";
import RoleManager from "@/components/admin/RoleManager";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

interface StaffRow {
  id: string;
  name: string;
  faculty: string;
  department: string;
  rank: string | null;
  email: string | null;
  phone: string | null;
  office_location: string | null;
  bio: string | null;
  qualifications: string[] | null;
  research_interests: string[] | null;
  publications: string[] | null;
  image_url: string | null;
}

const AdminDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<StaffRow | null | "new">(null);
  const [deleteTarget, setDeleteTarget] = useState<StaffRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<"staff" | "roles">("staff");

  const { data: staff = [], isLoading } = useQuery({
    queryKey: ["admin-staff"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("staff_members")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as StaffRow[];
    },
  });

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Shield size={48} className="mx-auto text-muted-foreground/30 mb-4" />
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">Access Denied</h2>
            <p className="text-muted-foreground">You do not have admin privileges to access this page.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const filtered = staff.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.faculty.toLowerCase().includes(search.toLowerCase()) ||
      s.department.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const { error } = await supabase.from("staff_members").delete().eq("id", deleteTarget.id);
    setDeleting(false);
    setDeleteTarget(null);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Staff member deleted" });
    queryClient.invalidateQueries({ queryKey: ["admin-staff"] });
    queryClient.invalidateQueries({ queryKey: ["staff"] });
  };

  const handleFormSave = () => {
    setEditing(null);
    queryClient.invalidateQueries({ queryKey: ["admin-staff"] });
    queryClient.invalidateQueries({ queryKey: ["staff"] });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <section className="pt-24 pb-6 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-1">
            <Shield size={20} className="text-accent" />
            <p className="text-accent font-medium tracking-[0.2em] uppercase text-sm">Admin</p>
          </div>
          <h1 className="font-display text-3xl font-bold text-primary-foreground mb-4">
            Admin Dashboard
          </h1>
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab("staff")}
              className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
                activeTab === "staff"
                  ? "border-accent text-accent"
                  : "border-transparent text-primary-foreground/60 hover:text-primary-foreground/80"
              }`}
            >
              Staff Management
            </button>
            <button
              onClick={() => setActiveTab("roles")}
              className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
                activeTab === "roles"
                  ? "border-accent text-accent"
                  : "border-transparent text-primary-foreground/60 hover:text-primary-foreground/80"
              }`}
            >
              Admin Roles
            </button>
          </div>
        </div>
      </section>

      <section className="flex-1 py-8 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {activeTab === "roles" ? (
            <RoleManager currentUserId={user.id} />
          ) : editing ? (
            <div className="bg-card rounded-xl border border-border p-6">
              <StaffForm
                staff={editing === "new" ? null : {
                  ...editing,
                  rank: editing.rank ?? "",
                  email: editing.email ?? "",
                  
                  office_location: editing.office_location ?? "",
                  bio: editing.bio ?? "",
                  qualifications: editing.qualifications ?? [],
                  research_interests: editing.research_interests ?? [],
                  publications: editing.publications ?? [],
                  image_url: editing.image_url ?? "",
                }}
                onSave={handleFormSave}
                onCancel={() => setEditing(null)}
              />
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search staff..."
                    className="w-full bg-card border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <Button onClick={() => setEditing("new")} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Plus size={16} className="mr-2" /> Add Staff
                </Button>
              </div>

              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
                <Users size={16} />
                <span><span className="font-semibold text-foreground">{filtered.length}</span> staff member{filtered.length !== 1 ? "s" : ""}</span>
              </div>

              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-lg" />
                  ))}
                </div>
              ) : (
                <div className="bg-card rounded-xl border border-border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted/50">
                          <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                          <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Faculty</th>
                          <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Department</th>
                          <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Rank</th>
                          <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((s) => (
                          <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                {s.image_url ? (
                                  <img src={s.image_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                    {s.name.charAt(0)}
                                  </div>
                                )}
                                <span className="font-medium text-foreground">{s.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{s.faculty}</td>
                            <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{s.department}</td>
                            <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{s.rank || "—"}</td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button variant="ghost" size="icon" onClick={() => setEditing(s)} className="text-muted-foreground hover:text-primary">
                                  <Pencil size={14} />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(s)} className="text-muted-foreground hover:text-destructive">
                                  <Trash2 size={14} />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {filtered.length === 0 && (
                          <tr>
                            <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                              No staff found matching your search.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteTarget?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this staff member from the directory. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting ? <Loader2 size={14} className="mr-2 animate-spin" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
