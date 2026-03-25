import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

const ALLOWED_DOMAIN = "@oauife.edu.ng";

export async function getProfileDestination(user: User): Promise<"/create-profile" | "/edit-profile" | "/auth"> {
  const email = user.email?.toLowerCase() ?? "";

  if (!email.endsWith(ALLOWED_DOMAIN)) {
    return "/auth";
  }

  const { data: existingProfile, error: existingProfileError } = await supabase
    .from("staff_members")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingProfileError) {
    throw existingProfileError;
  }

  if (existingProfile) {
    return "/edit-profile";
  }

  try {
    const { data: claimResult, error: claimError } = await supabase.functions.invoke("claim-profile");

    if (!claimError && (claimResult?.claimed || claimResult?.reason === "already_linked")) {
      return "/edit-profile";
    }
  } catch (error) {
    console.error("Profile claim lookup failed:", error);
  }

  return "/create-profile";
}
