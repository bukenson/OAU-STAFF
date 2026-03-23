import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify the user
    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await anonClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = user.id;
    const userEmail = user.email as string;

    if (!userEmail) {
      return new Response(JSON.stringify({ error: "No email in token" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Enforce domain restriction server-side
    if (!userEmail.toLowerCase().endsWith("@oauife.edu.ng")) {
      return new Response(JSON.stringify({ error: "Only @oauife.edu.ng accounts are allowed." }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role to bypass RLS
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check if user already has a profile
    const { data: existing } = await adminClient
      .from("staff_members")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (existing) {
      return new Response(
        JSON.stringify({ claimed: false, reason: "already_linked", id: existing.id }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Find unclaimed profile matching email
    const { data: match } = await adminClient
      .from("staff_members")
      .select("id")
      .eq("email", userEmail)
      .is("user_id", null)
      .maybeSingle();

    if (!match) {
      return new Response(
        JSON.stringify({ claimed: false, reason: "no_match" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Claim it
    const { error: updateError } = await adminClient
      .from("staff_members")
      .update({ user_id: userId })
      .eq("id", match.id);

    if (updateError) {
      console.error("Profile claim update error:", updateError);
      return new Response(JSON.stringify({ error: "An internal error occurred." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ claimed: true, id: match.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Claim profile error:", err);
    return new Response(JSON.stringify({ error: "An internal error occurred." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
