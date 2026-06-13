"use client";

import { useEffect, useRef, useCallback, useReducer } from "react";
import { X, ChevronLeft, ChevronRight, MapPin, Calendar, FileVideo, Image as ImageIcon } from "lucide-react";
import { type VaultPhoto, getMediaUrl, effectiveDateOf } from "./vault-types";
import { getCrewMemberByEmail } from "@/data/vault-crew";

// ── Helpers ───────────────────────────────────────────────────────────────────

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

function fmtCoords(lat: number, lng: number): string {
  const latDir = lat >= 0 ? "N" : "S";
  const lngDir = lng >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lng).toFixed(4)}°${lngDir}`;
}

function CrewName({ email }: { email: string }) {
  const m = getCrewMemberByEmail(email);
  return <>{m ? `${m.name} (${m.nickname})` : email}</>;
}

// ── Component ─────────────────────────────────────────────────────────────────

interface VaultMediaLightboxProps {
  items: VaultPhoto[];
  startIndex: number;
  onClose: () => void;
}

export default function VaultMediaLightbox({
  items,
  startIndex,
  onClose,
}: VaultMediaLightboxProps) {
  const indexRef = useRef(startIndex);
  // We use a ref + forced re-render pattern so keyboard handlers always see current index
  const containerRef = useRef<HTMLDivElement>(null);

  // Force re-render helper
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);

  const current = items[indexRef.current];

  const goPrev = useCallback(() => {
    if (indexRef.current > 0) {
      indexRef.current -= 1;
      forceUpdate();
    }
  }, []);

  const goNext = useCallback(() => {
    if (indexRef.current < items.length - 1) {
      indexRef.current += 1;
      forceUpdate();
    }
  }, [items.length]);

  // ── Keyboard nav ──────────────────────────────────────────────────────────

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "ArrowRight") goNext();
      else if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goPrev, goNext, onClose]);

  // ── Lock body scroll ───────────────────────────────────────────────────────

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // ── Touch swipe ───────────────────────────────────────────────────────────

  const touchStartX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) {
      dx < 0 ? goNext() : goPrev();
    }
    touchStartX.current = null;
  };

  if (!current) return null;

  const isVideo = current.media_type === "video";
  const mediaUrl = getMediaUrl(current.storage_path);
  const effectiveDate = effectiveDateOf(current);

  const hasPrev = indexRef.current > 0;
  const hasNext = indexRef.current < items.length - 1;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col"
      style={{ backgroundColor: "rgba(0,0,0,0.95)" }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── Top bar ── */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)",
        }}
      >
        {/* Counter */}
        <span className="text-sm text-white opacity-70">
          {indexRef.current + 1} / {items.length}
        </span>

        {/* Close */}
        <button
          onClick={onClose}
          className="p-2 rounded-full transition-colors"
          style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
          aria-label="Close"
        >
          <X size={18} className="text-white" />
        </button>
      </div>

      {/* ── Media area ── */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden min-h-0">
        {/* Prev arrow */}
        {hasPrev && (
          <button
            onClick={goPrev}
            className="absolute left-2 z-10 p-2 rounded-full transition-colors"
            style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
            aria-label="Previous"
          >
            <ChevronLeft size={22} className="text-white" />
          </button>
        )}

        {/* Media content */}
        <div className="flex items-center justify-center w-full h-full px-12 py-2">
          {isVideo ? (
            <video
              key={current.id} // Force remount when item changes
              src={mediaUrl}
              controls
              autoPlay
              className="max-w-full max-h-full rounded-lg"
              style={{ objectFit: "contain" }}
            />
          ) : (
            <img
              key={current.id}
              src={mediaUrl}
              alt={current.caption ?? ""}
              className="max-w-full max-h-full rounded-lg"
              style={{ objectFit: "contain" }}
            />
          )}
        </div>

        {/* Next arrow */}
        {hasNext && (
          <button
            onClick={goNext}
            className="absolute right-2 z-10 p-2 rounded-full transition-colors"
            style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
            aria-label="Next"
          >
            <ChevronRight size={22} className="text-white" />
          </button>
        )}
      </div>

      {/* ── Bottom info panel ── */}
      <div
        className="flex-shrink-0 px-4 pt-3 pb-5 space-y-2"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)",
        }}
      >
        {/* Caption */}
        {current.caption && (
          <p className="text-white text-sm font-medium leading-snug">
            {current.caption}
          </p>
        )}

        {/* Uploader */}
        <p className="text-xs opacity-60 text-white">
          Uploaded by <CrewName email={current.uploaded_by} />
        </p>

        {/* Metadata chips */}
        <div className="flex flex-wrap gap-2">
          {/* Date */}
          <span
            className="flex items-center gap-1 text-xs px-2 py-1 rounded-full"
            style={{ backgroundColor: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.85)" }}
          >
            <Calendar size={10} />
            {effectiveDate.toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
            {" · "}
            {effectiveDate.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })}
            {current.taken_at ? " (EXIF)" : " (upload)"}
          </span>

          {/* GPS */}
          {current.location_lat != null && current.location_lng != null && (
            <a
              href={`https://maps.google.com/?q=${current.location_lat},${current.location_lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs px-2 py-1 rounded-full"
              style={{
                backgroundColor: "rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.85)",
                textDecoration: "none",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <MapPin size={10} />
              {fmtCoords(current.location_lat, current.location_lng)}
            </a>
          )}

          {/* Dimensions */}
          {current.width != null && current.height != null && (
            <span
              className="flex items-center gap-1 text-xs px-2 py-1 rounded-full"
              style={{ backgroundColor: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.85)" }}
            >
              {isVideo ? <FileVideo size={10} /> : <ImageIcon size={10} />}
              {current.width} × {current.height}
            </span>
          )}

          {/* Duration (video only) */}
          {current.duration_secs != null && (
            <span
              className="flex items-center gap-1 text-xs px-2 py-1 rounded-full"
              style={{ backgroundColor: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.85)" }}
            >
              ⏱ {fmtDuration(current.duration_secs)}
            </span>
          )}

          {/* File size */}
          {current.file_size != null && (
            <span
              className="text-xs px-2 py-1 rounded-full"
              style={{ backgroundColor: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.85)" }}
            >
              {fmtFileSize(current.file_size)}
            </span>
          )}

          {/* Visibility badge */}
          <span
            className="text-xs px-2 py-1 rounded-full"
            style={{
              backgroundColor: current.is_public
                ? "rgba(52,211,153,0.2)"
                : "rgba(255,255,255,0.1)",
              color: current.is_public ? "#6ee7b7" : "rgba(255,255,255,0.6)",
            }}
          >
            {current.is_public ? "🌍 Shared with crew" : "🔒 Private"}
          </span>
        </div>
      </div>
    </div>
  );
}

