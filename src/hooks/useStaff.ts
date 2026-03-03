import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { StaffMember } from "@/components/StaffCard";

async function fetchStaff(): Promise<StaffMember[]> {
  const { data, error } = await supabase
    .from("staff_members")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    faculty: row.faculty,
    department: row.department,
    email: row.email ?? undefined,
    phone: row.phone ?? undefined,
    status: row.rank ?? undefined,
    image: row.image_url ?? undefined,
  }));
}

async function fetchFaculties(): Promise<string[]> {
  const { data, error } = await supabase
    .from("staff_members")
    .select("faculty")
    .order("faculty");

  if (error) throw error;

  return [...new Set((data ?? []).map((r) => r.faculty))];
}

async function fetchDepartments(): Promise<string[]> {
  const { data, error } = await supabase
    .from("staff_members")
    .select("department")
    .order("department");

  if (error) throw error;

  return [...new Set((data ?? []).map((r) => r.department))];
}

async function fetchRanks(): Promise<string[]> {
  const { data, error } = await supabase
    .from("staff_members")
    .select("rank")
    .not("rank", "is", null)
    .order("rank");

  if (error) throw error;

  return [...new Set((data ?? []).map((r) => r.rank).filter(Boolean))] as string[];
}

export function useStaff() {
  return useQuery({ queryKey: ["staff"], queryFn: fetchStaff });
}

export function useFaculties() {
  return useQuery({ queryKey: ["faculties"], queryFn: fetchFaculties });
}

export function useDepartments() {
  return useQuery({ queryKey: ["departments"], queryFn: fetchDepartments });
}

export function useRanks() {
  return useQuery({ queryKey: ["ranks"], queryFn: fetchRanks });
}

export function useStaffStats() {
  return useQuery({
    queryKey: ["staff-stats"],
    queryFn: async () => {
      const [
        { count: totalStaff },
        facultiesData,
        departmentsData,
        { count: professors },
      ] = await Promise.all([
        supabase.from("staff_members").select("*", { count: "exact", head: true }),
        supabase.from("staff_members").select("faculty"),
        supabase.from("staff_members").select("department"),
        supabase.from("staff_members").select("*", { count: "exact", head: true }).eq("rank", "Professor"),
      ]);

      const uniqueFaculties = new Set((facultiesData.data ?? []).map((r) => r.faculty)).size;
      const uniqueDepartments = new Set((departmentsData.data ?? []).map((r) => r.department)).size;

      return {
        faculties: uniqueFaculties,
        departments: uniqueDepartments,
        professors: professors ?? 0,
        totalStaff: totalStaff ?? 0,
      };
    },
  });
}

export function useStaffProfile(id: string | undefined) {
  return useQuery({
    queryKey: ["staff-profile", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("staff_members")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}
