"use client";

import { useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase-browser";
import OnboardingClient from "./OnboardingClient";
import VaultClient from "./VaultClient";
import type { VaultPhoto } from "./VaultGallery";
import type { VaultDoc } from "./VaultDocs";

interface OnboardingGateProps {
  user: User;
}

export default function OnboardingGate({ user }: OnboardingGateProps) {
  const supabase = createClient();
  const [vaultReady, setVaultReady] = useState(false);
  const [photos, setPhotos] = useState<VaultPhoto[]>([]);
  const [docs, setDocs] = useState<VaultDoc[]>([]);

  const handleOnboardingComplete = async () => {
    // Fetch initial vault data once onboarding is done
    const [{ data: p }, { data: d }] = await Promise.all([
      supabase
        .from("vault_photos")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("vault_docs")
        .select("*")
        .order("created_at", { ascending: false }),
    ]);

    setPhotos((p as VaultPhoto[]) ?? []);
    setDocs((d as VaultDoc[]) ?? []);
    setVaultReady(true);
  };

  if (vaultReady) {
    return <VaultClient user={user} initialPhotos={photos} initialDocs={docs} tripDocGroups={[]} />;
  }

  return <OnboardingClient user={user} onComplete={handleOnboardingComplete} />;
}
