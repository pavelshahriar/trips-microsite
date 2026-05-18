import Hero from "@/components/Hero";
import RouteStrip from "@/components/RouteStrip";
import SectionHeader from "@/components/SectionHeader";
import MatchCard from "@/components/MatchCard";
import ItineraryTimeline from "@/components/ItineraryTimeline";
import { MATCHES, ITINERARY } from "@/data/trip";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  const featuredMatches = MATCHES;

  return (
    <>
      <Hero />
      <RouteStrip />

      {/* Featured Matches */}
      <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <SectionHeader
            label="On the pitch"
            title="Featured Matches"
            subtitle="Three games. Three cities. All the drama."
          />
          <Link
            href="/matches"
            className="flex items-center gap-1.5 text-sm font-semibold transition-colors group"
            style={{ color: "var(--color-accent)" }}
          >
            <span>All matches</span>
            <ArrowRight
              size={16}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredMatches.map((match, i) => (
            <MatchCard key={match.id} match={match} index={i} featured />
          ))}
        </div>
      </section>

      {/* Itinerary Preview */}
      <section
        className="py-20"
        style={{
          backgroundColor: "var(--bg-surface)",
          borderTop: "1px solid var(--color-border)",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <SectionHeader
              label="The Plan"
              title="Itinerary Preview"
              subtitle="First 3 days of the 10-day road trip."
            />
            <Link
              href="/itinerary"
              className="flex items-center gap-1.5 text-sm font-semibold transition-colors group"
              style={{ color: "var(--color-accent)" }}
            >
              <span>Full itinerary</span>
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </div>
          <ItineraryTimeline limit={3} />
          <div className="mt-8 text-center">
            <Link
              href="/itinerary"
              className="inline-flex items-center gap-2 font-semibold px-6 py-3 rounded-xl transition-all duration-200"
              style={{
                backgroundColor: "var(--bg-page)",
                color: "var(--color-text)",
                border: "1px solid var(--color-border)",
              }}
            >
              <span>See all {ITINERARY.length} days</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Quick links */}
      <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label="Explore"
          title="Everything in one place"
          centered
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mt-8">
          {[
            { href: "/venues", emoji: "🏟️", label: "Venues" },
            { href: "/crew", emoji: "👊", label: "The Crew" },
            { href: "/news", emoji: "📰", label: "News" },
            { href: "/trip-vault", emoji: "🔒", label: "Trip Vault" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="card-hover flex flex-col items-center gap-3 rounded-2xl p-6 text-center transition-all duration-200"
              style={{
                backgroundColor: "var(--bg-surface)",
                border: "1px solid var(--color-border)",
              }}
            >
              <span className="text-3xl">{item.emoji}</span>
              <span className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
