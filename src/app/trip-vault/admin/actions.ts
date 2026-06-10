"use server";

import { createAdminClient } from "@/lib/supabase-admin";
import { revalidatePath } from "next/cache";

export interface CrewMember {
  id: string;
  email: string;
  display_name: string;
  provider: "google" | "facebook" | "email";
  is_admin: boolean;
  is_active: boolean;
  created_at: string;
}

// ── Read ──────────────────────────────────────────────────────────────────────

export async function getCrewMembers(): Promise<CrewMember[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("vault_crew")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as CrewMember[];
}

// ── Create ────────────────────────────────────────────────────────────────────

export async function addCrewMember(formData: FormData) {
  const email = (formData.get("email") as string).trim().toLowerCase();
  const display_name = (formData.get("display_name") as string).trim();
  const provider = formData.get("provider") as CrewMember["provider"];
  const is_admin = formData.get("is_admin") === "true";

  if (!email || !display_name || !provider) {
    throw new Error("email, display_name, and provider are required.");
  }
  if (!["google", "facebook", "email"].includes(provider)) {
    throw new Error("provider must be google, facebook, or email.");
  }

  const admin = createAdminClient();
  const { error } = await admin.from("vault_crew").insert({
    email,
    display_name,
    provider,
    is_admin,
    is_active: true,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/trip-vault/admin");
}

// ── Update ────────────────────────────────────────────────────────────────────

export async function updateCrewMember(formData: FormData) {
  const id = formData.get("id") as string;
  const display_name = (formData.get("display_name") as string).trim();
  const provider = formData.get("provider") as CrewMember["provider"];
  const is_admin = formData.get("is_admin") === "true";
  const is_active = formData.get("is_active") === "true";

  if (!id) throw new Error("id is required.");

  const admin = createAdminClient();
  const { error } = await admin
    .from("vault_crew")
    .update({ display_name, provider, is_admin, is_active })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/trip-vault/admin");
}

// ── Delete (deactivate) ───────────────────────────────────────────────────────

export async function removeCrewMember(id: string) {
  const admin = createAdminClient();
  // Soft-delete: set is_active = false
  const { error } = await admin
    .from("vault_crew")
    .update({ is_active: false })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/trip-vault/admin");
}

// ── Hard delete (permanent) ───────────────────────────────────────────────────

export async function deleteCrewMember(id: string) {
  const admin = createAdminClient();
  const { error } = await admin.from("vault_crew").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/trip-vault/admin");
}
