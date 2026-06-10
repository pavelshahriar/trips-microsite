"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import type { User } from "@supabase/supabase-js";
import { Camera, FolderOpen, LogOut, Lock, ShieldCheck } from "lucide-react";
import VaultGallery, { type VaultPhoto } from "./VaultGallery";
import { type VaultDoc } from "./VaultDocs";
import VaultDocuments, { type TripDocGroup } from "./VaultDocuments";
import { getCrewMemberByEmail, UNKNOWN_CREW } from "@/data/vault-crew";

type VaultTab = "photos" | "documents";

interface VaultClientProps {
  user: User;
  initialPhotos: VaultPhoto[];
  initialDocs: VaultDoc[];
  tripDocGroups: TripDocGroup[];
}

export default function VaultClient({
  user,
  initialPhotos,
  initialDocs,
  tripDocGroups,
}: VaultClientProps) {
  const supabase = createClient();
  const [tab, setTab] = useState<VaultTab>("photos");
  const [signingOut, setSigningOut] = useState(false);

  const crew = getCrewMemberByEmail(user.email ?? "") ?? UNKNOWN_CREW;

  const handleSignOut = async () => {
    setSigningOut(true);
    await supabase.auth.signOut();
    window.location.href = "/trip-vault/login";
  };

  const tabs: { id: VaultTab; label: string; Icon: React.ElementType }[] = [
    { id: "photos",    label: "Photos",    Icon: Camera },
    { id: "documents", label: "Documents", Icon: FolderOpen },
  ];

  return (
    <div className="pt-24 pb-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div
          className="flex items-center justify-between mb-8 rounded-2xl px-5 py-4"
          style={{
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
              style={{
                background:
                  "color-mix(in srgb, var(--color-accent) 10%, transparent)",
                border:
                  "1px solid color-mix(in srgb, var(--color-accent) 25%, transparent)",
              }}
            >
              🔓
            </div>
            <div>
              <p
                className="text-sm font-bold leading-tight"
                style={{ color: "var(--color-text)" }}
              >
                {crew.name} &middot;{" "}
                <span style={{ color: "var(--color-muted)" }}>{crew.nickname}</span>
              </p>
              <div
                className="flex items-center gap-1 text-xs mt-0.5"
                style={{ color: "var(--color-muted)" }}
              >
                <Lock size={10} />
                <span>Crew access only</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Admin link — only shown to admins (middleware already guards the route) */}
            <a
              href="/trip-vault/admin"
              className="hidden sm:flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors"
              style={{
                backgroundColor: "var(--bg-page)",
                border: "1px solid var(--color-border)",
                color: "var(--color-muted)",
                textDecoration: "none",
              }}
            >
              <ShieldCheck size={12} />
              Admin
            </a>

            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
              style={{
                backgroundColor: "var(--bg-page)",
                border: "1px solid var(--color-border)",
                color: "var(--color-muted)",
              }}
            >
              <LogOut size={12} />
              {signingOut ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </div>

        {/* Section title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold" style={{ color: "var(--color-text)" }}>
            Trip Vault
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-muted)" }}>
            Private space for the crew. Photos, documents, and all the booking chaos.
          </p>
        </div>

        {/* Tab bar */}
        <div
          className="flex gap-1 rounded-xl p-1 mb-8"
          style={{ backgroundColor: "var(--bg-surface)" }}
        >
          {tabs.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-sm font-medium transition-all"
              style={{
                backgroundColor:
                  tab === id ? "var(--bg-page)" : "transparent",
                color:
                  tab === id ? "var(--color-text)" : "var(--color-muted)",
                border:
                  tab === id
                    ? "1px solid var(--color-border)"
                    : "1px solid transparent",
              }}
            >
              <Icon size={14} />
              <span className="hidden sm:inline">{label}</span>
              {/* Mobile: short labels */}
              <span className="sm:hidden">
                {id === "photos" ? "Photos" : "Docs"}
              </span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === "photos" && (
          <VaultGallery user={user} initialPhotos={initialPhotos} />
        )}
        {tab === "documents" && (
          <VaultDocuments groups={tripDocGroups} user={user} initialDocs={initialDocs} />
        )}
      </div>
    </div>
  );
}
