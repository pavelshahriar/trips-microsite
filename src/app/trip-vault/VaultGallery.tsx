"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase-browser";
import type { User } from "@supabase/supabase-js";
import {
  Globe,
  Lock,
  Upload,
  X,
  Users,
  User as UserIcon,
  LayoutGrid,
  Clock,
  Play,
  MapPin,
  Film,
  Check,
  AlertCircle,
  Plus,
  Camera,
} from "lucide-react";
import { getCrewMemberByEmail } from "@/data/vault-crew";
import {
  type VaultPhoto,
  getMediaUrl,
  effectiveDateOf,
} from "./vault-types";
import VaultMediaLightbox from "./VaultMediaLightbox";

// Re-export so VaultClient can still import VaultPhoto from this file
export type { VaultPhoto };

// ── Pending-item shape (pre-upload queue) ─────────────────────────────────────

interface PendingItem {
  id: string;
  file: File;
  /** Object URL (photo) or canvas dataURL (video thumbnail) */
  preview: string;
  mediaType: "photo" | "video";
  caption: string;
  isPublic: boolean;
  // Metadata extracted client-side
  takenAt: string | null;
  lat: number | null;
  lng: number | null;
  width: number | null;
  height: number | null;
  durationSecs: number | null;
  thumbnailDataUrl: string | null; // video thumbnail only
  uploadState: "idle" | "uploading" | "done" | "error";
  error?: string;
}

// ── Pure helpers ──────────────────────────────────────────────────────────────

function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

function fmtDateHeader(key: string): string {
  return new Date(`${key}T12:00:00Z`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function fmtFileSize(bytes: number): string {
  return bytes < 1_048_576
    ? `${(bytes / 1024).toFixed(0)} KB`
    : `${(bytes / 1_048_576).toFixed(1)} MB`;
}

function fmtDuration(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, b64] = dataUrl.split(",");
  const mime = header.match(/:(.*?);/)?.[1] ?? "image/jpeg";
  const binary = atob(b64);
  const arr = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

function groupByDate(
  items: VaultPhoto[]
): { key: string; label: string; items: VaultPhoto[] }[] {
  const map = new Map<string, VaultPhoto[]>();
  for (const item of items) {
    const k = dateKey(effectiveDateOf(item));
    const arr = map.get(k) ?? [];
    arr.push(item);
    map.set(k, arr);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b)) // chronological ASC
    .map(([key, groupItems]) => ({
      key,
      label: fmtDateHeader(key),
      items: [...groupItems].sort(
        (a, b) => effectiveDateOf(a).getTime() - effectiveDateOf(b).getTime()
      ),
    }));
}

// ── EXIF / video metadata extraction ─────────────────────────────────────────

async function extractPhotoExif(file: File): Promise<{
  takenAt: string | null;
  lat: number | null;
  lng: number | null;
  width: number | null;
  height: number | null;
}> {
  try {
    // Dynamic import avoids SSR issues (exifr uses browser APIs)
    const exifr = await import("exifr");
    const tags = await exifr.parse(file, {
      pick: [
        "DateTimeOriginal",
        "CreateDate",
        "GPSLatitude",
        "GPSLongitude",
        "GPSLatitudeRef",
        "GPSLongitudeRef",
        "ExifImageWidth",
        "ExifImageHeight",
        "ImageWidth",
        "ImageHeight",
        "PixelXDimension",
        "PixelYDimension",
      ],
    });
    if (!tags) throw new Error("no tags");

    const rawDate = tags.DateTimeOriginal ?? tags.CreateDate;
    const takenAt = rawDate ? new Date(rawDate).toISOString() : null;

    const lat =
      tags.GPSLatitude != null
        ? tags.GPSLatitudeRef === "S"
          ? -tags.GPSLatitude
          : tags.GPSLatitude
        : null;
    const lng =
      tags.GPSLongitude != null
        ? tags.GPSLongitudeRef === "W"
          ? -tags.GPSLongitude
          : tags.GPSLongitude
        : null;

    const width =
      tags.ExifImageWidth ??
      tags.PixelXDimension ??
      tags.ImageWidth ??
      null;
    const height =
      tags.ExifImageHeight ??
      tags.PixelYDimension ??
      tags.ImageHeight ??
      null;

    return { takenAt, lat, lng, width, height };
  } catch {
    return {
      takenAt: new Date(file.lastModified).toISOString(),
      lat: null,
      lng: null,
      width: null,
      height: null,
    };
  }
}

async function extractVideoMeta(file: File): Promise<{
  durationSecs: number | null;
  width: number | null;
  height: number | null;
  thumbnailDataUrl: string | null;
  takenAt: string;
}> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    const url = URL.createObjectURL(file);
    video.src = url;
    video.muted = true;
    video.playsInline = true;
    video.preload = "metadata";

    const finish = (thumb: string | null) => {
      URL.revokeObjectURL(url);
      resolve({
        durationSecs: isFinite(video.duration) ? video.duration : null,
        width: video.videoWidth || null,
        height: video.videoHeight || null,
        thumbnailDataUrl: thumb,
        takenAt: new Date(file.lastModified).toISOString(),
      });
    };

    const drawThumb = () => {
      try {
        const canvas = document.createElement("canvas");
        const scale = Math.min(1, 640 / (video.videoWidth || 640));
        canvas.width = Math.round((video.videoWidth || 640) * scale);
        canvas.height = Math.round((video.videoHeight || 360) * scale);
        canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);
        finish(canvas.toDataURL("image/jpeg", 0.7));
      } catch {
        finish(null);
      }
    };

    video.addEventListener("loadedmetadata", () => {
      // Seek to ~5% into video to get a representative frame
      video.currentTime = Math.min(1, (video.duration || 2) * 0.05);
    });

    const onSeeked = () => {
      clearTimeout(safetyTimer);
      video.removeEventListener("seeked", onSeeked);
      drawThumb();
    };
    video.addEventListener("seeked", onSeeked);
    video.addEventListener("error", () => {
      clearTimeout(safetyTimer);
      finish(null);
    });

    // Safety timeout — some formats/codecs take a while
    const safetyTimer = setTimeout(() => {
      video.removeEventListener("seeked", onSeeked);
      finish(null);
    }, 8000);
  });
}

