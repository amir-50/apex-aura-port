import { supabase } from "@/integrations/supabase/client";

/**
 * Upload an image to the public `site-assets` bucket.
 * Returns the public CDN URL. Requires the caller to have the `admin` role
 * (enforced by storage RLS policies).
 */
export async function uploadSiteAsset(file: File, folder = "uploads"): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
  const safeExt = /^[a-z0-9]+$/.test(ext) ? ext : "bin";
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${safeExt}`;
  const { error } = await supabase.storage.from("site-assets").upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
    contentType: file.type || undefined,
  });
  if (error) throw error;
  const { data } = supabase.storage.from("site-assets").getPublicUrl(path);
  return data.publicUrl;
}
