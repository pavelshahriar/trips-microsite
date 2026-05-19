"use client";

import { MapPin, Calendar, ExternalLink } from "lucide-react";
import type { Match } from "@/data/trip";

// Per-team theme: colors pulled directly from national flags
const TEAM_THEMES: Record<string, {
  bg: string;
  border: string;
  glow: string;
  accent: string;
  badgeBg: string;
  badgeText: string;
  stripe: string;
}> = {
  germany: {
    bg: "linear-gradient(135deg, #1c1a18 0%, #2a1c1a 100%)",
    border: "#cc2a1e",
    glow: "rgba(204,42,30,0.25)",
    accent: "#ffce00",
    badgeBg: "#ffce00",
    badgeText: "#1a1a1a",
    stripe: "linear-gradient(90deg, #000000 33%, #cc2a1e 33%, #cc2a1e 66%, #ffce00 66%)",
  },
  argentina: {
    bg: "linear-gradient(135deg, #0d2a4a 0%, #163a5e 100%)",
    border: "#74acdf",
    glow: "rgba(116,172,223,0.3)",
    accent: "#74acdf",
    badgeBg: "#74acdf",
    badgeText: "#0a1e33",
    stripe: "linear-gradient(90deg, #74ACDF 33%, #ffffff 33%, #ffffff 66%, #74ACDF 66%)",
  },
  brazil: {
    bg: "linear-gradient(135deg, #0a2a14 0%, #133d1e 100%)",
    border: "#009c3b",
    glow: "rgba(0,156,59,0.3)",
    accent: "#fedd00",
    badgeBg: "#fedd00",
    badgeText: "#002776",
    stripe: "linear-gradient(90deg, #009c3b 33%, #fedd00 33%, #fedd00 66%, #002776 66%)",
  },
};

function getTheme(matchId: string) {
  return TEAM_THEMES[matchId] ?? {
    bg: "linear-gradient(135deg, #223047 0%, #2c3f5c 100%)",
    border: "#f0c040",
    glow: "rgba(240,192,64,0.2)",
    accent: "#f0c040",
    badgeBg: "#f0c040",
    badgeText: "#141c2e",
    stripe: "linear-gradient(90deg, #f0c040, #f7d468, #f0c040)",
  };
}

interface MatchCardProps {
  match: Match;
  index?: number;
  featured?: boolean;
}

export default function MatchCard({ match }: MatchCardProps) {
  const theme = getTheme(match.id);

  return (
    <div
      className="card-hover relative overflow-hidden rounded-2xl flex flex-col"
      style={{
        background: theme.bg,
        border: `1.5px solid ${theme.border}`,
        boxShadow: `0 4px 32px ${theme.glow}`,
      }}
    >
      {/* Top stripe — actual flag colors */}
      <div className="h-2 w-full flex-shrink-0" style={{ background: theme.stripe }} />

      {/* Match day badge */}
      <div className="absolute top-5 right-4">
        <span
          className="match-pulse inline-block text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full"
          style={{ background: theme.badgeBg, color: theme.badgeText }}
        >
          Match Day
        </span>
      </div>

      {/* Body */}
      <div className="p-6 flex flex-col flex-1">
        {/* Flag */}
        <div className="text-6xl mb-4">{match.emoji}</div>

        {/* Team name */}
        <h3 className="text-2xl font-black text-white mb-1 leading-tight">
          {match.team}
          {match.opponent && (
            <span className="text-slate-400 font-light text-xl"> vs {match.opponent}</span>
          )}
        </h3>

        {/* Vibe — colored per team */}
        <p className="text-sm italic mb-5" style={{ color: theme.accent }}>
          {match.vibe}
        </p>

        {/* Details */}
        <div className="space-y-2 mt-auto">
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <Calendar size={14} style={{ color: theme.accent }} className="flex-shrink-0" />
            <span>{match.date}</span>
            {match.time && <span className="text-slate-500">· {match.time}</span>}
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <MapPin size={14} style={{ color: theme.accent }} className="flex-shrink-0" />
            <span>{match.venue}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14" height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ color: theme.accent }}
              className="flex-shrink-0"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            </svg>
            <span>{match.stadium}</span>
          </div>
        </div>

        {/* Primary links */}
        <div className="flex gap-2 mt-5 pt-4 border-t border-white/10">
          <a
            href={match.teamNewsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg flex-1 justify-center transition-all duration-200 hover:opacity-80"
            style={{ background: theme.badgeBg, color: theme.badgeText }}
          >
            <ExternalLink size={11} />
            Team News
          </a>
          <a
            href={match.fanFestUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg flex-1 justify-center transition-all duration-200 hover:opacity-80"
            style={{ background: "rgba(255,255,255,0.15)", color: "#ffffff", border: "1px solid rgba(255,255,255,0.25)" }}
          >
            🎪 Fan Fest
          </a>
          <a
            href={match.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg flex-1 justify-center transition-all duration-200 hover:opacity-80"
            style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.75)", border: "1px solid rgba(255,255,255,0.12)" }}
          >
            <MapPin size={11} />
            Maps
          </a>
        </div>

        {/* Ticket links */}
        <div className="mt-3">
          <p className="text-[9px] uppercase tracking-widest mb-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>Get Tickets</p>
          <div className="flex flex-wrap gap-1.5">
            {[
              { label: "FIFA", href: match.tickets.fifa },
              { label: "StubHub", href: match.tickets.stubhub },
              { label: "SeatGeek", href: match.tickets.seatgeek },
              { label: "Ticketmaster", href: match.tickets.ticketmaster },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-semibold px-2.5 py-1 rounded-md transition-all duration-200 hover:opacity-80"
                style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
