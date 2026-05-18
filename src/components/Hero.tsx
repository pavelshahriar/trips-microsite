"use client";

import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import Countdown from "./Countdown";

export default function Hero() {
  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden pitch-pattern"
      style={{
        background: "linear-gradient(135deg, var(--bg-hero-from) 0%, var(--bg-hero-mid) 50%, var(--bg-hero-to) 100%)",
        transition: "background 0.3s ease",
      }}
    >
      {/* Decorative orbs */}
      <div className="absolute top-1/4 left-1/6 w-96 h-96 rounded-full blur-3xl pointer-events-none"
        style={{ background: "var(--bg-hero-orb-1)" }} />
      <div className="absolute bottom-1/4 right-1/6 w-80 h-80 rounded-full blur-3xl pointer-events-none"
        style={{ background: "var(--bg-hero-orb-2)" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-3xl pointer-events-none"
        style={{ background: "var(--bg-hero-orb-3)" }} />

      {/* WC26 watermark */}
      <div className="absolute top-20 right-8 text-[120px] font-black select-none pointer-events-none leading-none"
        style={{ color: "rgba(255,255,255,0.03)" }}>
        WC26
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center pt-24 pb-16">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-full mb-8"
          style={{
            background: "var(--color-hero-badge-bg)",
            border: "1px solid var(--color-hero-badge-border)",
            color: "var(--color-hero-badge-text)",
            animation: "fadeUp 0.5s ease-out 0.1s both",
          }}
        >
          <span>🏆</span>
          <span>FIFA World Cup 2026</span>
          <span>🏆</span>
        </div>

        {/* Main title */}
        <h1
          className="text-5xl sm:text-7xl lg:text-8xl font-black mb-4 leading-[0.9] tracking-tight"
          style={{ animation: "fadeUp 0.6s ease-out 0.2s both" }}
        >
          <span style={{ color: "var(--color-hero-text)" }}>WC26</span>
          <br />
          <span className="text-accent-gradient">The Boys</span>
          <br />
          <span style={{ color: "var(--color-hero-text)" }}>Trip</span>
        </h1>

        {/* Tagline */}
        <p
          className="text-lg sm:text-xl mt-6 mb-4 max-w-xl mx-auto leading-relaxed"
          style={{
            color: "var(--color-hero-muted)",
            animation: "fadeUp 0.6s ease-out 0.3s both",
          }}
        >
          Atlanta to NYC. Football, food, roads, and old friends.
        </p>

        {/* Route */}
        <div
          className="flex items-center justify-center gap-2 text-sm mb-12"
          style={{
            color: "var(--color-hero-muted)",
            animation: "fadeUp 0.6s ease-out 0.4s both",
          }}
        >
          <MapPin size={14} style={{ color: "var(--color-accent)" }} />
          <span>ATL → NOLA → HOU → DAL → KC → DC → PHL → NYC</span>
        </div>

        {/* Countdown */}
        <div style={{ animation: "fadeUp 0.6s ease-out 0.5s both" }} className="mb-12">
          <Countdown />
        </div>

        {/* CTAs */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          style={{ animation: "fadeUp 0.6s ease-out 0.6s both" }}
        >
          <Link
            href="/itinerary"
            className="group flex items-center gap-2 font-bold px-8 py-4 rounded-xl transition-all duration-200 shadow-lg"
            style={{
              background: "var(--color-accent)",
              color: "var(--color-accent-text)",
            }}
          >
            <span>View Itinerary</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/matches"
            className="flex items-center gap-2 font-semibold px-8 py-4 rounded-xl transition-all duration-200"
            style={{
              background: "rgba(255,255,255,0.10)",
              color: "var(--color-hero-text)",
              border: "1px solid rgba(255,255,255,0.20)",
            }}
          >
            <span>⚽ View Matches</span>
          </Link>
        </div>

        {/* Stats */}
        <div
          className="mt-16 grid grid-cols-3 gap-4 max-w-lg mx-auto"
          style={{ animation: "fadeUp 0.8s ease-out 0.7s both" }}
        >
          {[
            { value: "10", label: "Days" },
            { value: "3",  label: "Matches" },
            { value: "6",  label: "Bros" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl p-4 text-center backdrop-blur-sm"
              style={{
                background: "var(--color-stat-bg)",
                border: "1px solid var(--color-stat-border)",
              }}
            >
              <div className="text-3xl font-black" style={{ color: "var(--color-accent)" }}>
                {stat.value}
              </div>
              <div className="text-xs mt-1 uppercase tracking-wider" style={{ color: "var(--color-hero-muted)" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}
