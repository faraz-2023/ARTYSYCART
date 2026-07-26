import { supabase } from "@/lib/supabase";

const AVATARS_BUCKET = import.meta.env.VITE_SUPABASE_AVATARS_BUCKET ?? "avatars";
const PRODUCTS_BUCKET = import.meta.env.VITE_SUPABASE_PRODUCTS_BUCKET ?? "products";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function validateImageFile(file: File): void {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please select a valid image file.");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Image must be 5 MB or smaller.");
  }
}

async function uploadImageToBucket(params: {
  bucket: string;
  userId: string;
  file: File;
  folder: string;
}): Promise<{ path: string; publicUrl: string }> {
  const { bucket, userId, file, folder } = params;
  validateImageFile(file);

  const fileExt = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
  const normalizedExt = (fileExt ?? "jpg").toLowerCase();
  const safeNameWithoutExt = sanitizeFileName(file.name).replace(/\.[^/.]+$/, "");
  const objectPath = `${folder}/${userId}/${Date.now()}-${crypto.randomUUID()}-${safeNameWithoutExt}.${normalizedExt}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(objectPath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(objectPath);
  if (!urlData.publicUrl) {
    throw new Error("Image uploaded, but failed to retrieve public URL.");
  }

  return {
    path: objectPath,
    publicUrl: urlData.publicUrl,
  };
}

export async function uploadProfileImageToStorage(
  userId: string,
  file: File
): Promise<{ path: string; publicUrl: string }> {
  return uploadImageToBucket({
    bucket: AVATARS_BUCKET,
    userId,
    file,
    folder: "profiles",
  });
}

export async function uploadProductImageToStorage(
  userId: string,
  file: File
): Promise<{ path: string; publicUrl: string }> {
  return uploadImageToBucket({
    bucket: PRODUCTS_BUCKET,
    userId,
    file,
    folder: "product-images",
  });
}
