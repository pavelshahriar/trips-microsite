"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin } from "lucide-react";
import Image from "next/image";
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
            className="relative w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl select-none"
            style={{
              background: "var(--bg-surface)",
              border: `1px solid ${rgba(accentColor, 0.4)}`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── Full-width hero photo ── */}
            <div className="relative w-full" style={{ height: "320px" }}>
              {member.photo ? (
                <Image
                  src={member.photo}
                  alt={member.name}
                  fill
                  className="object-cover object-top"
                  sizes="384px"
                  priority
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-6xl font-black"
                  style={{ background: `linear-gradient(135deg, ${rgba(accentColor, 0.4)}, ${rgba(accentColor, 0.7)})`, color: "#fff" }}
                >
                  {member.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                </div>
              )}

              {/* Gradient fade into card body */}
              <div
                className="absolute inset-x-0 bottom-0 h-10"
                style={{ background: "linear-gradient(to bottom, transparent, var(--bg-surface))" }}
              />

              {/* Team accent stripe along top */}
              <div
                className="absolute inset-x-0 top-0 h-1"
                style={{ background: `linear-gradient(90deg, ${accentColor}, ${rgba(accentColor, 0.4)})` }}
              />

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:opacity-80"
                style={{ backgroundColor: "rgba(0,0,0,0.45)", color: "#fff" }}
              >
                <X size={15} />
              </button>
            </div>

            {/* ── Name / nickname / location ── */}
            <div className="px-6 pt-5 pb-4 text-center">
              <h2 className="text-xl font-black" style={{ color: "var(--color-text)" }}>
                {member.name}
              </h2>
              <p className="text-sm font-bold mt-0.5" style={{ color: accentColor }}>
                &ldquo;{member.nickname}&rdquo;
              </p>
              <div className="flex items-center justify-center gap-1.5 mt-2" style={{ color: "var(--color-muted)" }}>
                <span>{member.flag}</span>
                <MapPin size={12} />
                <span className="text-xs">{member.from}</span>
              </div>
            </div>

            {/* ── Bio ── */}
            <div
              className="px-6 py-4 mx-4 mb-4 rounded-2xl"
              style={{ backgroundColor: rgba(accentColor, 0.06), border: `1px solid ${rgba(accentColor, 0.15)}` }}
            >
              <p className="text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>
                {member.bio}
              </p>
            </div>

            {/* ── Footer ── */}
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
