import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Verify caller is admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const anonKey = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") || Deno.env.get("SUPABASE_ANON_KEY")!;
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role
    const { data: roleData } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const method = req.method;
    const url = new URL(req.url);

    // GET: list all admins
    if (method === "GET") {
      const { data: roles, error } = await adminClient
        .from("user_roles")
        .select("id, user_id, role, created_at")
        .eq("role", "admin")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get user emails
      const adminsWithEmail = await Promise.all(
        (roles || []).map(async (r) => {
          const { data: { user: u } } = await adminClient.auth.admin.getUserById(r.user_id);
          return { ...r, email: u?.email || "Unknown" };
        })
      );

      return new Response(JSON.stringify(adminsWithEmail), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST: add admin by email
    if (method === "POST") {
      const { email } = await req.json();
      if (!email) {
        return new Response(JSON.stringify({ error: "Email required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Find user by email
      const { data: { users }, error: listError } = await adminClient.auth.admin.listUsers();
      if (listError) throw listError;

      const targetUser = users.find(
        (u) => u.email?.toLowerCase() === email.toLowerCase()
      );

      if (!targetUser) {
        return new Response(
          JSON.stringify({ error: "User not found. They must sign in at least once first." }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { error: insertError } = await adminClient
        .from("user_roles")
        .insert({ user_id: targetUser.id, role: "admin" });

      if (insertError) {
        if (insertError.code === "23505") {
          return new Response(
            JSON.stringify({ error: "This user is already an admin." }),
            { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        throw insertError;
      }

      return new Response(JSON.stringify({ success: true, email: targetUser.email }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // DELETE: remove admin
    if (method === "DELETE") {
      const roleId = url.searchParams.get("id");
      const targetUserId = url.searchParams.get("user_id");

      // Prevent self-removal
      if (targetUserId === user.id) {
        return new Response(
          JSON.stringify({ error: "You cannot remove your own admin access." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { error: deleteError } = await adminClient
        .from("user_roles")
        .delete()
        .eq("id", roleId);

      if (deleteError) throw deleteError;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
