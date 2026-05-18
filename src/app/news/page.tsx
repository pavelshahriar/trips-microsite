import type { Metadata } from "next";
import SectionHeader from "@/components/SectionHeader";
import { NEWS_LINKS } from "@/data/trip";
import { ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "News | WC26 The Boys Trip",
  description:
    "WC26 curated links — FIFA schedule, host city updates, tickets, and World Cup news.",
};

export default function NewsPage() {
  const categories = Array.from(new Set(NEWS_LINKS.map((l) => l.category)));

  return (
    <div className="pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label="Stay in the loop"
          title="News & Links"
          subtitle="Curated links to keep the crew updated. No algorithm, just the good stuff."
        />

        {/* Note about links */}
        <div
          className="rounded-xl px-5 py-4 mb-10 text-sm"
          style={{
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--color-border)",
            color: "var(--color-muted)",
          }}
        >
          ℹ️ All links are manually curated. Swap them out anytime in{" "}
          <code
            className="px-1.5 py-0.5 rounded text-xs"
            style={{
              color: "var(--color-accent)",
              background: "color-mix(in srgb, var(--color-accent) 10%, transparent)",
            }}
          >
            src/data/trip.ts
          </code>{" "}
          — each link has an id, category, title, description, and url.
        </div>

        {/* Category filter / groups */}
        <div className="space-y-10">
          {categories.map((cat) => {
            const links = NEWS_LINKS.filter((l) => l.category === cat);

            return (
              <div key={cat}>
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
                    style={{
                      color: "var(--color-accent)",
                      background: "color-mix(in srgb, var(--color-accent) 12%, transparent)",
                      border: "1px solid color-mix(in srgb, var(--color-accent) 30%, transparent)",
                    }}
                  >
                    {cat}
                  </span>
                  <div className="flex-1 h-px" style={{ backgroundColor: "var(--color-border)" }} />
                </div>
                <div className="space-y-3">
                  {links.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-start gap-4 rounded-2xl p-5 transition-all duration-200 card-hover"
                      style={{
                        backgroundColor: "var(--bg-surface)",
                        border: "1px solid var(--color-border)",
                      }}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                        style={{ backgroundColor: "var(--bg-page)" }}
                      >
                        {link.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3
                            className="font-semibold text-sm transition-colors"
                            style={{ color: "var(--color-text)" }}
                          >
                            {link.title}
                          </h3>
                          <ExternalLink
                            size={12}
                            className="flex-shrink-0 transition-colors"
                            style={{ color: "var(--color-muted)" }}
                          />
                        </div>
                        <p className="text-xs leading-relaxed" style={{ color: "var(--color-muted)" }}>
                          {link.description}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
