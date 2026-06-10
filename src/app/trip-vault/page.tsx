import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/supabase";
import { createAdminClient } from "@/lib/supabase-admin";
import VaultClient from "./VaultClient";
import OnboardingGate from "./OnboardingGate";
import type { TripDocGroup, TripDocFile } from "./VaultDocuments";

export const metadata: Metadata = {
  title: "Trip Vault | WC26 The Boys Trip",
  description: "Private crew vault — photos, booking docs, and trip memories.",
};

// Force dynamic rendering (no caching — auth-dependent, signed URLs expire)
export const dynamic = "force-dynamic";

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Turn a raw filename into a readable display name */
function cleanFileName(filename: string): string {
  return filename
    .replace(/^\d+\.\s*/, "")   // strip leading "0. " style numbers
    .replace(/\.[^.]+$/, "")    // strip extension
    .replace(/[-_]/g, " ")      // dashes/underscores → spaces
    .replace(/\s+/g, " ")
    .trim();
}

/** For flight files, extract person name from filename (e.g. "imran1" → "Imran") */
function flightDisplayName(filename: string): string {
  const base = filename.replace(/\.[^.]+$/, ""); // strip extension
  const personName = base.replace(/\d+$/, "");   // strip trailing digits
  // Capitalise first letter
  return personName.charAt(0).toUpperCase() + personName.slice(1);
}

/** List a storage folder and return signed URLs for every file in it */
async function listAndSign(
  supabase: SupabaseClient,
  folder: string,
  signFor: number = 3600
): Promise<TripDocFile[]> {
  const { data: files, error } = await supabase.storage
    .from("vault-docs")
    .list(folder, { sortBy: { column: "name", order: "asc" } });

  if (error || !files || files.length === 0) return [];

  // Filter out Supabase placeholder files
  const realFiles = files.filter(
    (f) => f.name && f.name !== ".emptyFolderPlaceholder" && f.metadata
  );
  if (realFiles.length === 0) return [];

  const paths = realFiles.map((f) => `${folder}/${f.name}`);

  const { data: signed, error: signError } = await supabase.storage
    .from("vault-docs")
    .createSignedUrls(paths, signFor);

  if (signError || !signed) return [];

  return signed
    .filter((s): s is typeof s & { signedUrl: string; path: string } =>
      !!s.signedUrl && !!s.path && !s.error
    )
    .map((s) => {
      const filename = s.path.split("/").pop() ?? s.path;
      const ext = filename.split(".").pop()?.toLowerCase() ?? "";
      const isImage = ["jpg", "jpeg", "png", "webp", "gif", "heic"].includes(ext);
      const displayName =
        folder === "flights"
          ? flightDisplayName(filename)
          : cleanFileName(filename);

      return {
        path: s.path,
        displayName,
        signedUrl: s.signedUrl,
        mimeType: isImage ? ("image" as const) : ("pdf" as const),
      };
    });
}

/** Fetch all three document groups from vault-docs storage.
 *  Uses the service-role client so storage RLS never blocks listing or signing.
 *  The signed URLs themselves are the access-control mechanism (1-hour expiry). */
async function fetchTripDocGroups(): Promise<TripDocGroup[]> {
  // Service role bypasses storage RLS — safe because this runs only server-side
  const adminClient = createAdminClient();
  const [overviewFiles, bookingFiles, flightFiles] = await Promise.all([
    listAndSign(adminClient, "overview"),
    listAndSign(adminClient, "bookings"),
    listAndSign(adminClient, "flights"),
  ]);

  return [
    {
      folder: "overview" as const,
      title: "Trip Overview",
      emoji: "🗺️",
      files: overviewFiles,
    },
    {
      folder: "bookings" as const,
      title: "Bookings",
      emoji: "🏨",
      files: bookingFiles,
    },
    {
      folder: "flights" as const,
      title: "Flights",
      emoji: "✈️",
      files: flightFiles,
    },
  ];
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function TripVaultPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Middleware handles unauthenticated users, but guard here too
  if (!session) {
    redirect("/trip-vault/login");
  }

  const user = session.user;

  // Fetch onboarding state
  const { data: profile } = await supabase
    .from("vault_profiles")
    .select("onboarding_done")
    .eq("id", user.id)
    .maybeSingle();

  const onboardingDone = profile?.onboarding_done === true;

  if (!onboardingDone) {
    return <OnboardingGate user={user} />;
  }

  // Fetch all vault data in parallel
  const [{ data: photos }, { data: docs }, tripDocGroups] = await Promise.all([
    supabase
      .from("vault_photos")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("vault_docs")
      .select("*")
      .order("created_at", { ascending: false }),
    fetchTripDocGroups(),
  ]);

  return (
    <VaultClient
      user={user}
      initialPhotos={photos ?? []}
      initialDocs={docs ?? []}
      tripDocGroups={tripDocGroups}
    />
  );
}
