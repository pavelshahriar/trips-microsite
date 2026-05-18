import type { Metadata } from "next";
import SectionHeader from "@/components/SectionHeader";
import MatchCard from "@/components/MatchCard";
import { MATCHES, TICKETS_NOTE } from "@/data/trip";
import { Info } from "lucide-react";

export const metadata: Metadata = {
  title: "Matches | WC26 The Boys Trip",
  description:
    "Germany, Argentina, and Brazil. Three World Cup 2026 matches on the road trip.",
};

export default function MatchesPage() {
  return (
    <div className="pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label="On the pitch"
          title="Our Matches"
          subtitle="Three games. Three cities. All the drama we came for."
        />

        {/* Tickets note */}
        <div
          className="flex items-start gap-3 rounded-xl p-4 mb-10"
          style={{
            background: "color-mix(in srgb, var(--color-accent) 6%, transparent)",
            border: "1px solid color-mix(in srgb, var(--color-accent) 25%, transparent)",
          }}
        >
          <Info size={18} className="flex-shrink-0 mt-0.5" style={{ color: "var(--color-accent)" }} />
          <p className="text-sm leading-relaxed" style={{ color: "var(--color-text)" }}>
            <span className="font-semibold" style={{ color: "var(--color-accent)" }}>Tickets:</span>{" "}
            {TICKETS_NOTE}
          </p>
        </div>

        {/* Match cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-14">
          {MATCHES.map((match, i) => (
            <MatchCard key={match.id} match={match} index={i} featured />
          ))}
        </div>

        {/* Match timeline */}
        <div
          className="rounded-2xl p-6"
          style={{
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--color-border)",
          }}
        >
          <h3
            className="text-sm font-semibold uppercase tracking-widest mb-6"
            style={{ color: "var(--color-muted)" }}
          >
            Match Timeline
          </h3>
          <div className="space-y-0">
            {MATCHES.map((match, i) => (
              <div key={match.id} className="flex items-start gap-4">
                {/* Timeline dot + line */}
                <div className="flex flex-col items-center">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xl border-2 flex-shrink-0"
                    style={{
                      borderColor: `${match.color === "#000000" ? "#555" : match.color}60`,
                      backgroundColor: `${match.color === "#000000" ? "#222" : match.color}15`,
                    }}
                  >
                    {match.emoji}
                  </div>
                  {i < MATCHES.length - 1 && (
                    <div
                      className="w-px h-10 mt-1"
                      style={{ backgroundColor: "var(--color-border)" }}
                    />
                  )}
                </div>
                {/* Details */}
                <div className={`pb-6 ${i < MATCHES.length - 1 ? "mb-0" : ""}`}>
                  <p className="text-xs mb-0.5" style={{ color: "var(--color-muted)" }}>
                    {match.date}
                  </p>
                  <p className="font-bold" style={{ color: "var(--color-text)" }}>
                    {match.team}
                    {match.opponent && ` vs ${match.opponent}`}
                  </p>
                  <p className="text-sm" style={{ color: "var(--color-muted)" }}>
                    {match.stadium} · {match.city}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
