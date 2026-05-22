import type { Metadata } from "next";
import SectionHeader from "@/components/SectionHeader";
import CrewPageClient from "@/components/CrewPageClient";
import { CREW } from "@/data/trip";

// Crew ordered by arrival in Atlanta

export const metadata: Metadata = {
  title: "The Crew | WC26 The Boys Trip",
  description:
    "6 friends. 5 countries. 3 favorite teams. One epic road trip.",
};

export default function CrewPage() {
  // Tally teams
  const teamCounts = CREW.reduce(
    (acc, m) => {
      acc[m.team] = (acc[m.team] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label="The Squad"
          title="The Crew"
          subtitle="7 friends from 5 countries, converging on Atlanta. Football is the reason."
        />

        {/* Arrival order note */}
        <div
          className="rounded-xl px-4 py-3 mb-8 text-sm flex items-start gap-2"
          style={{
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--color-border)",
            color: "var(--color-muted)",
          }}
        >
          <span className="text-base flex-shrink-0">✈️</span>
          <span>
            Crew listed in order of arrival in Atlanta — no politics, just flight times. Nobody is more important than anyone else.{" "}
            <span style={{ color: "var(--color-accent)", fontWeight: 600 }}>Probably.</span>
          </span>
        </div>

        {/* Team breakdown */}
        <div className="flex flex-wrap gap-3 mb-10">
          {Object.entries(teamCounts).sort(([a], [b]) => a.localeCompare(b)).map(([team, count]) => {
            const member = CREW.find((m) => m.team === team)!;
            return (
              <div
                key={team}
                className="flex items-center gap-2 rounded-xl px-4 py-2"
                style={{
                  backgroundColor: "var(--bg-surface)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <span className="text-xl">{member.teamEmoji}</span>
                <span className="font-semibold text-sm" style={{ color: "var(--color-text)" }}>
                  {team}
                </span>
                <span className="text-sm" style={{ color: "var(--color-muted)" }}>
                  × {count}
                </span>
              </div>
            );
          })}
        </div>

        {/* Crew grid + modal (client) */}
        <CrewPageClient crew={CREW} />

        {/* Vibe note */}
        <div
          className="rounded-2xl p-6 text-center"
          style={{
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--color-border)",
          }}
        >
          <p className="text-sm leading-relaxed max-w-lg mx-auto" style={{ color: "var(--color-muted)" }}>
            From London to Sydney, Chicago to Dhaka — this crew has travelled
            from all over the world for one thing. Football. Roads. Old friends.
            Let&apos;s go. 🚐
          </p>
        </div>
      </div>
    </div>
  );
}
