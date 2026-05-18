"use client";

import { FULL_ROUTE_MAP_URL } from "@/data/trip";

const STOPS = [
  { label: "Atlanta", abbr: "ATL", emoji: "🍑", x: 72, y: 72, isMatch: false },
  { label: "New Orleans", abbr: "NOLA", emoji: "🎷", x: 44, y: 88, isMatch: false },
  { label: "Houston", abbr: "HOU", emoji: "🤠", x: 22, y: 80, isMatch: true },
  { label: "Dallas", abbr: "DAL", emoji: "⭐", x: 26, y: 62, isMatch: false },
  { label: "Joplin", abbr: "JOP", emoji: "🛣️", x: 38, y: 46, isMatch: false },
  { label: "Kansas City", abbr: "KC", emoji: "🥩", x: 36, y: 36, isMatch: true },
  { label: "Columbia", abbr: "MO", emoji: "🌽", x: 46, y: 34, isMatch: false },
  { label: "Cincinnati", abbr: "CIN", emoji: "🌉", x: 62, y: 32, isMatch: false },
  { label: "Washington DC", abbr: "DC", emoji: "🏛️", x: 82, y: 28, isMatch: false },
  { label: "Philadelphia", abbr: "PHL", emoji: "🦅", x: 88, y: 22, isMatch: true },
  { label: "New York", abbr: "NYC", emoji: "🗽", x: 92, y: 14, isMatch: false },
];

export default function RouteMap() {
  // Build SVG polyline points
  const points = STOPS.map((s) => `${s.x},${s.y}`).join(" ");

  return (
    <a
      href={FULL_ROUTE_MAP_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="block group"
    >
      <div
        className="rounded-2xl overflow-hidden relative transition-all duration-200 group-hover:opacity-90"
        style={{
          backgroundColor: "var(--bg-surface)",
          border: "1px solid var(--color-border)",
        }}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest mb-0.5" style={{ color: "var(--color-muted)" }}>
              The Route
            </p>
            <p className="text-sm font-bold" style={{ color: "var(--color-text)" }}>
              Atlanta → New York · 10 stops · ~2,400 miles
            </p>
          </div>
          <span
            className="text-[10px] font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1"
            style={{
              backgroundColor: "var(--color-accent)",
              color: "var(--color-accent-text)",
            }}
          >
            🗺️ Open in Maps
          </span>
        </div>

        {/* SVG route */}
        <div className="px-4 pb-4">
          <svg
            viewBox="0 0 100 100"
            className="w-full"
            style={{ height: "220px" }}
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Route line */}
            <polyline
              points={points}
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="2 1.5"
            />

            {/* Stops */}
            {STOPS.map((stop, i) => (
              <g key={stop.abbr}>
                {/* Dot */}
                <circle
                  cx={stop.x}
                  cy={stop.y}
                  r={stop.isMatch ? 2.5 : 1.5}
                  fill={stop.isMatch ? "var(--color-accent)" : "var(--bg-surface)"}
                  stroke="var(--color-accent)"
                  strokeWidth={stop.isMatch ? 0 : 0.8}
                />
                {/* Label — alternate above/below to avoid overlap */}
                <text
                  x={stop.x}
                  y={stop.y + (i % 2 === 0 ? -4 : 5.5)}
                  textAnchor="middle"
                  fontSize="3.2"
                  fontWeight={stop.isMatch ? "700" : "400"}
                  fill={stop.isMatch ? "var(--color-accent)" : "var(--color-muted)"}
                >
                  {stop.emoji} {stop.abbr}
                </text>
              </g>
            ))}
          </svg>
        </div>

        {/* Match day callouts */}
        <div
          className="px-5 py-3 flex items-center gap-4 text-xs"
          style={{ borderTop: "1px solid var(--color-border)" }}
        >
          <span style={{ color: "var(--color-muted)" }}>Match days:</span>
          {[
            { city: "Houston", emoji: "🇩🇪" },
            { city: "Kansas City", emoji: "🇦🇷" },
            { city: "Philadelphia", emoji: "🇧🇷" },
          ].map((m) => (
            <span
              key={m.city}
              className="flex items-center gap-1 font-semibold"
              style={{ color: "var(--color-text)" }}
            >
              {m.emoji} {m.city}
            </span>
          ))}
        </div>
      </div>
    </a>
  );
}