async function processFile(file: File): Promise<PendingItem> {
  const id = Math.random().toString(36).slice(2);
  const isVideo = file.type.startsWith("video/");

  if (isVideo) {
    const meta = await extractVideoMeta(file);
    return {
      id,
      file,
      preview: meta.thumbnailDataUrl ?? "",
      mediaType: "video",
      caption: "",
      isPublic: false,
      takenAt: meta.takenAt,
      lat: null,
      lng: null,
      width: meta.width,
      height: meta.height,
      durationSecs: meta.durationSecs,
      thumbnailDataUrl: meta.thumbnailDataUrl,
      uploadState: "idle",
    };
  } else {
    const preview = URL.createObjectURL(file);
    const exif = await extractPhotoExif(file);
    return {
      id,
      file,
      preview,
      mediaType: "photo",
      caption: "",
      isPublic: false,
      takenAt: exif.takenAt,
      lat: exif.lat,
      lng: exif.lng,
      width: exif.width,
      height: exif.height,
      durationSecs: null,
      thumbnailDataUrl: null,
      uploadState: "idle",
    };
  }
}

// ── Sub-components ────────────────────────────────────────────────────────────

function CrewName({ email }: { email: string }) {
  const m = getCrewMemberByEmail(email);
  return <span>{m ? `${m.name} · ${m.nickname}` : email}</span>;
}

// ── PendingCard ───────────────────────────────────────────────────────────────

interface PendingCardProps {
  item: PendingItem;
  onRemove: () => void;
  onCaptionChange: (v: string) => void;
  onTogglePublic: () => void;
}

