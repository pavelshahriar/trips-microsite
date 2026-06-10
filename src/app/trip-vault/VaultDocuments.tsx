"use client";

import { useState } from "react";
import type { User } from "@supabase/supabase-js";
import { ExternalLink, FileText, Image as ImageIcon, Car, Hotel, Plane, Map, FolderOpen, User as UserIcon } from "lucide-react";
import VaultDocs, { type VaultDoc } from "./VaultDocs";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface TripDocFile {
  path: string;
  displayName: string;
  signedUrl: string;
  mimeType: "pdf" | "image";
}

export interface TripDocGroup {
  title: string;
  emoji: string;
  folder: "overview" | "bookings" | "flights";
  files: TripDocFile[];
}

type DocSubTab = "trip" | "mine";

// ── Helpers ───────────────────────────────────────────────────────────────────

function bookingIcon(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes("car") || lower.includes("rental")) return <Car size={16} />;
  if (lower.includes("hotel") || lower.includes("inn") || lower.includes("suites")) return <Hotel size={16} />;
  if (lower.includes("flight") || lower.includes("air")) return <Plane size={16} />;
  if (lower.includes("itinerary") || lower.includes("schedule")) return <Map size={16} />;
  return <FileText size={16} />;
}

// ── Single file card ──────────────────────────────────────────────────────────

function DocCard({ file }: { file: TripDocFile }) {
  return (
    <a
      href={file.signedUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-xl p-4 group transition-colors"
      style={{
        backgroundColor: "var(--bg-surface)",
        border: "1px solid var(--color-border)",
        textDecoration: "none",
      }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{
          backgroundColor: "var(--bg-page)",
          border: "1px solid var(--color-border)",
          color: "var(--color-accent)",
        }}
      >
        {file.mimeType === "image" ? <ImageIcon size={16} /> : bookingIcon(file.displayName)}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: "var(--color-text)" }}>
          {file.displayName}
        </p>
        <p className="text-xs mt-0.5" style={{ color: "var(--color-muted)" }}>
          {file.mimeType === "image" ? "Image" : "PDF"} · tap to open
        </p>
      </div>

      <ExternalLink
        size={14}
        className="flex-shrink-0 opacity-40 group-hover:opacity-100 transition-opacity"
        style={{ color: "var(--color-muted)" }}
      />
    </a>
  );
}

// ── Group section ─────────────────────────────────────────────────────────────

function DocGroup({ group }: { group: TripDocGroup }) {
  if (group.files.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">{group.emoji}</span>
        <h3 className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
          {group.title}
        </h3>
        <span
          className="text-xs px-1.5 py-0.5 rounded-full"
          style={{
            backgroundColor: "color-mix(in srgb, var(--color-accent) 10%, transparent)",
            color: "var(--color-accent)",
          }}
        >
          {group.files.length}
        </span>
      </div>
      <div className="space-y-2">
        {group.files.map((f) => (
          <DocCard key={f.path} file={f} />
        ))}
      </div>
    </div>
  );
}

// ── Trip Docs list ────────────────────────────────────────────────────────────

function TripDocsList({ groups }: { groups: TripDocGroup[] }) {
  const hasFiles = groups.some((g) => g.files.length > 0);

  if (!hasFiles) {
    return (
      <div
        className="text-center py-16 rounded-2xl"
        style={{
          backgroundColor: "var(--bg-page)",
          border: "1px solid var(--color-border)",
        }}
      >
        <div className="text-4xl mb-4">📂</div>
        <p className="text-sm" style={{ color: "var(--color-muted)" }}>
          No documents yet. Upload files to the vault-docs bucket.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <DocGroup key={group.folder} group={group} />
      ))}
      <p className="text-xs text-center pb-4" style={{ color: "var(--color-muted)" }}>
        Links expire after 1 hour · refresh for new ones
      </p>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface VaultDocumentsProps {
  groups: TripDocGroup[];
  user: User;
  initialDocs: VaultDoc[];
}

export default function VaultDocuments({ groups, user, initialDocs }: VaultDocumentsProps) {
  const [subtab, setSubtab] = useState<DocSubTab>("trip");

  const totalTripFiles = groups.reduce((sum, g) => sum + g.files.length, 0);

  return (
    <div>
      {/* Sub-tab bar — matches Photos pattern */}
      <div
        className="flex gap-1 rounded-xl p-1 mb-6"
        style={{ backgroundColor: "var(--bg-page)", border: "1px solid var(--color-border)" }}
      >
        <button
          onClick={() => setSubtab("trip")}
          className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors"
          style={{
            backgroundColor: subtab === "trip" ? "var(--bg-surface)" : "transparent",
            color: subtab === "trip" ? "var(--color-text)" : "var(--color-muted)",
            border: subtab === "trip" ? "1px solid var(--color-border)" : "1px solid transparent",
          }}
        >
          <FolderOpen size={14} />
          Trip Docs ({totalTripFiles})
        </button>

        <button
          onClick={() => setSubtab("mine")}
          className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors"
          style={{
            backgroundColor: subtab === "mine" ? "var(--bg-surface)" : "transparent",
            color: subtab === "mine" ? "var(--color-text)" : "var(--color-muted)",
            border: subtab === "mine" ? "1px solid var(--color-border)" : "1px solid transparent",
          }}
        >
          <UserIcon size={14} />
          My Docs ({initialDocs.filter(d => d.user_id === user.id).length})
        </button>
      </div>

      {subtab === "trip" && <TripDocsList groups={groups} />}
      {subtab === "mine" && <VaultDocs user={user} initialDocs={initialDocs} />}
    </div>
  );
}
