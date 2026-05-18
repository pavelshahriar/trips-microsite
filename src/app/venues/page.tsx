import type { Metadata } from "next";
import SectionHeader from "@/components/SectionHeader";
import VenueCard from "@/components/VenueCard";
import { VENUES, STADIUMS_MAP_URL } from "@/data/trip";
import { MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Venues | WC26 The Boys Trip",
  description:
    "NRG Stadium Houston, Arrowhead Kansas City, Lincoln Financial Philly. The WC26 venues on our route.",
};

export default function VenuesPage() {
  return (
    <div className="pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label="The Stadiums"
          title="Our Venues"
          subtitle="Three iconic stadiums. Three different vibes. One road trip."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-14">
          {VENUES.map((venue, i) => (
            <VenueCard key={venue.id} venue={venue} index={i} />
          ))}
        </div>

        {/* Map strip placeholder */}
        <div
          className="rounded-2xl p-8 text-center"
          style={{
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div className="text-4xl mb-3">🗺️</div>
          <h3 className="text-lg font-bold mb-2" style={{ color: "var(--color-text)" }}>
            Stadium Map
          </h3>
          <p className="text-sm max-w-md mx-auto" style={{ color: "var(--color-muted)" }}>
            Interactive venue map coming in V2. For now, the route goes
            Houston → Kansas City → Philadelphia — three matches, three cities,
            all on the way from ATL to NYC.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3 text-sm" style={{ color: "var(--color-muted)" }}>
            <span>🤠 Houston</span>
            <span>→</span>
            <span>🏈 Kansas City</span>
            <span>→</span>
            <span>🦅 Philadelphia</span>
          </div>
          <div className="mt-5">
            <a
              href={STADIUMS_MAP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-80"
              style={{
                backgroundColor: "var(--color-accent)",
                color: "var(--color-accent-text)",
              }}
            >
              <MapPin size={14} />
              Open Route in Google Maps
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