function PendingCard({
  item,
  onRemove,
  onCaptionChange,
  onTogglePublic,
}: PendingCardProps) {
  return (
    <div
      className="flex gap-3 p-3 rounded-xl transition-opacity"
      style={{
        backgroundColor: "var(--bg-page)",
        border: "1px solid var(--color-border)",
        opacity: item.uploadState === "done" ? 0.45 : 1,
      }}
    >
      {/* Thumbnail */}
      <div
        className="relative flex-shrink-0 rounded-lg overflow-hidden"
        style={{ width: 72, height: 72, backgroundColor: "var(--bg-surface)" }}
      >
        {item.preview ? (
          <img src={item.preview} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Film size={24} style={{ color: "var(--color-muted)" }} />
          </div>
        )}

        {item.mediaType === "video" && item.uploadState === "idle" && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor: "rgba(0,0,0,0.35)" }}
          >
            <Play size={14} className="text-white" fill="white" />
          </div>
        )}
        {item.uploadState === "uploading" && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
          >
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {item.uploadState === "done" && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
          >
            <Check size={16} className="text-white" />
          </div>
        )}
        {item.uploadState === "error" && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor: "rgba(180,0,0,0.65)" }}
          >
            <AlertCircle size={16} className="text-white" />
          </div>
        )}
      </div>

      {/* Form fields */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* File info chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className="text-xs px-1.5 py-0.5 rounded"
            style={{
              backgroundColor:
                item.mediaType === "video"
                  ? "rgba(139,92,246,0.15)"
                  : "rgba(59,130,246,0.15)",
              color: item.mediaType === "video" ? "#a78bfa" : "#60a5fa",
            }}
          >
            {item.mediaType === "video" ? "📹 Video" : "📷 Photo"}
          </span>
          <span className="text-xs" style={{ color: "var(--color-muted)" }}>
            {fmtFileSize(item.file.size)}
          </span>
          {item.durationSecs != null && (
            <span className="text-xs" style={{ color: "var(--color-muted)" }}>
              {fmtDuration(item.durationSecs)}
            </span>
          )}
          {item.takenAt && (
            <span className="text-xs flex items-center gap-0.5" style={{ color: "var(--color-muted)" }}>
              📅{" "}
              {new Date(item.takenAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          )}
          {item.lat != null && (
            <span className="text-xs flex items-center gap-0.5" style={{ color: "var(--color-muted)" }}>
              <MapPin size={9} /> GPS
            </span>
          )}
        </div>

        {/* Caption */}
        <input
          type="text"
          value={item.caption}
          onChange={(e) => onCaptionChange(e.target.value)}
          placeholder="Caption (optional)"
          disabled={item.uploadState !== "idle"}
          className="w-full text-sm rounded-lg px-3 py-1.5 outline-none"
          style={{
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--color-border)",
            color: "var(--color-text)",
          }}
        />

        {/* Controls */}
        <div className="flex items-center justify-between">
          <button
            onClick={onTogglePublic}
            disabled={item.uploadState !== "idle"}
            className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg transition-colors"
            style={{
              backgroundColor: item.isPublic
                ? "color-mix(in srgb, var(--color-accent) 15%, transparent)"
                : "var(--bg-surface)",
              color: item.isPublic ? "var(--color-accent)" : "var(--color-muted)",
              border: "1px solid",
              borderColor: item.isPublic
                ? "color-mix(in srgb, var(--color-accent) 30%, transparent)"
                : "var(--color-border)",
            }}
          >
            {item.isPublic ? <Globe size={10} /> : <Lock size={10} />}
            {item.isPublic ? "Crew can see" : "Just me"}
          </button>

          {item.uploadState !== "uploading" && item.uploadState !== "done" && (
            <button
              onClick={onRemove}
              className="p-1 rounded"
              style={{ color: "var(--color-muted)" }}
            >
              <X size={13} />
            </button>
          )}
        </div>

        {item.uploadState === "error" && (
          <p className="text-xs" style={{ color: "#f87171" }}>
            {item.error ?? "Upload failed — try again"}
          </p>
        )}
      </div>
    </div>
  );
}

// ── MediaCard ─────────────────────────────────────────────────────────────────

interface MediaCardProps {
  item: VaultPhoto;
  showUploader: boolean;
  onClick: () => void;
  onTogglePublic?: () => void;
}

