import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { StaffMember } from "@/components/StaffCard";

const STALE_TIME = 5 * 60 * 1000; // 5 minutes

async function fetchStaff(): Promise<StaffMember[]> {
  const { data, error } = await supabase
    .from("staff_members")
    .select("id, name, faculty, department, email, rank, image_url, research_interests, office_location, created_at")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    faculty: row.faculty,
    department: row.department,
    email: row.email ?? undefined,
    status: row.rank ?? undefined,
    image: row.image_url ?? undefined,
    research_interests: row.research_interests ?? undefined,
    office_location: row.office_location ?? undefined,
  }));
}

export function useStaff() {
  return useQuery({
    queryKey: ["staff"],
    queryFn: fetchStaff,
    staleTime: STALE_TIME,
  });
}

/** Derive faculties from already-fetched staff data — no extra query */
export function useFaculties() {
  const { data: staff } = useStaff();
  return {
    data: staff
      ? [...new Set(staff.map((s) => s.faculty))].sort()
      : [],
  };
}

/** Derive departments from already-fetched staff data — no extra query */
export function useDepartments() {
  const { data: staff } = useStaff();
  return {
    data: staff
      ? [...new Set(staff.map((s) => s.department))].sort()
      : [],
  };
}

/** Derive ranks from already-fetched staff data — no extra query */
export function useRanks() {
  const { data: staff } = useStaff();
  return {
    data: staff
      ? [...new Set(staff.map((s) => s.status).filter(Boolean))].sort() as string[]
      : [],
  };
}

/** Subscribe to realtime changes on staff_members and auto-invalidate queries */
export function useStaffRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("staff-realtime-stats")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "staff_members" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["staff-stats"] });
          queryClient.invalidateQueries({ queryKey: ["staff"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}

export function useStaffStats() {
  return useQuery({
    queryKey: ["staff-stats"],
    staleTime: STALE_TIME,
    queryFn: async () => {
      const [totalRes, profRes] = await Promise.all([
        supabase
          .from("staff_members")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("staff_members")
          .select("*", { count: "exact", head: true })
          .ilike("rank", "%professor%"),
      ]);

      if (totalRes.error) throw totalRes.error;
      if (profRes.error) throw profRes.error;

      return {
        totalStaff: totalRes.count ?? 0,
        professors: profRes.count ?? 0,
      };
    },
  });
}

export interface StaffProfileData {
  id: string;
  name: string;
  faculty: string;
  department: string;
  email: string | null;
  rank: string | null;
  image_url: string | null;
  research_interests: string[] | null;
  office_location: string | null;
  bio: string | null;
  qualifications: string[] | null;
  publications: string[] | null;
  specializations: string[] | null;
  conferences: string[] | null;
  publication_link: string[] | null;
  status_availability: string | null;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

export function useStaffProfile(id: string | undefined) {
  return useQuery<StaffProfileData | null>({
    queryKey: ["staff-profile", id],
    staleTime: STALE_TIME,
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("staff_members")
        .select("id, name, faculty, department, email, rank, image_url, research_interests, office_location, bio, qualifications, publications, specializations, conferences, publication_link, status_availability, user_id, created_at, updated_at")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data as StaffProfileData | null;
    },
    enabled: !!id,
  });
}
