// ─────────────────────────────────────────────────────────────────────────────
// Trip Vault — shared types and URL helper
// Kept in a separate file to avoid circular imports between
// VaultGallery (imports VaultMediaLightbox) and VaultMediaLightbox.
// ─────────────────────────────────────────────────────────────────────────────

export interface VaultPhoto {
  id: string;
  user_id: string;
  uploaded_by: string;
  storage_path: string;
  caption: string | null;
  is_public: boolean;
  is_gift_selfie: boolean;
  created_at: string;

  // Media metadata (added in vault-media-migration.sql)
  media_type: "photo" | "video";
  file_size: number | null;
  original_filename: string | null;
  mime_type: string | null;
  width: number | null;
  height: number | null;
  duration_secs: number | null;
  taken_at: string | null;       // ISO — EXIF DateTimeOriginal or video recording time
  location_lat: number | null;
  location_lng: number | null;
  location_name: string | null;
  thumbnail_path: string | null; // for videos: JPEG thumbnail path in vault-photos bucket
}

/** Full public URL for any file in the vault-photos bucket. */
export function getMediaUrl(storagePath: string): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/vault-photos/${storagePath}`;
}

/** The timestamp we use for timeline ordering and display. */
export function effectiveDateOf(item: VaultPhoto): Date {
  return new Date(item.taken_at ?? item.created_at);
}