function MediaCard({ item, showUploader, onClick, onTogglePublic }: MediaCardProps) {
  const isVideo = item.media_type === "video";

  // Determine what URL to use as the grid thumbnail
  const thumbPath = isVideo ? item.thumbnail_path : item.storage_path;
  const thumbUrl = thumbPath ? getMediaUrl(thumbPath) : null;

  return (
    <div
      className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer"
      style={{ backgroundColor: "var(--bg-surface)" }}
      onClick={onClick}
    >
      {thumbUrl ? (
        <img
          src={thumbUrl}
          alt={item.caption ?? ""}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Film size={32} style={{ color: "var(--color-muted)", opacity: 0.4 }} />
        </div>
      )}

      {/* Video play badge */}
      {isVideo && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
          >
            <Play size={16} className="text-white" fill="white" />
          </div>
        </div>
      )}

      {/* Hover overlay */}
      <div
        className="absolute inset-0 flex flex-col justify-end p-2 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 55%)",
        }}
      >
        {item.caption && (
          <p className="text-xs text-white leading-tight mb-1 line-clamp-2">
            {item.caption}
          </p>
        )}
        <div className="flex items-center justify-between gap-1">
          {showUploader ? (
            <span className="text-xs truncate" style={{ color: "rgba(255,255,255,0.7)" }}>
              <CrewName email={item.uploaded_by} />
            </span>
          ) : (
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.7)" }}>
              {item.taken_at
                ? new Date(item.taken_at).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : new Date(item.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
            </span>
          )}
          <div className="flex items-center gap-1 pointer-events-auto">
            {item.location_lat != null && (
              <MapPin size={9} className="text-white opacity-60" />
            )}
            {!showUploader && onTogglePublic && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTogglePublic();
                }}
                className="flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded-full"
                style={{ backgroundColor: "rgba(255,255,255,0.2)", color: "white" }}
              >
                {item.is_public ? <Globe size={9} /> : <Lock size={9} />}
                {item.is_public ? "Shared" : "Mine"}
              </button>
            )}
          </div>
        </div>
      </div>

      {item.is_gift_selfie && (
        <div
          className="absolute top-1.5 left-1.5 text-xs px-1.5 py-0.5 rounded-full"
          style={{ backgroundColor: "rgba(0,0,0,0.6)", color: "white" }}
        >
          🎁
        </div>
      )}
    </div>
  );
}

// ── Main VaultGallery component ───────────────────────────────────────────────

type GalleryTab = "mine" | "crew";
type ViewMode = "grid" | "timeline";

interface VaultGalleryProps {
  user: User;
  initialPhotos: VaultPhoto[];
}

