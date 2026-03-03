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
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Get all staff with Firebase image URLs
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

    const results: { id: string; name: string; status: string; newUrl?: string; error?: string }[] = [];

    for (const staff of staffMembers) {
      try {
        console.log(`Migrating image for: ${staff.name}`);

        // Download the image from Firebase
        const response = await fetch(staff.image_url, { redirect: "follow" });

        if (!response.ok) {
          results.push({ id: staff.id, name: staff.name, status: "failed", error: `HTTP ${response.status}` });
          continue;
        }

        const contentType = response.headers.get("content-type") || "image/jpeg";
        const ext = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
        const imageData = await response.arrayBuffer();

        const filePath = `${staff.id}/profile.${ext}`;

        // Upload to Supabase storage
        const { error: uploadError } = await supabase.storage
          .from("staff-photos")
          .upload(filePath, imageData, {
            contentType,
            upsert: true,
          });

        if (uploadError) {
          results.push({ id: staff.id, name: staff.name, status: "failed", error: uploadError.message });
          continue;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from("staff-photos")
          .getPublicUrl(filePath);

        const newUrl = urlData.publicUrl;

        // Update staff record
        const { error: updateError } = await supabase
          .from("staff_members")
          .update({ image_url: newUrl })
          .eq("id", staff.id);

        if (updateError) {
          results.push({ id: staff.id, name: staff.name, status: "failed", error: updateError.message });
          continue;
        }

        results.push({ id: staff.id, name: staff.name, status: "success", newUrl });
        console.log(`✓ Migrated: ${staff.name}`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        results.push({ id: staff.id, name: staff.name, status: "failed", error: msg });
        console.error(`✗ Failed: ${staff.name} - ${msg}`);
      }
    }

    const migrated = results.filter((r) => r.status === "success").length;
    const failed = results.filter((r) => r.status === "failed").length;

    return new Response(
      JSON.stringify({ success: true, migrated, failed, total: staffMembers.length, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Migration error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
