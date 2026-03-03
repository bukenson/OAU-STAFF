import { useState } from "react";
import { Shield, Plus, Trash2, Loader2, UserCheck } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AdminEntry {
  id: string;
  user_id: string;
  email: string;
  role: string;
  created_at: string;
}

export default function RoleManager({ currentUserId }: { currentUserId: string }) {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [adding, setAdding] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<AdminEntry | null>(null);
  const [removing, setRemoving] = useState(false);

  const { data: admins = [], isLoading } = useQuery({
    queryKey: ["admin-list"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("manage-admins", {
        method: "GET",
      });
      if (error) throw error;
      return data as AdminEntry[];
    },
  });

  const handleAdd = async () => {
    const trimmed = email.trim();
    if (!trimmed) return;
    if (!trimmed.endsWith("@oauife.edu.ng")) {
      toast({ title: "Invalid email", description: "Only @oauife.edu.ng accounts can be admins.", variant: "destructive" });
      return;
    }
    setAdding(true);
    const { data, error } = await supabase.functions.invoke("manage-admins", {
      method: "POST",
      body: { email: trimmed },
    });
    setAdding(false);
    if (error || data?.error) {
      toast({ title: "Error", description: data?.error || error?.message || "Failed to add admin", variant: "destructive" });
      return;
    }
    toast({ title: "Admin added", description: `${trimmed} is now an admin.` });
    setEmail("");
    queryClient.invalidateQueries({ queryKey: ["admin-list"] });
  };

  const handleRemove = async () => {
    if (!removeTarget) return;
    setRemoving(true);
    const { data, error } = await supabase.functions.invoke("manage-admins", {
      method: "DELETE",
      body: {},
      headers: {},
    });
    // Use query params via custom fetch since invoke doesn't support DELETE query params well
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-admins?id=${removeTarget.id}&user_id=${removeTarget.user_id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
      }
    );
    const result = await response.json();
    setRemoving(false);
    setRemoveTarget(null);
    if (!response.ok) {
      toast({ title: "Error", description: result.error || "Failed to remove admin", variant: "destructive" });
      return;
    }
    toast({ title: "Admin removed" });
    queryClient.invalidateQueries({ queryKey: ["admin-list"] });
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <h2 className="font-display text-xl font-semibold text-foreground mb-1 flex items-center gap-2">
        <Shield size={20} className="text-accent" />
        Admin Management
      </h2>
      <p className="text-sm text-muted-foreground mb-6">
        Add or remove admin access for @oauife.edu.ng users. Users must have signed in at least once.
      </p>

      {/* Add admin */}
      <div className="flex gap-2 mb-6">
        <Input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@oauife.edu.ng"
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <Button onClick={handleAdd} disabled={adding} className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0">
          {adding ? <Loader2 size={14} className="mr-2 animate-spin" /> : <Plus size={14} className="mr-2" />}
          Add Admin
        </Button>
      </div>

      {/* Admin list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8 text-muted-foreground">
          <Loader2 size={20} className="animate-spin mr-2" /> Loading admins...
        </div>
      ) : admins.length === 0 ? (
        <p className="text-center py-8 text-muted-foreground">No admins configured.</p>
      ) : (
        <div className="space-y-2">
          {admins.map((admin) => (
            <div
              key={admin.id}
              className="flex items-center justify-between px-4 py-3 rounded-lg border border-border bg-muted/30"
            >
              <div className="flex items-center gap-3">
                <UserCheck size={16} className="text-accent" />
                <div>
                  <p className="text-sm font-medium text-foreground">{admin.email}</p>
                  <p className="text-xs text-muted-foreground">
                    Added {new Date(admin.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {admin.user_id !== currentUserId && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setRemoveTarget(admin)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 size={14} />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={!!removeTarget} onOpenChange={() => setRemoveTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove admin access?</AlertDialogTitle>
            <AlertDialogDescription>
              {removeTarget?.email} will no longer have admin privileges. They can still sign in and manage their own profile.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemove} disabled={removing} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {removing && <Loader2 size={14} className="mr-2 animate-spin" />}
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
