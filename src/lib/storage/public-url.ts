function trimSlash(value: string) {
  return value.replace(/\/+$/, "");
}

export function getMediaBucketName() {
  return process.env.NEXT_PUBLIC_MEDIA_BUCKET?.trim() || "site-media";
}

export function publicStorageUrl(objectPath: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!supabaseUrl) return null;

  const clean = objectPath.replace(/^\/+/, "");
  const bucket = getMediaBucketName();
  return `${trimSlash(supabaseUrl)}/storage/v1/object/public/${bucket}/${clean}`;
}
