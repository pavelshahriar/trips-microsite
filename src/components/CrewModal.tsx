"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download } from "lucide-react";
import type { CrewMember } from "@/data/trip";

interface CrewModalProps {
  member: CrewMember | null;
  onClose: () => void;
}

/** Convert a 3- or 6-char hex color to rgba(). Avoids broken "#55510" style strings. */
function rgba(hex: string, alpha: number): string {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export default function CrewModal({ member, onClose }: CrewModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const downloadRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  // Resolved CSS-variable values — html2canvas cannot resolve var() on inline styles,
  // so we read the computed values once after mount and use them directly in JSX.
  const [resolvedBg,    setResolvedBg]    = useState("#ffffff");
  const [resolvedText,  setResolvedText]  = useState("#1a1a2e");
  const [resolvedMuted, setResolvedMuted] = useState("#6b6b80");

  useEffect(() => {
    const cs = getComputedStyle(document.documentElement);
    setResolvedBg   (cs.getPropertyValue("--bg-surface").trim()  || "#ffffff");
    setResolvedText (cs.getPropertyValue("--color-text").trim()  || "#1a1a2e");
    setResolvedMuted(cs.getPropertyValue("--color-muted").trim() || "#6b6b80");
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    if (member) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [member]);

  const accentColor = member?.teamColor === "#000000" ? "#555555" : (member?.teamColor ?? "#888888");

  const handleDownload = async () => {
    if (!downloadRef.current || !member) return;
    setDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const el = downloadRef.current;
      const captureWidth = el.clientWidth; // ~382px — bounded by max-w-sm modal

      // Resolve CSS variables that html2canvas cannot handle (it reads computed styles
      // from the live document, but var() on inline styles goes unresolved in the clone)
      const cs = getComputedStyle(document.documentElement);
      const bgColor  = cs.getPropertyValue("--bg-surface").trim()  || "#ffffff";

      // Pin the element to an explicit pixel width before cloning so html2canvas
      // doesn't re-flow it at windowWidth (which would be the full desktop viewport).
      const prevWidth    = el.style.width;
      const prevMaxWidth = el.style.maxWidth;
      el.style.width    = captureWidth + "px";
      el.style.maxWidth = captureWidth + "px";

      const canvas = await html2canvas(el, {
        useCORS: true,
        scale: 2,
        backgroundColor: bgColor,
        logging: false,
        allowTaint: true,
        width: captureWidth,
        height: el.scrollHeight + 4,
        windowWidth: captureWidth,   // ← matches element width → no layout bleed
        windowHeight: el.scrollHeight + 4,
      });

      // Restore
      el.style.width    = prevWidth;
      el.style.maxWidth = prevMaxWidth;

      const link = document.createElement("a");
      link.download = `${member.name.toLowerCase().replace(/\s+/g, "-")}-wc26.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <AnimatePresence>
      {member && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
          onClick={onClose}
        >
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.93, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 24 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            ref={cardRef}
            className="relative w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl select-none"
            style={{
              background: "var(--bg-surface)",
              border: `1px solid ${rgba(accentColor, 0.4)}`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── Download capture area ──
                ALL styling is explicit inline — zero Tailwind classes.
                html2canvas cannot resolve Tailwind utility classes reliably in
                its cloned document, causing text reflow, wrong sizes, and
                invisible elements. Inline styles are read directly off the node. ── */}
            <div ref={downloadRef} style={{ width: "100%", overflow: "hidden", background: resolvedBg }}>

              {/* Hero photo — plain <img> + overflow:hidden = reliable crop.
                  html2canvas honours overflow:hidden clipping but NOT object-fit,
                  so we let the square image render at full width (382px→382px tall)
                  and clip the container to 320px — identical to what the browser shows. */}
              <div style={{ position: "relative", width: "100%", height: "320px", overflow: "hidden" }}>
                {member.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={member.photo}
                    alt={member.name}
                    crossOrigin="anonymous"
                    style={{ width: "100%", height: "auto", display: "block" }}
                  />
                ) : (
                  <div style={{
                    width: "100%", height: "100%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "60px", fontWeight: 900,
                    background: `linear-gradient(135deg, ${rgba(accentColor, 0.4)}, ${rgba(accentColor, 0.7)})`,
                    color: "#fff",
                  }}>
                    {member.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                  </div>
                )}

                {/* Gradient fade into card body */}
                <div style={{
                  position: "absolute", left: 0, right: 0, bottom: 0, height: "40px",
                  background: `linear-gradient(to bottom, transparent, ${resolvedBg})`,
                }} />

                {/* Team accent stripe */}
                <div style={{
                  position: "absolute", left: 0, right: 0, top: 0, height: "4px",
                  background: `linear-gradient(90deg, ${accentColor}, ${rgba(accentColor, 0.4)})`,
                }} />

                {/* Close button — NOT captured */}
                <button
                  data-html2canvas-ignore="true"
                  onClick={onClose}
                  style={{
                    position: "absolute", top: "12px", right: "12px", zIndex: 10,
                    width: "32px", height: "32px", borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    backgroundColor: "rgba(0,0,0,0.45)", color: "#fff", border: "none", cursor: "pointer",
                  }}
                >
                  <X size={15} />
                </button>
              </div>

              {/* Name / nickname / location */}
              <div style={{ padding: "20px 24px 16px", textAlign: "center" }}>
                <h2 style={{ fontSize: "20px", fontWeight: 900, margin: 0, color: resolvedText }}>
                  {member.name}
                </h2>
                <p style={{ fontSize: "14px", fontWeight: 700, margin: "2px 0 0", color: accentColor }}>
                  &ldquo;{member.nickname}&rdquo;
                </p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", marginTop: "8px" }}>
                  <span style={{ fontSize: "14px", lineHeight: 1 }}>{member.flag}</span>
                  <span style={{ fontSize: "11px", lineHeight: 1, color: resolvedMuted }}>·</span>
                  <span style={{ fontSize: "12px", lineHeight: 1, color: resolvedMuted }}>{member.from}</span>
                </div>
              </div>

              {/* Bio */}
              <div style={{
                margin: "0 16px 20px",
                padding: "16px",
                borderRadius: "16px",
                backgroundColor: rgba(accentColor, 0.06),
                border: `1px solid ${rgba(accentColor, 0.15)}`,
              }}>
                <p style={{ fontSize: "14px", lineHeight: 1.6, margin: 0, color: resolvedMuted }}>
                  {member.bio}
                </p>
              </div>

              {/* Watermark */}
              <div style={{ textAlign: "center", paddingTop: "8px", paddingBottom: "20px" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.04em", color: accentColor }}>
                  wc26-us-roadtrip.netlify.app
                </span>
              </div>
            </div>

            {/* ── Footer (not captured in download) ── */}
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{ borderTop: "1px solid var(--color-border)" }}
            >
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                style={{
                  backgroundColor: rgba(accentColor, 0.12),
                  border: `1px solid ${rgba(accentColor, 0.35)}`,
                  color: accentColor,
                }}
              >
                <span>{member.teamEmoji}</span>
                <span>{member.team}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full hover:opacity-80 transition-opacity disabled:opacity-50"
                  style={{ backgroundColor: rgba(accentColor, 0.15), color: accentColor, border: `1px solid ${rgba(accentColor, 0.3)}` }}
                  title="Save as image"
                >
                  <Download size={12} />
                  {downloading ? "..." : "Save"}
                </button>
                <a
                  href={member.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: "#1877F2", color: "#fff" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </a>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
