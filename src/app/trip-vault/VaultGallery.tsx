"use client";

import { useState, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase-browser";
import type { User } from "@supabase/supabase-js";
import { Camera, Globe, Lock, Upload, X, Users, User as UserIcon } from "lucide-react";
import Image from "next/image";
import { getCrewMemberByEmail } from "@/data/vault-crew";

export interface VaultPhoto {
  id: string;
  user_id: string;
  uploaded_by: string;
  storage_path: string;
  caption: string | null;
  is_public: boolean;
  is_gift_selfie: boolean;
  created_at: string;
}

interface VaultGalleryProps {
  user: User;
  initialPhotos: VaultPhoto[];
}

type GalleryTab = "mine" | "crew";

function getPhotoUrl(storagePath: string): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${url}/storage/v1/object/public/vault-photos/${storagePath}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function CrewName({ email }: { email: string }) {
  const member = getCrewMemberByEmail(email);
  return <span>{member ? `${member.name} · ${member.nickname}` : email}</span>;
}

export default function VaultGallery({ user, initialPhotos }: VaultGalleryProps) {
  const supabase = createClient();

  const [photos, setPhotos] = useState<VaultPhoto[]>(initialPhotos);
  const [tab, setTab] = useState<GalleryTab>("mine");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Upload form state
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreview, setPendingPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [makePublic, setMakePublic] = useState(false);
  const [showUploadPanel, setShowUploadPanel] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const myPhotos = photos.filter((p) => p.user_id === user.id);
  const crewPhotos = photos.filter((p) => p.is_public);

  const displayPhotos = tab === "mine" ? myPhotos : crewPhotos;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
    setPendingPreview(URL.createObjectURL(file));
    setShowUploadPanel(true);
  };

  const resetUpload = useCallback(() => {
    setPendingFile(null);
    setPendingPreview(null);
    setCaption("");
    setMakePublic(false);
    setShowUploadPanel(false);
    setUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const handleUpload = async () => {
    if (!pendingFile) return;
    setUploading(true);
    setUploadError(null);

    const ext = pendingFile.name.split(".").pop() ?? "jpg";
    const path = `${user.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

    const { error: storageError } = await supabase.storage
      .from("vault-photos")
      .upload(path, pendingFile, { contentType: pendingFile.type });

    if (storageError) {
      setUploadError("Upload failed. Check your connection and try again.");
      setUploading(false);
      return;
    }

    const { data: newRow, error: dbError } = await supabase
      .from("vault_photos")
      .insert({
        user_id: user.id,
        uploaded_by: user.email,
        storage_path: path,
        caption: caption.trim() || null,
        is_public: makePublic,
        is_gift_selfie: false,
      })
      .select()
      .single();

    setUploading(false);

    if (dbError || !newRow) {
      setUploadError("Saved to storage but metadata failed. Try refreshing.");
      return;
    }

    setPhotos((prev) => [newRow as VaultPhoto, ...prev]);
    resetUpload();
  };

  const togglePublic = async (photo: VaultPhoto) => {
    if (photo.user_id !== user.id) return;
    const newValue = !photo.is_public;

    const { error } = await supabase
      .from("vault_photos")
      .update({ is_public: newValue })
      .eq("id", photo.id);

    if (!error) {
      setPhotos((prev) =>
        prev.map((p) => (p.id === photo.id ? { ...p, is_public: newValue } : p))
      );
    }
  };

  return (
    <div>
      {/* Tab bar */}
      <div
        className="flex gap-1 rounded-xl p-1 mb-6"
        style={{ backgroundColor: "var(--bg-page)" }}
      >
        {(["mine", "crew"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors"
            style={{
              backgroundColor:
                tab === t ? "var(--bg-surface)" : "transparent",
              color: tab === t ? "var(--color-text)" : "var(--color-muted)",
              border: tab === t ? "1px solid var(--color-border)" : "1px solid transparent",
            }}
          >
            {t === "mine" ? (
              <>
                <UserIcon size={14} /> My Photos ({myPhotos.length})
              </>
            ) : (
              <>
                <Users size={14} /> Crew Album ({crewPhotos.length})
              </>
            )}
          </button>
        ))}
      </div>

      {/* Upload trigger */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {!showUploadPanel && (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium mb-6 transition-colors"
          style={{
            backgroundColor: "var(--bg-page)",
            border: "2px dashed var(--color-border)",
            color: "var(--color-muted)",
          }}
        >
          <Camera size={16} />
          Add a photo
        </button>
      )}

      {/* Upload panel */}
      {showUploadPanel && pendingPreview && (
        <div
          className="rounded-2xl overflow-hidden mb-6"
          style={{
            border: "1px solid var(--color-border)",
            backgroundColor: "var(--bg-surface)",
          }}
        >
          {/* Preview */}
          <div className="relative aspect-video">
            <Image
              src={pendingPreview}
              alt="Preview"
              fill
              className="object-cover"
            />
            <button
              onClick={resetUpload}
              className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
            >
              <X size={14} className="text-white" />
            </button>
          </div>

          {/* Form */}
          <div className="p-5 space-y-4">
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add a caption… (optional)"
              className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
              style={{
                backgroundColor: "var(--bg-page)",
                border: "1px solid var(--color-border)",
                color: "var(--color-text)",
              }}
            />

            {/* Public toggle */}
            <button
              onClick={() => setMakePublic((v) => !v)}
              className="flex items-center gap-3 w-full rounded-xl px-4 py-3 text-sm transition-colors"
              style={{
                backgroundColor: makePublic
                  ? "color-mix(in srgb, var(--color-accent) 10%, var(--bg-page))"
                  : "var(--bg-page)",
                border: makePublic
                  ? "1px solid color-mix(in srgb, var(--color-accent) 30%, transparent)"
                  : "1px solid var(--color-border)",
              }}
            >
              {makePublic ? (
                <Globe size={16} style={{ color: "var(--color-accent)" }} />
              ) : (
                <Lock size={16} style={{ color: "var(--color-muted)" }} />
              )}
              <span style={{ color: makePublic ? "var(--color-accent)" : "var(--color-muted)" }}>
                {makePublic
                  ? "Shared with crew ✓"
                  : "Just for me — tap to share with crew"}
              </span>
            </button>

            {uploadError && (
              <p className="text-xs" style={{ color: "#f87171" }}>
                {uploadError}
              </p>
            )}

            <button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-opacity disabled:opacity-50"
              style={{
                backgroundColor: "var(--color-accent)",
                color: "var(--bg-page)",
              }}
            >
              {uploading ? (
                "Uploading…"
              ) : (
                <>
                  <Upload size={14} />
                  Save photo
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Gallery grid */}
      {displayPhotos.length === 0 ? (
        <div
          className="text-center py-16 rounded-2xl"
          style={{
            backgroundColor: "var(--bg-page)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div className="text-4xl mb-4">
            {tab === "mine" ? "📷" : "🌍"}
          </div>
          <p className="text-sm" style={{ color: "var(--color-muted)" }}>
            {tab === "mine"
              ? "No photos yet — add your first one above."
              : "No crew photos yet. Be the first to share one!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {displayPhotos.map((photo) => (
            <div
              key={photo.id}
              className="relative aspect-square rounded-xl overflow-hidden group"
              style={{ backgroundColor: "var(--bg-page)" }}
            >
              <Image
                src={getPhotoUrl(photo.storage_path)}
                alt={photo.caption ?? "photo"}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, 33vw"
              />

              {/* Overlay on hover */}
              <div
                className="absolute inset-0 flex flex-col justify-end p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)",
                }}
              >
                {photo.caption && (
                  <p className="text-xs text-white leading-tight mb-1 line-clamp-2">
                    {photo.caption}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>
                    {tab === "crew" ? (
                      <CrewName email={photo.uploaded_by} />
                    ) : (
                      formatDate(photo.created_at)
                    )}
                  </span>

                  {/* Public / private toggle — only for your own photos */}
                  {photo.user_id === user.id && (
                    <button
                      onClick={() => togglePublic(photo)}
                      className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: photo.is_public
                          ? "rgba(255,255,255,0.2)"
                          : "rgba(255,255,255,0.1)",
                        color: photo.is_public ? "white" : "rgba(255,255,255,0.6)",
                      }}
                      title={photo.is_public ? "Remove from crew album" : "Add to crew album"}
                    >
                      {photo.is_public ? (
                        <Globe size={10} />
                      ) : (
                        <Lock size={10} />
                      )}
                      {photo.is_public ? "Shared" : "Private"}
                    </button>
                  )}
                </div>
              </div>

              {/* Gift selfie badge */}
              {photo.is_gift_selfie && (
                <div
                  className="absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: "rgba(0,0,0,0.6)",
                    color: "white",
                  }}
                >
                  🎁
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
