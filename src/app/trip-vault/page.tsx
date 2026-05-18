import type { Metadata } from "next";
import SectionHeader from "@/components/SectionHeader";
import { VAULT_FEATURES } from "@/data/trip";
import {
  Lock,
  Camera,
  FileText,
  DollarSign,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Trip Vault | WC26 The Boys Trip",
  description:
    "The Trip Vault is coming in V2. Private login, shared photos, booking docs, expenses, and AI-generated trip stories.",
};

const ICON_MAP: Record<string, React.ReactNode> = {
  Lock: <Lock size={24} />,
  Camera: <Camera size={24} />,
  FileText: <FileText size={24} />,
  DollarSign: <DollarSign size={24} />,
  Sparkles: <Sparkles size={24} />,
};

export default function TripVaultPage() {
  return (
    <div className="pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero header */}
        <div className="text-center mb-16">
          <div
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl text-4xl mb-6"
            style={{
              background: "color-mix(in srgb, var(--color-accent) 10%, transparent)",
              border: "1px solid color-mix(in srgb, var(--color-accent) 30%, transparent)",
            }}
          >
            🔒
          </div>
          <SectionHeader
            label="Coming in V2"
            title="Trip Vault"
            subtitle="A private, password-protected space for the crew. Photos, docs, expenses, and AI-generated trip memories — all in one place."
            centered
          />
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-14">
          {VAULT_FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="relative rounded-2xl p-6 opacity-70"
              style={{
                backgroundColor: "var(--bg-surface)",
                border: "1px solid var(--color-border)",
              }}
            >
              {/* Locked overlay */}
              <div className="absolute inset-0 rounded-2xl flex items-end justify-end p-4 pointer-events-none">
                <span
                  className="text-xs font-bold uppercase tracking-widest px-2 py-1 rounded-full"
                  style={{
                    color: "var(--color-accent)",
                    background: "color-mix(in srgb, var(--color-accent) 8%, transparent)",
                    border: "1px solid color-mix(in srgb, var(--color-accent) 20%, transparent)",
                  }}
                >
                  {feature.status}
                </span>
              </div>

              <div className="flex items-start gap-4">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: "var(--bg-page)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-muted)",
                  }}
                >
                  {ICON_MAP[feature.icon] ?? <Lock size={24} />}
                </div>
                <div>
                  <h3 className="font-bold mb-1" style={{ color: "var(--color-text)" }}>
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* V2 roadmap callout */}
        <div
          className="rounded-2xl p-8"
          style={{
            background:
              "linear-gradient(135deg, color-mix(in srgb, var(--color-accent) 8%, var(--bg-surface)), var(--bg-surface))",
            border: "1px solid color-mix(in srgb, var(--color-accent) 25%, transparent)",
          }}
        >
          <div className="flex items-start gap-4 mb-6">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: "color-mix(in srgb, var(--color-accent) 10%, transparent)",
                border: "1px solid color-mix(in srgb, var(--color-accent) 30%, transparent)",
              }}
            >
              <Sparkles size={20} style={{ color: "var(--color-accent)" }} />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1" style={{ color: "var(--color-text)" }}>
                V2 Roadmap
              </h3>
              <p className="text-sm" style={{ color: "var(--color-muted)" }}>
                Here&apos;s what&apos;s planned after the trip:
              </p>
            </div>
          </div>
          <ul className="space-y-3">
            {[
              "Supabase Auth — magic link login for crew members",
              "Postgres tables — trips, travellers, bookings, expenses, photos",
              "Cloudinary upload widget — drag and drop trip photos",
              "Authenticated gallery — private photo sharing for the crew",
              "Booking document upload — store hotel confirmations, tickets",
              "Expense tracker — split costs, settle up after the trip",
              "Face clustering + AI reels — automatically find your photos",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm">
                <span className="mt-0.5 flex-shrink-0" style={{ color: "var(--color-accent)" }}>›</span>
                <span style={{ color: "var(--color-text)" }}>{item}</span>
              </li>
            ))}
          </ul>

          <div
            className="mt-8 pt-6 flex items-center justify-between flex-wrap gap-4"
            style={{ borderTop: "1px solid var(--color-border)" }}
          >
            <p className="text-xs" style={{ color: "var(--color-muted)" }}>
              Built on Next.js + Supabase + Cloudinary
            </p>
            <a
              href="https://github.com/pavelshahriar/trips-microsite"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm font-semibold transition-colors group"
              style={{ color: "var(--color-accent)" }}
            >
              <span>Contribute on GitHub</span>
              <ArrowRight
                size={14}
                className="group-hover:translate-x-1 transition-transform"
              />
            </a>
          </div>
        </div>

        {/* Personalization callout */}
        <div
          className="rounded-2xl p-8 mt-6"
          style={{
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div className="flex items-start gap-4 mb-5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
              style={{
                background: "color-mix(in srgb, var(--color-accent) 10%, transparent)",
                border: "1px solid color-mix(in srgb, var(--color-accent) 25%, transparent)",
              }}
            >
              👤
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1" style={{ color: "var(--color-text)" }}>
                Personalised Experience{" "}
                <span className="text-xs font-normal ml-2" style={{ color: "var(--color-muted)" }}>
                  V2
                </span>
              </h3>
              <p className="text-sm" style={{ color: "var(--color-muted)" }}>
                Log in and the whole site adapts to <em>you</em> — not just the group.
              </p>
            </div>
          </div>
          <ul className="space-y-3">
            {[
              {
                icon: "🏠",
                title: "Hometown-aware legs",
                desc: "Drive legs and stops are highlighted based on where you're joining from. Topu joining from Chicago? The KC leg looks different to him than it does to Pavel.",
              },
              {
                icon: "⚽",
                title: "Your team front and centre",
                desc: "Match days for your supported team get extra treatment — dedicated countdown, fan zone info, and push notifications.",
              },
              {
                icon: "✈️",
                title: "Your return timeline",
                desc: "Your flight home appears on your itinerary view. The last leg adapts — if you fly out of JFK early, it flags that to you on June 20.",
              },
              {
                icon: "📸",
                title: "Your photos first",
                desc: "Face-aware gallery that surfaces your photos at the top. Built with Cloudinary face detection.",
              },
            ].map((item) => (
              <li key={item.title} className="flex items-start gap-3">
                <span className="text-lg mt-0.5 flex-shrink-0">{item.icon}</span>
                <div>
                  <span className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
                    {item.title} —{" "}
                  </span>
                  <span className="text-sm" style={{ color: "var(--color-muted)" }}>
                    {item.desc}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