export default function VaultGallery({ user, initialPhotos }: VaultGalleryProps) {
  const supabase = createClient();

  const [photos, setPhotos] = useState<VaultPhoto[]>(initialPhotos);
  const [tab, setTab] = useState<GalleryTab>("mine");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cleanup object URLs when component unmounts
  useEffect(() => {
    return () => {
      for (const item of pendingItems) {
        if (item.mediaType === "photo" && item.preview.startsWith("blob:")) {
          URL.revokeObjectURL(item.preview);
        }
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Derived lists ──────────────────────────────────────────────────────────

  const myPhotos = photos.filter((p) => p.user_id === user.id);
  const crewPhotos = photos.filter((p) => p.is_public);
  const displayPhotos = tab === "mine" ? myPhotos : crewPhotos;

  // Grid: newest-first (DESC). Timeline: oldest-first (ASC).
  const sortedPhotos =
    viewMode === "grid"
      ? [...displayPhotos].sort(
          (a, b) => effectiveDateOf(b).getTime() - effectiveDateOf(a).getTime()
        )
      : [...displayPhotos].sort(
          (a, b) => effectiveDateOf(a).getTime() - effectiveDateOf(b).getTime()
        );

  const dateGroups = viewMode === "timeline" ? groupByDate(displayPhotos) : [];

  // ── File selection / drop ──────────────────────────────────────────────────

  const handleFilesSelected = useCallback(async (files: FileList) => {
    if (!files.length) return;
    setIsProcessing(true);
    const processed = await Promise.all(Array.from(files).map(processFile));
    setPendingItems((prev) => [...prev, ...processed]);
    setIsProcessing(false);
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFilesSelected(e.target.files);
    // Reset so the same file can be re-selected if removed
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) handleFilesSelected(e.dataTransfer.files);
  };

  // ── Queue mutations ────────────────────────────────────────────────────────

  const removePending = (id: string) => {
    setPendingItems((prev) => {
      const item = prev.find((p) => p.id === id);
      if (item?.mediaType === "photo" && item.preview.startsWith("blob:")) {
        URL.revokeObjectURL(item.preview);
      }
      return prev.filter((p) => p.id !== id);
    });
  };

  const updateCaption = (id: string, caption: string) =>
    setPendingItems((prev) =>
      prev.map((p) => (p.id === id ? { ...p, caption } : p))
    );

  const togglePublicPending = (id: string) =>
    setPendingItems((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isPublic: !p.isPublic } : p))
    );

  // ── Upload ─────────────────────────────────────────────────────────────────

  const handleUploadAll = async () => {
    const toUpload = pendingItems.filter((i) => i.uploadState === "idle");
    if (!toUpload.length) return;
    setIsUploading(true);

    const newPhotos: VaultPhoto[] = [];

    for (const item of toUpload) {
      setPendingItems((prev) =>
        prev.map((p) => (p.id === item.id ? { ...p, uploadState: "uploading" } : p))
      );

      try {
        const ext =
          item.file.name.split(".").pop()?.toLowerCase() ??
          (item.mediaType === "video" ? "mp4" : "jpg");
        const base = `${user.id}/${Date.now()}_${Math.random().toString(36).slice(2)}`;
        const storagePath = `${base}.${ext}`;

        // Upload main file (full resolution)
        const { error: storageErr } = await supabase.storage
          .from("vault-photos")
          .upload(storagePath, item.file, { contentType: item.file.type });

        if (storageErr) throw storageErr;

        // Upload video thumbnail separately
        let thumbnailPath: string | null = null;
        if (item.mediaType === "video" && item.thumbnailDataUrl) {
          const thumbPath = `${base}_thumb.jpg`;
          const thumbBlob = dataUrlToBlob(item.thumbnailDataUrl);
          const { error: thumbErr } = await supabase.storage
            .from("vault-photos")
            .upload(thumbPath, thumbBlob, { contentType: "image/jpeg" });
          if (!thumbErr) thumbnailPath = thumbPath;
        }

        // Insert DB row with all metadata columns
        const { data: row, error: dbErr } = await supabase
          .from("vault_photos")
          .insert({
            user_id: user.id,
            uploaded_by: user.email,
            storage_path: storagePath,
            caption: item.caption.trim() || null,
            is_public: item.isPublic,
            is_gift_selfie: false,
            media_type: item.mediaType,
            file_size: item.file.size,
            original_filename: item.file.name,
            mime_type: item.file.type,
            width: item.width,
            height: item.height,
            duration_secs: item.durationSecs,
            taken_at: item.takenAt,
            location_lat: item.lat,
            location_lng: item.lng,
            thumbnail_path: thumbnailPath,
          })
          .select()
          .single();

        if (dbErr || !row) throw dbErr ?? new Error("No row returned");

        newPhotos.push(row as VaultPhoto);
        setPendingItems((prev) =>
          prev.map((p) => (p.id === item.id ? { ...p, uploadState: "done" } : p))
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Upload failed";
        setPendingItems((prev) =>
          prev.map((p) =>
            p.id === item.id ? { ...p, uploadState: "error", error: msg } : p
          )
        );
      }
    }

    // Merge successful uploads, clear done items from queue
    if (newPhotos.length > 0) {
      setPhotos((prev) => [...newPhotos, ...prev]);
    }
    setPendingItems((prev) => prev.filter((p) => p.uploadState !== "done"));
    setIsUploading(false);
  };

  const togglePublicGallery = async (photo: VaultPhoto) => {
    if (photo.user_id !== user.id) return;
    const newVal = !photo.is_public;
    const { error } = await supabase
      .from("vault_photos")
      .update({ is_public: newVal })
      .eq("id", photo.id);
    if (!error) {
      setPhotos((prev) =>
        prev.map((p) => (p.id === photo.id ? { ...p, is_public: newVal } : p))
      );
    }
  };

  const idleCount = pendingItems.filter((i) => i.uploadState === "idle").length;
  const errorCount = pendingItems.filter((i) => i.uploadState === "error").length;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Hidden file input — accept photos + videos + HEIC */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*,.heic,.HEIC"
        multiple
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* ── Tab bar: Mine / Crew ── */}
      <div
        className="flex gap-1 rounded-xl p-1 mb-5"
        style={{ backgroundColor: "var(--bg-page)" }}
      >
        {(["mine", "crew"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium transition-colors"
            style={{
              backgroundColor: tab === t ? "var(--bg-surface)" : "transparent",
              color: tab === t ? "var(--color-text)" : "var(--color-muted)",
              border: tab === t ? "1px solid var(--color-border)" : "1px solid transparent",
            }}
          >
            {t === "mine" ? (
              <>
                <UserIcon size={13} />
                Mine ({myPhotos.length})
              </>
            ) : (
              <>
                <Users size={13} />
                Crew ({crewPhotos.length})
              </>
            )}
          </button>
        ))}
      </div>

      {/* ── View mode toggle + Add button ── */}
      <div className="flex items-center justify-between mb-4 gap-2">
        <div
          className="flex rounded-lg overflow-hidden"
          style={{ border: "1px solid var(--color-border)" }}
        >
          {(["grid", "timeline"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors"
              style={{
                backgroundColor: viewMode === mode ? "var(--bg-surface)" : "transparent",
                color: viewMode === mode ? "var(--color-text)" : "var(--color-muted)",
              }}
            >
              {mode === "grid" ? <LayoutGrid size={12} /> : <Clock size={12} />}
              {mode === "grid" ? "Grid" : "Timeline"}
            </button>
          ))}
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
          className="flex items-center gap-1.5 text-sm font-medium px-4 py-1.5 rounded-lg transition-opacity disabled:opacity-50"
          style={{
            backgroundColor: "var(--color-accent)",
            color: "var(--bg-page)",
          }}
        >
          {isProcessing ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Reading…
            </>
          ) : (
            <>
              <Plus size={14} />
              Add media
            </>
          )}
        </button>
      </div>

      {/* ── Drop zone (visible only when queue is empty) ── */}
      {pendingItems.length === 0 && (
        <div
          className="w-full py-6 rounded-xl text-center mb-5 cursor-pointer transition-all"
          style={{
            border: `2px dashed ${isDragOver ? "var(--color-accent)" : "var(--color-border)"}`,
            backgroundColor: isDragOver
              ? "color-mix(in srgb, var(--color-accent) 6%, transparent)"
              : "transparent",
            color: "var(--color-muted)",
          }}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
        >
          <Camera size={22} className="mx-auto mb-2" style={{ opacity: 0.45 }} />
          <p className="text-sm">
            Drop photos & videos here or{" "}
            <span style={{ color: "var(--color-accent)" }}>browse</span>
          </p>
          <p className="text-xs mt-1" style={{ opacity: 0.55 }}>
            Select multiple files · photos and videos supported
          </p>
        </div>
      )}

      {/* ── Upload queue ── */}
      {pendingItems.length > 0 && (
        <div
          className="rounded-2xl overflow-hidden mb-6"
          style={{
            border: "1px solid var(--color-border)",
            backgroundColor: "var(--bg-surface)",
          }}
        >
          {/* Queue header */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: "1px solid var(--color-border)" }}
          >
            <span className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
              {pendingItems.length} file{pendingItems.length > 1 ? "s" : ""} ready
            </span>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-xs flex items-center gap-1"
              style={{ color: "var(--color-accent)" }}
            >
              <Plus size={11} /> Add more
            </button>
          </div>

          {/* Queue items (scrollable) */}
          <div className="p-3 space-y-2 max-h-96 overflow-y-auto">
            {pendingItems.map((item) => (
              <PendingCard
                key={item.id}
                item={item}
                onRemove={() => removePending(item.id)}
                onCaptionChange={(v) => updateCaption(item.id, v)}
                onTogglePublic={() => togglePublicPending(item.id)}
              />
            ))}
          </div>

          {/* Queue footer */}
          <div
            className="px-4 py-3 space-y-2"
            style={{ borderTop: "1px solid var(--color-border)" }}
          >
            {errorCount > 0 && (
              <p className="text-xs" style={{ color: "#f87171" }}>
                {errorCount} upload{errorCount > 1 ? "s" : ""} failed — check and retry
              </p>
            )}
            <div className="flex gap-2">
              <button
                onClick={handleUploadAll}
                disabled={isUploading || idleCount === 0}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-opacity disabled:opacity-50"
                style={{
                  backgroundColor: "var(--color-accent)",
                  color: "var(--bg-page)",
                }}
              >
                {isUploading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Uploading…
                  </>
                ) : (
                  <>
                    <Upload size={14} />
                    Upload{idleCount > 0 ? ` ${idleCount}` : ""} file
                    {idleCount !== 1 ? "s" : ""}
                  </>
                )}
              </button>
              {!isUploading && (
                <button
                  onClick={() => setPendingItems([])}
                  className="px-4 py-2.5 rounded-xl text-sm"
                  style={{
                    backgroundColor: "var(--bg-page)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-muted)",
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Empty state ── */}
      {displayPhotos.length === 0 && pendingItems.length === 0 && (
        <div
          className="text-center py-16 rounded-2xl"
          style={{
            backgroundColor: "var(--bg-page)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div className="text-4xl mb-4">{tab === "mine" ? "📷" : "🌍"}</div>
          <p className="text-sm" style={{ color: "var(--color-muted)" }}>
            {tab === "mine"
              ? "Nothing here yet — add photos and videos above."
              : "No shared media yet. Be the first to add something!"}
          </p>
        </div>
      )}

      {/* ── Grid view ── */}
      {viewMode === "grid" && sortedPhotos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {sortedPhotos.map((photo, idx) => (
            <MediaCard
              key={photo.id}
              item={photo}
              showUploader={tab === "crew"}
              onClick={() => setLightboxIndex(idx)}
              onTogglePublic={
                photo.user_id === user.id
                  ? () => togglePublicGallery(photo)
                  : undefined
              }
            />
          ))}
        </div>
      )}

      {/* ── Timeline view ── */}
      {viewMode === "timeline" && sortedPhotos.length > 0 && (
        <div className="space-y-8">
          {dateGroups.map((group) => (
            <div key={group.key}>
              {/* Date separator */}
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px flex-1" style={{ backgroundColor: "var(--color-border)" }} />
                <span
                  className="text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0 whitespace-nowrap"
                  style={{
                    backgroundColor: "var(--bg-surface)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-muted)",
                  }}
                >
                  📅 {group.label}
                </span>
                <div className="h-px flex-1" style={{ backgroundColor: "var(--color-border)" }} />
              </div>

              {/* Photos for this date */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {group.items.map((photo) => {
                  const flatIdx = sortedPhotos.findIndex((p) => p.id === photo.id);
                  return (
                    <MediaCard
                      key={photo.id}
                      item={photo}
                      showUploader={tab === "crew"}
                      onClick={() => setLightboxIndex(flatIdx)}
                      onTogglePublic={
                        photo.user_id === user.id
                          ? () => togglePublicGallery(photo)
                          : undefined
                      }
                    />
                  );
                })}
              </div>

              {/* Day summary line */}
              <p
                className="text-xs mt-2 text-right"
                style={{ color: "var(--color-muted)", opacity: 0.6 }}
              >
                {group.items.length} item{group.items.length > 1 ? "s" : ""}
                {group.items.some((i) => i.media_type === "video") && (
                  <>
                    {" · "}
                    {group.items.filter((i) => i.media_type === "video").length} video
                    {group.items.filter((i) => i.media_type === "video").length > 1 ? "s" : ""}
                  </>
                )}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ── Lightbox ── */}
      {lightboxIndex !== null && (
        <VaultMediaLightbox
          items={sortedPhotos}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
}
