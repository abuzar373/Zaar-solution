import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const globalForSupabase = globalThis as typeof globalThis & {
  __abuzarSupabaseAdmin?: SupabaseClient;
};

export function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) return null;

  if (!globalForSupabase.__abuzarSupabaseAdmin) {
    globalForSupabase.__abuzarSupabaseAdmin = createClient(url, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });
  }

  return globalForSupabase.__abuzarSupabaseAdmin;
}

export async function uploadToSupabase(file: File, fileName: string) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "uploads";
  const storage = supabase.storage;

  const { data: buckets, error: listError } = await storage.listBuckets();
  if (listError) throw new Error(`Supabase Storage is unavailable: ${listError.message}`);

  if (!buckets.some((item) => item.name === bucket)) {
    const { error: createError } = await storage.createBucket(bucket, { public: true });
    if (createError && !createError.message.toLowerCase().includes("already exists")) {
      throw new Error(`Could not create Supabase Storage bucket: ${createError.message}`);
    }
  }

  const { error: uploadError } = await storage.from(bucket).upload(fileName, file, {
    contentType: file.type,
    cacheControl: "31536000",
    upsert: true,
  });

  if (uploadError) throw new Error(`Supabase image upload failed: ${uploadError.message}`);

  const { data } = storage.from(bucket).getPublicUrl(fileName);
  return data.publicUrl;
}
