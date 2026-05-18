"use client";

import { motion } from "framer-motion";
import { Car, Bed, Utensils } from "lucide-react";
import type { ItineraryDay } from "@/data/trip";
import FlightBadges from "./FlightBadges";

interface DayCardProps {
  day: ItineraryDay;
  index: number;
}

export default function DayCard({ day, index }: DayCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: Math.min(index * 0.05, 0.3) }}
      style={{
        backgroundColor: "var(--bg-surface)",
        border: day.isMatchDay
          ? "1px solid var(--color-accent)"
          : "1px solid var(--color-border)",
        boxShadow: day.isMatchDay
          ? "0 4px 32px color-mix(in srgb, var(--color-accent) 12%, transparent)"
          : "none",
      }}
      className="relative rounded-2xl overflow-hidden transition-all duration-300"
    >
      {/* Match day glow */}
      {day.isMatchDay && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(135deg, color-mix(in srgb, var(--color-accent) 6%, transparent), transparent)",
          }}
        />
      )}

      <div className="p-5 sm:p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4 gap-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: "var(--color-muted)" }}
              >
                {day.date} · {day.dayLabel}
              </span>
              {day.isMatchDay && (
                <span
                  className="match-pulse inline-block text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{
                    background: "var(--color-accent)",
                    color: "var(--color-accent-text)",
                  }}
                >
                  ⚽ Match Day
                </span>
              )}
            </div>
            <h3
              className="text-lg sm:text-xl font-bold leading-tight"
              style={{ color: "var(--color-text)" }}
            >
              {day.title}
            </h3>
          </div>
        </div>

        {/* Meta row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          <div className="flex items-center gap-2">
            <Car size={13} className="flex-shrink-0" style={{ color: "var(--color-accent)" }} />
            <span className="text-xs" style={{ color: "var(--color-muted)" }}>{day.drive}</span>
          </div>
          <div className="flex items-center gap-2">
            <Bed size={13} className="flex-shrink-0" style={{ color: "var(--color-accent)" }} />
            <span className="text-xs truncate" style={{ color: "var(--color-muted)" }}>{day.hotel}</span>
          </div>
          <div className="flex items-center gap-2">
            <Utensils size={13} className="flex-shrink-0" style={{ color: "var(--color-accent)" }} />
            <span className="text-xs truncate" style={{ color: "var(--color-muted)" }}>
              {day.food.join(" · ")}
            </span>
          </div>
        </div>

        {/* Highlights */}
        <ul className="space-y-1.5">
          {day.highlights.map((h, i) => (
            <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "var(--color-text)" }}>
              <span className="mt-1 flex-shrink-0" style={{ color: "var(--color-accent)", opacity: 0.7 }}>›</span>
              <span className="leading-snug">{h}</span>
            </li>
          ))}
        </ul>

        {/* Hotel city */}
        <div
          className="mt-4 pt-3"
          style={{ borderTop: "1px solid var(--color-border)" }}
        >
          <p className="text-xs" style={{ color: "var(--color-muted)", opacity: 0.7 }}>
            📍 {day.hotelCity}
          </p>
        </div>

        {/* Crew flights for this day — fetched from /api/flights */}
        <FlightBadges date={day.date} />
      </div>
    </motion.div>
  );
}
