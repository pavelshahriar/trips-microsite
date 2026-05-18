"use client";

import { motion } from "framer-motion";
import { Utensils, Car, MapPin, ExternalLink } from "lucide-react";
import type { Venue } from "@/data/trip";

interface VenueCardProps {
  venue: Venue;
  index?: number;
}

export default function VenueCard({ venue, index = 0 }: VenueCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="card-hover rounded-2xl overflow-hidden flex flex-col h-full"
      style={{
        backgroundColor: "var(--bg-surface)",
        border: "1px solid var(--color-border)",
      }}
    >
      {/* Header */}
      <div
        className="p-6 pb-5"
        style={{
          background:
            "linear-gradient(135deg, color-mix(in srgb, var(--color-accent) 8%, var(--bg-surface)), var(--bg-surface))",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <div>
          <div className="text-4xl mb-2">{venue.emoji}</div>
          <h3 className="text-xl font-bold whitespace-nowrap" style={{ color: "var(--color-text)" }}>
            {venue.stadium}
          </h3>
          <div className="flex items-center justify-between mt-1 gap-2">
            <p className="text-sm font-semibold" style={{ color: "var(--color-accent)" }}>
              {venue.city}, {venue.state}
            </p>
            <div
              className="rounded-lg px-2.5 py-1 flex-shrink-0"
              style={{
                background: "color-mix(in srgb, var(--color-accent) 10%, transparent)",
                border: "1px solid color-mix(in srgb, var(--color-accent) 30%, transparent)",
              }}
            >
              <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--color-muted)" }}>Capacity</p>
              <p className="text-sm font-bold text-right" style={{ color: "var(--color-accent)" }}>{venue.capacity}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4 flex flex-col flex-1">
        {/* Match day */}
        <div className="flex items-start gap-3">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{
              background: "color-mix(in srgb, var(--color-accent) 10%, transparent)",
            }}
          >
            <span className="text-sm">⚽</span>
          </div>
          <div>
            <p
              className="text-xs uppercase tracking-wide mb-0.5"
              style={{ color: "var(--color-muted)" }}
            >
              Match
            </p>
            <p className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
              {venue.matchTeam}
            </p>
            <p className="text-xs" style={{ color: "var(--color-muted)" }}>
              {venue.matchDay}
            </p>
          </div>
        </div>

        {/* Travel note */}
        <div className="flex items-start gap-3">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{
              background: "color-mix(in srgb, var(--color-accent) 10%, transparent)",
            }}
          >
            <Car size={14} style={{ color: "var(--color-accent)" }} />
          </div>
          <div>
            <p
              className="text-xs uppercase tracking-wide mb-0.5"
              style={{ color: "var(--color-muted)" }}
            >
              Travel Note
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "var(--color-text)" }}>
              {venue.travelNote}
            </p>
          </div>
        </div>

        {/* Food nearby */}
        <div className="flex items-start gap-3 flex-1">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{
              background: "color-mix(in srgb, var(--color-accent) 10%, transparent)",
            }}
          >
            <Utensils size={14} style={{ color: "var(--color-accent)" }} />
          </div>
          <div>
            <p
              className="text-xs uppercase tracking-wide mb-1"
              style={{ color: "var(--color-muted)" }}
            >
              Food Nearby
            </p>
            <div className="flex flex-wrap gap-1.5">
              {venue.foodNearby.map((food) => (
                <span
                  key={food}
                  className="text-xs px-2 py-0.5 rounded-md"
                  style={{
                    backgroundColor: "var(--bg-page)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-text)",
                  }}
                >
                  {food}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* External links */}
        <div className="flex gap-2 mt-5 pt-4" style={{ borderTop: "1px solid var(--color-border)" }}>
          <a
            href={venue.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg flex-1 justify-center transition-all duration-200"
            style={{
              background: "color-mix(in srgb, var(--color-accent) 10%, transparent)",
              border: "1px solid color-mix(in srgb, var(--color-accent) 30%, transparent)",
              color: "var(--color-accent)",
            }}
          >
            <ExternalLink size={12} />
            Stadium Site
          </a>
          <a
            href={venue.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg flex-1 justify-center transition-all duration-200"
            style={{
              backgroundColor: "var(--bg-page)",
              border: "1px solid var(--color-border)",
              color: "var(--color-muted)",
            }}
          >
            <MapPin size={12} />
            Google Maps
          </a>
        </div>

        {/* FIFA official WhatsApp channel */}
        <div className="mt-2">
          <a
            href={venue.officialChannelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg w-full justify-center transition-all duration-200 hover:opacity-80"
            style={{ backgroundColor: "#25D366", color: "#fff" }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            FIFA Official WhatsApp Channel
          </a>
        </div>
      </div>
    </motion.div>
  );
}
