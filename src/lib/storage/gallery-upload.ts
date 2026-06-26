import type { SupabaseClient } from "@supabase/supabase-js";
import { getMediaBucketName, publicStorageUrl } from "@/lib/storage/public-url";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function extensionForType(type: string) {
  switch (type) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    default:
      return "jpg";
  }
}

export async function uploadGalleryImage(
  admin: SupabaseClient,
  file: File,
): Promise<{ ok: true; src: string } | { ok: false; error: string }> {
  if (!ALLOWED_TYPES.has(file.type)) {
    return { ok: false, error: "Use JPG, PNG, WebP, or GIF images only." };
  }

  if (file.size > MAX_BYTES) {
    return { ok: false, error: "Image must be 8 MB or smaller." };
  }

  const bucket = getMediaBucketName();
  const ext = extensionForType(file.type);
  const objectPath = `gallery/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await admin.storage.from(bucket).upload(objectPath, buffer, {
    contentType: file.type,
    cacheControl: "3600",
    upsert: false,
  });

  if (error) {
    return {
      ok: false,
      error:
        error.message.includes("Bucket not found")
          ? `Storage bucket "${bucket}" not found. Create a public bucket in Supabase Storage.`
          : error.message,
    };
  }

  const src = publicStorageUrl(objectPath);
  if (!src) {
    return { ok: false, error: "Could not build public image URL." };
  }

  return { ok: true, src };
}
