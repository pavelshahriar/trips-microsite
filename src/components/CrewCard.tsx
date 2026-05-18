"use client";

import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import type { CrewMember } from "@/data/trip";

interface CrewCardProps {
  member: CrewMember;
  index?: number;
  onClick?: () => void;
}

export default function CrewCard({ member, index = 0, onClick }: CrewCardProps) {
  const [imgError, setImgError] = useState(false);

  const initials = member.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const showPhoto = member.photo && !imgError;
  const isBlackTeam = member.teamColor === "#000000";
  const accentColor = isBlackTeam ? "#555" : member.teamColor;
  const borderColor = isBlackTeam ? "rgba(80,80,80,0.55)" : `${accentColor}70`;
  const gradientFrom = isBlackTeam ? "rgba(80,80,80,0.04)" : `${accentColor}06`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      className="card-hover rounded-2xl p-5 flex flex-col"
      style={{
        background: `linear-gradient(135deg, ${gradientFrom} 0%, var(--bg-surface) 50%)`,
        border: `1px solid ${borderColor}`,
        cursor: onClick ? "pointer" : "default",
      }}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === "Enter" || e.key === " ") onClick(); } : undefined}
    >
      {/* Avatar + name row */}
      <div className="flex items-center gap-3 mb-3">
        <div className="relative flex-shrink-0">
          <div
            className="w-20 h-20 rounded-full overflow-hidden border-2 shadow-md"
            style={{ borderColor: `${accentColor}70` }}
          >
            {showPhoto ? (
              <Image
                src={member.photo!}
                alt={`${member.name} photo`}
                width={80}
                height={80}
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-xl font-black"
                style={{
                  background: `linear-gradient(135deg, ${accentColor}40, ${accentColor}70)`,
                  color: "var(--color-hero-text)",
                }}
              >
                {initials}
              </div>
            )}
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 text-lg leading-none drop-shadow-sm">
            {member.flag}
          </div>
        </div>

        <div className="min-w-0">
          <h3 className="text-base font-bold leading-tight" style={{ color: "var(--color-text)" }}>
            {member.name}
          </h3>
          <p className="text-xs font-semibold" style={{ color: accentColor }}>
            &ldquo;{member.nickname}&rdquo;
          </p>
          <div className="flex items-center gap-1 mt-0.5" style={{ color: "var(--color-muted)" }}>
            <MapPin size={10} />
            <span className="text-[10px]">{member.from}</span>
          </div>
        </div>
      </div>

      {/* Tap hint */}
      <p className="text-[10px] mb-3 mt-1" style={{ color: "var(--color-muted)", opacity: 0.55 }}>
        Tap to read more →
      </p>

      {/* Footer row */}
      <div className="flex items-center justify-between gap-2 pt-3 mt-auto" style={{ borderTop: "1px solid var(--color-border)" }}>
        {/* Team badge */}
        <div
          className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold border"
          style={{
            backgroundColor: `${accentColor}15`,
            borderColor: `${accentColor}40`,
            color: accentColor,
          }}
        >
          <span>{member.teamEmoji}</span>
          <span>{member.team}</span>
        </div>

        {/* Facebook link */}
        <a
          href={member.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full transition-all duration-200 hover:opacity-80"
          style={{
            backgroundColor: "#1877F2",
            color: "#fff",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          Facebook
        </a>
      </div>
    </motion.div>
  );
}
