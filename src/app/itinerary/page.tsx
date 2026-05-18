import type { Metadata } from "next";
import SectionHeader from "@/components/SectionHeader";
import ItineraryTimeline from "@/components/ItineraryTimeline";
import { ITINERARY, ROUTE } from "@/data/trip";
import RouteMap from "@/components/RouteMap";

export const metadata: Metadata = {
  title: "Itinerary | WC26 The Boys Trip",
  description:
    "10 days, 11 cities, 3 matches. The full WC26 road trip itinerary from Atlanta to NYC.",
};

export default function ItineraryPage() {
  const matchDays = ITINERARY.filter((d) => d.isMatchDay).length;
  const totalDrive = "~2,400 miles";

  return (
    <div className="pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <SectionHeader
            label="The Road Trip"
            title="Full Itinerary"
            subtitle="Atlanta to NYC. 10 days, non-stop."
          />

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
            {[
              { value: "10", label: "Days" },
              { value: String(ITINERARY.length), label: "Stops" },
              { value: String(matchDays), label: "Match Days" },
              { value: totalDrive, label: "Total Drive" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl p-4 text-center"
                style={{
                  backgroundColor: "var(--bg-surface)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <div className="text-2xl font-black" style={{ color: "var(--color-accent)" }}>
                  {stat.value}
                </div>
                <div className="text-xs mt-1 uppercase tracking-wider" style={{ color: "var(--color-muted)" }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Route summary */}
        <div
          className="rounded-2xl p-5 mb-10"
          style={{
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--color-border)",
          }}
        >
          <p
            className="text-xs uppercase tracking-widest mb-3"
            style={{ color: "var(--color-muted)" }}
          >
            The Route
          </p>
          <div className="flex flex-wrap gap-2">
            {ROUTE.map((stop, i) => (
              <span key={stop.city} className="flex items-center gap-1.5">
                <span
                  className="text-sm px-2.5 py-1 rounded-full"
                  style={{
                    backgroundColor: "var(--bg-page)",
                    color: "var(--color-text)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  {stop.emoji} {stop.city}
                </span>
                {i < ROUTE.length - 1 && (
                  <span className="text-sm" style={{ color: "var(--color-muted)" }}>→</span>
                )}
              </span>
            ))}
          </div>
        </div>

        {/* Route map */}
        <div className="mb-10">
          <RouteMap />
        </div>

        {/* Timeline */}
        <ItineraryTimeline />
      </div>
    </div>
  );
}
