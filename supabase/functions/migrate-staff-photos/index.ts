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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // === Auth check: require admin role ===
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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

    // Verify admin role using service role client
    const adminClient = createClient(supabaseUrl, serviceRoleKey);
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

    // === Migration logic ===
    const supabase = adminClient;

    const { data: staffMembers, error: fetchError } = await supabase
      .from("staff_members")
      .select("id, name, image_url")
      .like("image_url", "%firebasestorage.googleapis.com%");

    if (fetchError) throw fetchError;

    if (!staffMembers || staffMembers.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No Firebase images to migrate", migrated: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${staffMembers.length} staff with Firebase images`);

    const results: { id: string; name: string; status: string; newUrl?: string }[] = [];

    for (const staff of staffMembers) {
      try {
        console.log(`Migrating image for: ${staff.name}`);

        const response = await fetch(staff.image_url, { redirect: "follow" });

        if (!response.ok) {
          results.push({ id: staff.id, name: staff.name, status: "failed" });
          continue;
        }

        const contentType = response.headers.get("content-type") || "image/jpeg";
        const ext = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
        const imageData = await response.arrayBuffer();

        const filePath = `${staff.id}/profile.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("staff-photos")
          .upload(filePath, imageData, {
            contentType,
            upsert: true,
          });

        if (uploadError) {
          console.error(`Upload failed for ${staff.name}:`, uploadError);
          results.push({ id: staff.id, name: staff.name, status: "failed" });
          continue;
        }

        const { data: urlData } = supabase.storage
          .from("staff-photos")
          .getPublicUrl(filePath);

        const newUrl = urlData.publicUrl;

        const { error: updateError } = await supabase
          .from("staff_members")
          .update({ image_url: newUrl })
          .eq("id", staff.id);

        if (updateError) {
          console.error(`DB update failed for ${staff.name}:`, updateError);
          results.push({ id: staff.id, name: staff.name, status: "failed" });
          continue;
        }

        results.push({ id: staff.id, name: staff.name, status: "success", newUrl });
        console.log(`✓ Migrated: ${staff.name}`);
      } catch (err) {
        console.error(`✗ Failed: ${staff.name}`, err);
        results.push({ id: staff.id, name: staff.name, status: "failed" });
      }
    }

    const migrated = results.filter((r) => r.status === "success").length;
    const failed = results.filter((r) => r.status === "failed").length;

    return new Response(
      JSON.stringify({ success: true, migrated, failed, total: staffMembers.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Migration error:", error);
    return new Response(
      JSON.stringify({ error: "An internal error occurred." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
