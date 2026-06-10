/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Trophy,
  Swords,
  Star,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  type FDMatch,
  type FDGoal,
  type FDBooking,
  type FDH2HResponse,
  type FDStandingGroup,
  type FDSquadPlayer,
  getFlag,
  getStageName,
  isMatchFinished,
  isMatchLive,
} from "@/lib/football-data";
import { getKeyPlayers, type KeyPlayer } from "@/data/key-players";
import MatchPredictionWidget from "./MatchPredictionWidget";

// ── Crew match detection ─────────────────────────────────────────

const CREW_MATCHES: Array<{ date: string; teams: string[] }> = [
  { date: "2026-06-14", teams: ["Germany"] },
  { date: "2026-06-16", teams: ["Argentina"] },
  { date: "2026-06-19", teams: ["Brazil"] },
];

function isCrewMatch(match: FDMatch): boolean {
  const d = match.utcDate.slice(0, 10);
  return CREW_MATCHES.some(
    (cm) =>
      cm.date === d &&
      (cm.teams.includes(match.homeTeam.name ?? "") || cm.teams.includes(match.awayTeam.name ?? ""))
  );
}

// ── Helpers ──────────────────────────────────────────────────────

function fmt(utcDate: string) {
  return new Date(utcDate).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function fmtTime(utcDate: string) {
  return new Date(utcDate).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZoneName: "short",
  });
}

function fmtShortDate(utcDate: string) {
  return new Date(utcDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function calcAge(dob: string): string {
  const diff = Date.now() - new Date(dob).getTime();
  return `${Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))}y`;
}

// ── Section wrapper ──────────────────────────────────────────────

function Section({
  title,
  icon,
  children,
  action,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--color-border)" }}
    >
      <div
        className="flex items-center justify-between gap-2.5 px-5 py-3.5"
        style={{ borderBottom: "1px solid var(--color-border)" }}
      >
        <div className="flex items-center gap-2.5">
          {icon && <span style={{ color: "var(--color-accent)" }}>{icon}</span>}
          <h3 className="text-sm font-bold tracking-wide uppercase" style={{ color: "var(--color-text)" }}>
            {title}
          </h3>
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ── Horizontal Carousel ──────────────────────────────────────────

function HorizontalCarousel({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const updateArrows = () => {
    const el = ref.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    updateArrows();
    el.addEventListener("scroll", updateArrows, { passive: true });
    const ro = new ResizeObserver(updateArrows);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      ro.disconnect();
    };
  }, []);

  const scroll = (dir: "left" | "right") => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -280 : 280, behavior: "smooth" });
  };

  return (
    <div className={`relative group ${className ?? ""}`}>
      {/* Left arrow */}
      <button
        onClick={() => scroll("left")}
        aria-label="Scroll left"
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all duration-200"
        style={{
          backgroundColor: "var(--bg-surface)",
          border: "1px solid var(--color-border)",
          color: "var(--color-text)",
          opacity: canLeft ? 1 : 0,
          pointerEvents: canLeft ? "auto" : "none",
        }}
      >
        <ChevronLeft size={16} />
      </button>

      {/* Scroll container */}
      <div
        ref={ref}
        className="flex gap-3 overflow-x-auto pb-2"
        style={{ scrollbarWidth: "none", scrollSnapType: "x mandatory" }}
      >
        {children}
      </div>

      {/* Right arrow */}
      <button
        onClick={() => scroll("right")}
        aria-label="Scroll right"
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all duration-200"
        style={{
          backgroundColor: "var(--bg-surface)",
          border: "1px solid var(--color-border)",
          color: "var(--color-text)",
          opacity: canRight ? 1 : 0,
          pointerEvents: canRight ? "auto" : "none",
        }}
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

// ── Player photo from Wikipedia ───────────────────────────────────

function PlayerAvatar({
  wikiTitle,
  emoji,
  name,
  fill = false,
}: {
  wikiTitle?: string;
  emoji?: string;
  name: string;
  fill?: boolean;
}) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!wikiTitle) return;
    let cancelled = false;
    fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiTitle)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && data?.thumbnail?.source) setPhotoUrl(data.thumbnail.source);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [wikiTitle]);

  const base = fill ? "w-full h-full" : "w-full h-full";

  if (photoUrl) {
    return (
      <>
        <img
          src={photoUrl}
          alt={name}
          className={`${base} object-cover object-top transition-opacity duration-300`}
          style={{ opacity: loaded ? 1 : 0 }}
          onLoad={() => setLoaded(true)}
        />
        {!loaded && (
          <div
            className="absolute inset-0 flex items-center justify-center text-4xl"
            style={{ background: "color-mix(in srgb, var(--color-accent) 10%, transparent)" }}
          >
            {emoji ?? "⚽"}
          </div>
        )}
      </>
    );
  }

  return (
    <div
      className="w-full h-full flex items-center justify-center text-4xl"
      style={{ background: "color-mix(in srgb, var(--color-accent) 10%, transparent)" }}
    >
      {emoji ?? "⚽"}
    </div>
  );
}

// ── Player card (vertical, carousel-ready) ────────────────────────

function PlayerCard({ player }: { player: KeyPlayer }) {
  return (
    <div
      className="flex-shrink-0 w-36 rounded-2xl overflow-hidden flex flex-col"
      style={{
        scrollSnapAlign: "start",
        backgroundColor: "var(--bg-page)",
        border: "1px solid var(--color-border)",
      }}
    >
      {/* Photo area */}
      <div className="relative h-44 overflow-hidden flex-shrink-0">
        <PlayerAvatar
          wikiTitle={player.wikiTitle}
          emoji={player.emoji}
          name={player.name}
          fill
        />
        {player.marketValue && (
          <span
            className="absolute top-2 right-2 text-xs font-black px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: "color-mix(in srgb, var(--color-accent) 85%, black)",
              color: "var(--color-accent-text, #fff)",
              boxShadow: "0 2px 6px rgba(0,0,0,0.35)",
            }}
          >
            {player.marketValue}
          </span>
        )}
      </div>

      {/* Info area */}
      <div className="p-2.5 flex flex-col gap-0.5 flex-1">
        <p className="text-xs font-black leading-snug" style={{ color: "var(--color-text)" }}>
          {player.name}
        </p>
        <p className="text-xs font-semibold" style={{ color: "var(--color-accent)" }}>
          {player.position}
        </p>
        <p className="text-xs leading-snug mt-0.5" style={{ color: "var(--color-muted)" }}>
          {player.club}
        </p>
        {player.note && (
          <p
            className="text-xs leading-snug mt-1 line-clamp-2"
            style={{ color: "var(--color-muted)", opacity: 0.75 }}
          >
            {player.note}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Key players section (dual carousel) ──────────────────────────

function KeyPlayersSection({ match }: { match: FDMatch }) {
  const homePlayers = getKeyPlayers(match.homeTeam.name ?? "");
  const awayPlayers = getKeyPlayers(match.awayTeam.name ?? "");
  const homeFlag = getFlag(match.homeTeam.name);
  const awayFlag = getFlag(match.awayTeam.name);

  if (homePlayers.length === 0 && awayPlayers.length === 0) return null;

  return (
    <Section title="Players to Watch" icon={<Star size={16} />}>
      <div className="flex flex-col gap-5">
        {homePlayers.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              {match.homeTeam.crest ? (
                <img src={match.homeTeam.crest} alt="" className="w-5 h-5 object-contain" />
              ) : (
                <span>{homeFlag}</span>
              )}
              <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--color-muted)" }}>
                {match.homeTeam.name ?? "TBD"}
              </p>
            </div>
            <HorizontalCarousel>
              {homePlayers.map((p) => (
                <PlayerCard key={p.name} player={p} />
              ))}
            </HorizontalCarousel>
          </div>
        )}
        {awayPlayers.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              {match.awayTeam.crest ? (
                <img src={match.awayTeam.crest} alt="" className="w-5 h-5 object-contain" />
              ) : (
                <span>{awayFlag}</span>
              )}
              <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--color-muted)" }}>
                {match.awayTeam.name ?? "TBD"}
              </p>
            </div>
            <HorizontalCarousel>
              {awayPlayers.map((p) => (
                <PlayerCard key={p.name} player={p} />
              ))}
            </HorizontalCarousel>
          </div>
        )}
      </div>
    </Section>
  );
}

// ── Squad tab (one team's list) ───────────────────────────────────

const POSITION_ORDER = ["Goalkeeper", "Defence", "Midfield", "Offence"];
const POSITION_LABELS: Record<string, string> = {
  Goalkeeper: "Goalkeepers",
  Defence: "Defenders",
  Midfield: "Midfielders",
  Offence: "Forwards",
};

function SquadTab({ squad }: { squad: FDSquadPlayer[] }) {
  const [expanded, setExpanded] = useState(false);

  if (squad.length === 0) {
    return (
      <p className="text-sm text-center py-6" style={{ color: "var(--color-muted)" }}>
        Squad data unavailable.
      </p>
    );
  }

  const grouped = POSITION_ORDER.reduce<Record<string, FDSquadPlayer[]>>((acc, pos) => {
    acc[pos] = squad.filter((p) => p.position === pos);
    return acc;
  }, {});

  return (
    <div>
      <div
        className={`flex flex-col gap-4 transition-all ${expanded ? "" : "max-h-72 overflow-hidden"}`}
        style={
          !expanded
            ? { maskImage: "linear-gradient(to bottom, black 55%, transparent 100%)" }
            : undefined
        }
      >
        {POSITION_ORDER.map((pos) => {
          const players = grouped[pos];
          if (!players || players.length === 0) return null;
          return (
            <div key={pos}>
              <p
                className="text-xs font-bold uppercase tracking-widest mb-1.5"
                style={{ color: "var(--color-muted)" }}
              >
                {POSITION_LABELS[pos]} ({players.length})
              </p>
              <div className="flex flex-col gap-1">
                {players.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl"
                    style={{
                      backgroundColor: "var(--bg-page)",
                      border: "1px solid var(--color-border)",
                    }}
                  >
                    <span
                      className="text-xs font-black w-6 text-center flex-shrink-0"
                      style={{ color: "var(--color-accent)" }}
                    >
                      {p.shirtNumber ?? "–"}
                    </span>
                    <span
                      className="text-sm font-semibold flex-1 min-w-0 truncate"
                      style={{ color: "var(--color-text)" }}
                    >
                      {p.name}
                    </span>
                    <span className="text-base flex-shrink-0">{getFlag(p.nationality)}</span>
                    {p.dateOfBirth && (
                      <span className="text-xs flex-shrink-0" style={{ color: "var(--color-muted)" }}>
                        {calcAge(p.dateOfBirth)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {!expanded && squad.length > 8 && (
        <button
          onClick={() => setExpanded(true)}
          className="mt-3 w-full text-xs font-bold py-2.5 rounded-xl transition-opacity hover:opacity-70"
          style={{
            backgroundColor: "color-mix(in srgb, var(--color-accent) 8%, transparent)",
            color: "var(--color-accent)",
            border: "1px solid color-mix(in srgb, var(--color-accent) 20%, transparent)",
          }}
        >
          Show all {squad.length} players ↓
        </button>
      )}
      {expanded && (
        <button
          onClick={() => setExpanded(false)}
          className="mt-3 w-full text-xs font-bold py-2.5 rounded-xl transition-opacity hover:opacity-70"
          style={{
            backgroundColor: "color-mix(in srgb, var(--color-accent) 8%, transparent)",
            color: "var(--color-accent)",
            border: "1px solid color-mix(in srgb, var(--color-accent) 20%, transparent)",
          }}
        >
          Show less ↑
        </button>
      )}
    </div>
  );
}

// ── Combined squads section (side-by-side tabs) ───────────────────

function SquadsSection({
  match,
  homeSquad,
  awaySquad,
}: {
  match: FDMatch;
  homeSquad: FDSquadPlayer[];
  awaySquad: FDSquadPlayer[];
}) {
  const [activeTab, setActiveTab] = useState<"home" | "away">("home");
  const homeFlag = getFlag(match.homeTeam.name ?? undefined);
  const awayFlag = getFlag(match.awayTeam.name ?? undefined);

  if (homeSquad.length === 0 && awaySquad.length === 0) return null;

  return (
    <Section title="Full Squads" icon={<Users size={16} />}>
      {/* Tab toggle */}
      <div
        className="flex rounded-xl p-1 mb-4 gap-1"
        style={{ backgroundColor: "var(--bg-page)", border: "1px solid var(--color-border)" }}
      >
        {/* Home tab */}
        <button
          onClick={() => setActiveTab("home")}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-bold transition-all duration-200"
          style={
            activeTab === "home"
              ? {
                  backgroundColor: "var(--color-accent)",
                  color: "var(--color-accent-text, #fff)",
                  boxShadow: "0 2px 8px color-mix(in srgb, var(--color-accent) 40%, transparent)",
                }
              : { color: "var(--color-muted)" }
          }
        >
          {match.homeTeam.crest ? (
            <img src={match.homeTeam.crest} alt="" className="w-5 h-5 object-contain flex-shrink-0" />
          ) : (
            <span>{homeFlag}</span>
          )}
          <span className="truncate">{match.homeTeam.shortName ?? match.homeTeam.name ?? "TBD"}</span>
          <span
            className="text-xs font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0"
            style={{
              backgroundColor:
                activeTab === "home"
                  ? "rgba(255,255,255,0.2)"
                  : "color-mix(in srgb, var(--color-accent) 12%, transparent)",
              color: activeTab === "home" ? "inherit" : "var(--color-accent)",
            }}
          >
            {homeSquad.length}
          </span>
        </button>

        {/* Away tab */}
        <button
          onClick={() => setActiveTab("away")}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-bold transition-all duration-200"
          style={
            activeTab === "away"
              ? {
                  backgroundColor: "var(--color-accent)",
                  color: "var(--color-accent-text, #fff)",
                  boxShadow: "0 2px 8px color-mix(in srgb, var(--color-accent) 40%, transparent)",
                }
              : { color: "var(--color-muted)" }
          }
        >
          {match.awayTeam.crest ? (
            <img src={match.awayTeam.crest} alt="" className="w-5 h-5 object-contain flex-shrink-0" />
          ) : (
            <span>{awayFlag}</span>
          )}
          <span className="truncate">{match.awayTeam.shortName ?? match.awayTeam.name ?? "TBD"}</span>
          <span
            className="text-xs font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0"
            style={{
              backgroundColor:
                activeTab === "away"
                  ? "rgba(255,255,255,0.2)"
                  : "color-mix(in srgb, var(--color-accent) 12%, transparent)",
              color: activeTab === "away" ? "inherit" : "var(--color-accent)",
            }}
          >
            {awaySquad.length}
          </span>
        </button>
      </div>

      {/* Tab content */}
      <SquadTab squad={activeTab === "home" ? homeSquad : awaySquad} />
    </Section>
  );
}

// ── Match hero header ─────────────────────────────────────────────

function MatchHero({ match }: { match: FDMatch }) {
  const finished = isMatchFinished(match.status);
  const live = isMatchLive(match.status);
  const homeWon = finished && match.score.winner === "HOME_TEAM";
  const awayWon = finished && match.score.winner === "AWAY_TEAM";
  const homeFlag = getFlag(match.homeTeam.name ?? undefined);
  const awayFlag = getFlag(match.awayTeam.name ?? undefined);
  const crew = isCrewMatch(match);
  const homeName = match.homeTeam.name ?? "TBD";
  const awayName = match.awayTeam.name ?? "TBD";

  return (
    <div
      className="rounded-2xl overflow-hidden mb-5"
      style={{
        backgroundColor: "var(--bg-surface)",
        border: crew ? "1.5px solid var(--color-accent)" : "1px solid var(--color-border)",
        boxShadow: crew ? "0 0 32px color-mix(in srgb, var(--color-accent) 12%, transparent)" : undefined,
      }}
    >
      <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, var(--color-accent), transparent)" }} />

      {crew && (
        <div
          className="px-4 py-2 text-xs font-bold flex items-center justify-center gap-1.5"
          style={{ backgroundColor: "color-mix(in srgb, var(--color-accent) 15%, transparent)", color: "var(--color-accent)" }}
        >
          🎟️ We&apos;re attending this match!
        </div>
      )}

      <div className="px-5 pt-4 pb-2 flex flex-col items-center gap-1">
        <span className="text-xs font-semibold" style={{ color: "var(--color-muted)" }}>
          {getStageName(match.stage, match.group)}
          {match.venue ? ` · ${match.venue}` : ""}
        </span>
        {live && (
          <span
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full"
            style={{ backgroundColor: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> LIVE
          </span>
        )}
      </div>

      <div className="flex items-center justify-between px-8 py-4 gap-4">
        {/* Home */}
        <div className="flex-1 flex flex-col items-center gap-2 text-center">
          {match.homeTeam.crest ? (
            <img src={match.homeTeam.crest} alt={homeName} className="w-16 h-16 object-contain drop-shadow-sm" />
          ) : (
            <span className="text-5xl">{homeFlag}</span>
          )}
          <span
            className="text-sm font-black leading-tight"
            style={{ color: homeWon ? "var(--color-text)" : finished ? "var(--color-muted)" : "var(--color-text)" }}
          >
            <span className="mr-1">{homeFlag}</span>
            {homeName}
          </span>
          {homeWon && <span className="text-xs font-bold" style={{ color: "var(--color-accent)" }}>Winner</span>}
        </div>

        {/* Score / vs */}
        <div className="flex flex-col items-center gap-1 flex-shrink-0 min-w-[80px]">
          {(finished || live) && match.score.fullTime.home !== null ? (
            <>
              <div className="flex items-center gap-3">
                <span className="text-4xl font-black tabular-nums" style={{ color: homeWon ? "var(--color-text)" : "var(--color-muted)" }}>
                  {match.score.fullTime.home}
                </span>
                <span className="text-2xl font-bold" style={{ color: "var(--color-muted)" }}>–</span>
                <span className="text-4xl font-black tabular-nums" style={{ color: awayWon ? "var(--color-text)" : "var(--color-muted)" }}>
                  {match.score.fullTime.away}
                </span>
              </div>
              {finished && match.score.duration !== "REGULAR" && (
                <span className="text-xs font-bold" style={{ color: "var(--color-muted)" }}>
                  {match.score.duration === "PENALTY_SHOOTOUT" ? "Pen." : "A.E.T."}
                </span>
              )}
              {finished && <span className="text-xs font-semibold" style={{ color: "var(--color-muted)" }}>Full Time</span>}
            </>
          ) : (
            <>
              <span className="text-2xl font-black" style={{ color: "var(--color-muted)" }}>vs</span>
              <span className="text-sm font-bold text-center" style={{ color: "var(--color-accent)" }}>
                {fmtTime(match.utcDate)}
              </span>
            </>
          )}
        </div>

        {/* Away */}
        <div className="flex-1 flex flex-col items-center gap-2 text-center">
          {match.awayTeam.crest ? (
            <img src={match.awayTeam.crest} alt={awayName} className="w-16 h-16 object-contain drop-shadow-sm" />
          ) : (
            <span className="text-5xl">{awayFlag}</span>
          )}
          <span
            className="text-sm font-black leading-tight"
            style={{ color: awayWon ? "var(--color-text)" : finished ? "var(--color-muted)" : "var(--color-text)" }}
          >
            <span className="mr-1">{awayFlag}</span>
            {awayName}
          </span>
          {awayWon && <span className="text-xs font-bold" style={{ color: "var(--color-accent)" }}>Winner</span>}
        </div>
      </div>

      <div
        className="flex items-center justify-center gap-4 px-5 py-3 text-xs flex-wrap"
        style={{ borderTop: "1px solid var(--color-border)", color: "var(--color-muted)" }}
      >
        <span className="flex items-center gap-1">
          <Calendar size={11} />
          {fmt(match.utcDate)}
        </span>
        {match.venue && (
          <span className="flex items-center gap-1">
            <MapPin size={11} />
            {match.venue}
          </span>
        )}
      </div>
    </div>
  );
}

// ── H2H section ───────────────────────────────────────────────────

function H2HSection({ match, h2h }: { match: FDMatch; h2h: FDH2HResponse }) {
  const { head2head, matches: pastMatches } = h2h;
  const homeTeamId = match.homeTeam.id;

  const total = head2head?.numberOfMatches ?? 0;
  const h2hHomeTeam = head2head?.homeTeam;
  const h2hAwayTeam = head2head?.awayTeam;

  const homeRecord =
    h2hHomeTeam && h2hAwayTeam
      ? h2hHomeTeam.id === homeTeamId ? h2hHomeTeam : h2hAwayTeam
      : null;
  const awayRecord =
    h2hHomeTeam && h2hAwayTeam
      ? h2hHomeTeam.id === homeTeamId ? h2hAwayTeam : h2hHomeTeam
      : null;

  const noData = total === 0 || !homeRecord || !awayRecord;

  return (
    <Section title="Head-to-Head" icon={<Swords size={16} />}>
      {noData ? (
        <p className="text-sm text-center py-4" style={{ color: "var(--color-muted)" }}>
          No previous meetings found.
        </p>
      ) : (
        <>
          <div className="flex items-center gap-4 mb-5">
            <div className="flex-1 text-center">
              <p className="text-2xl font-black" style={{ color: "var(--color-text)" }}>{homeRecord.wins}</p>
              <p className="text-xs font-semibold mt-0.5" style={{ color: "var(--color-muted)" }}>
                {match.homeTeam.shortName ?? match.homeTeam.name ?? "TBD"} wins
              </p>
            </div>
            <div className="flex flex-col items-center gap-1">
              <p className="text-lg font-black" style={{ color: "var(--color-muted)" }}>{homeRecord.draws}</p>
              <p className="text-xs font-semibold" style={{ color: "var(--color-muted)" }}>Draws</p>
            </div>
            <div className="flex-1 text-center">
              <p className="text-2xl font-black" style={{ color: "var(--color-text)" }}>{awayRecord.wins}</p>
              <p className="text-xs font-semibold mt-0.5" style={{ color: "var(--color-muted)" }}>
                {match.awayTeam.shortName ?? match.awayTeam.name ?? "TBD"} wins
              </p>
            </div>
          </div>

          {total > 0 && (
            <div className="flex rounded-full overflow-hidden h-2 mb-5">
              <div style={{ width: `${(homeRecord.wins / total) * 100}%`, backgroundColor: "var(--color-accent)", transition: "width 0.5s ease" }} />
              <div style={{ width: `${(homeRecord.draws / total) * 100}%`, backgroundColor: "var(--color-border)" }} />
              <div style={{ flex: 1, backgroundColor: "color-mix(in srgb, var(--color-accent) 35%, transparent)" }} />
            </div>
          )}

          <p className="text-xs mb-4 text-center" style={{ color: "var(--color-muted)" }}>
            {total} meetings · {head2head?.totalGoals ?? 0} total goals
          </p>

          {pastMatches.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: "var(--color-muted)" }}>
                Recent meetings
              </p>
              {pastMatches.map((pm) => {
                const pmHomeFlag = getFlag(pm.homeTeam.name);
                const pmAwayFlag = getFlag(pm.awayTeam.name);
                const winner = pm.score.winner;
                return (
                  <div
                    key={pm.id}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs"
                    style={{ backgroundColor: "var(--bg-page)", border: "1px solid var(--color-border)" }}
                  >
                    <span className="text-xs flex-shrink-0" style={{ color: "var(--color-muted)", minWidth: "70px" }}>
                      {fmtShortDate(pm.utcDate)}
                    </span>
                    <div className="flex-1 flex items-center justify-between gap-2 min-w-0">
                      <span className={`flex items-center gap-1 font-semibold truncate ${winner === "HOME_TEAM" ? "" : "opacity-60"}`} style={{ color: "var(--color-text)" }}>
                        {pmHomeFlag} {pm.homeTeam.shortName ?? pm.homeTeam.name ?? "TBD"}
                      </span>
                      <span className="font-black tabular-nums flex-shrink-0" style={{ color: "var(--color-accent)" }}>
                        {pm.score.fullTime.home} – {pm.score.fullTime.away}
                      </span>
                      <span className={`flex items-center gap-1 font-semibold text-right truncate ${winner === "AWAY_TEAM" ? "" : "opacity-60"}`} style={{ color: "var(--color-text)" }}>
                        {pm.awayTeam.shortName ?? pm.awayTeam.name ?? "TBD"} {pmAwayFlag}
                      </span>
                    </div>
                    <span className="text-xs flex-shrink-0" style={{ color: "var(--color-muted)" }}>
                      {getStageName(pm.stage, pm.group)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </Section>
  );
}

// ── Group standings section ───────────────────────────────────────

function StandingsSection({ match, standings }: { match: FDMatch; standings: FDStandingGroup[] }) {
  if (match.stage !== "GROUP_STAGE" || !match.group) return null;
  const group = standings.find((s) => s.group === match.group);
  if (!group) return null;

  const homeId = match.homeTeam.id;
  const awayId = match.awayTeam.id;

  return (
    <Section title={`Group ${(match.group ?? "").replace("GROUP_", "")} Standings`} icon={<Trophy size={16} />}>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr style={{ color: "var(--color-muted)" }}>
              <th className="text-left py-1.5 font-semibold w-6">#</th>
              <th className="text-left py-1.5 font-semibold">Team</th>
              <th className="text-center py-1.5 font-semibold w-8">P</th>
              <th className="text-center py-1.5 font-semibold w-8">W</th>
              <th className="text-center py-1.5 font-semibold w-8">D</th>
              <th className="text-center py-1.5 font-semibold w-8">L</th>
              <th className="text-center py-1.5 font-semibold w-8">GD</th>
              <th className="text-center py-1.5 font-semibold w-8">Pts</th>
            </tr>
          </thead>
          <tbody>
            {group.table.map((entry) => {
              const highlight = entry.team.id === homeId || entry.team.id === awayId;
              return (
                <tr
                  key={entry.team.id}
                  style={{
                    backgroundColor: highlight ? "color-mix(in srgb, var(--color-accent) 8%, transparent)" : undefined,
                    borderTop: "1px solid var(--color-border)",
                  }}
                >
                  <td className="py-2 font-bold" style={{ color: entry.position <= 2 ? "var(--color-accent)" : "var(--color-muted)" }}>
                    {entry.position}
                  </td>
                  <td className="py-2 font-semibold" style={{ color: "var(--color-text)" }}>
                    <div className="flex items-center gap-1.5">
                      {entry.team.crest && <img src={entry.team.crest} alt="" className="w-4 h-4 object-contain" />}
                      <span>{getFlag(entry.team.name ?? undefined)}</span>
                      <span>{entry.team.shortName ?? entry.team.name ?? "TBD"}</span>
                    </div>
                  </td>
                  <td className="py-2 text-center" style={{ color: "var(--color-muted)" }}>{entry.playedGames}</td>
                  <td className="py-2 text-center" style={{ color: "var(--color-muted)" }}>{entry.won}</td>
                  <td className="py-2 text-center" style={{ color: "var(--color-muted)" }}>{entry.draw}</td>
                  <td className="py-2 text-center" style={{ color: "var(--color-muted)" }}>{entry.lost}</td>
                  <td className="py-2 text-center" style={{ color: entry.goalDifference > 0 ? "var(--color-accent)" : entry.goalDifference < 0 ? "#ef4444" : "var(--color-muted)" }}>
                    {entry.goalDifference > 0 ? `+${entry.goalDifference}` : entry.goalDifference}
                  </td>
                  <td className="py-2 text-center font-black" style={{ color: "var(--color-text)" }}>{entry.points}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs mt-3" style={{ color: "var(--color-muted)" }}>
        Top 2 teams advance · <span style={{ color: "var(--color-accent)" }}>Highlighted</span> = teams in this match.
      </p>
    </Section>
  );
}

// ── Match Timeline (goals + cards) ────────────────────────────────

function minuteLabel(minute: number, extra?: number | null): string {
  if (extra && extra > 0) return `${minute}+${extra}'`;
  return `${minute}'`;
}

function GoalIcon({ type }: { type: string }) {
  if (type === "OWN") return <span title="Own goal" className="text-base">⚽</span>;
  if (type === "PENALTY") return <span title="Penalty" className="text-base">🅿️</span>;
  return <span className="text-base">⚽</span>;
}

function CardIcon({ card }: { card: string }) {
  if (card === "RED_CARD") return <span title="Red card" className="text-base">🟥</span>;
  if (card === "YELLOW_RED_CARD") return <span title="2nd yellow / red" className="text-base">🟨🟥</span>;
  return <span title="Yellow card" className="text-base">🟨</span>;
}

function MatchTimeline({ match }: { match: FDMatch }) {
  const finished = isMatchFinished(match.status);
  const live = isMatchLive(match.status);
  if (!finished && !live) return null;

  const goals: FDGoal[] = match.goals ?? [];
  const bookings: FDBooking[] = match.bookings ?? [];

  // Build combined event list sorted by minute
  type TimelineEvent =
    | { kind: "goal"; minute: number; extra?: number | null; goal: FDGoal }
    | { kind: "card"; minute: number; extra?: number | null; booking: FDBooking };

  const events: TimelineEvent[] = [
    ...goals.map((g) => ({ kind: "goal" as const, minute: g.minute, extra: g.extraTime, goal: g })),
    ...bookings.map((b) => ({ kind: "card" as const, minute: b.minute, extra: null, booking: b })),
  ].sort((a, b) => a.minute - b.minute);

  const homeId = match.homeTeam.id;
  const homeName = match.homeTeam.name ?? "Home";
  const awayName = match.awayTeam.name ?? "Away";

  // Penalty shootout
  const hasPens = match.score.duration === "PENALTY_SHOOTOUT" && match.score.penalties;
  const homeScore = match.score.fullTime.home;
  const awayScore = match.score.fullTime.away;
  const homeHT = match.score.halfTime.home;
  const awayHT = match.score.halfTime.away;
  const homeET = match.score.extraTime?.home;
  const awayET = match.score.extraTime?.away;

  return (
    <Section title="Match Timeline" icon={<span className="text-sm">📋</span>}>
      {/* Score breakdown */}
      <div className="flex flex-wrap gap-3 mb-5">
        {homeHT !== null && homeHT !== undefined && (
          <div
            className="flex-1 min-w-[120px] rounded-xl px-3 py-2 text-center"
            style={{ backgroundColor: "var(--bg-page)", border: "1px solid var(--color-border)" }}
          >
            <p className="text-xs font-semibold mb-0.5" style={{ color: "var(--color-muted)" }}>Half Time</p>
            <p className="text-lg font-black tabular-nums" style={{ color: "var(--color-text)" }}>
              {homeHT} – {awayHT}
            </p>
          </div>
        )}
        {homeET !== null && homeET !== undefined && (
          <div
            className="flex-1 min-w-[120px] rounded-xl px-3 py-2 text-center"
            style={{ backgroundColor: "var(--bg-page)", border: "1px solid var(--color-border)" }}
          >
            <p className="text-xs font-semibold mb-0.5" style={{ color: "var(--color-muted)" }}>After Extra Time</p>
            <p className="text-lg font-black tabular-nums" style={{ color: "var(--color-text)" }}>
              {homeET} – {awayET}
            </p>
          </div>
        )}
        {hasPens && (
          <div
            className="flex-1 min-w-[120px] rounded-xl px-3 py-2 text-center"
            style={{
              backgroundColor: "color-mix(in srgb, var(--color-accent) 8%, transparent)",
              border: "1px solid color-mix(in srgb, var(--color-accent) 20%, transparent)",
            }}
          >
            <p className="text-xs font-semibold mb-0.5" style={{ color: "var(--color-accent)" }}>Penalties</p>
            <p className="text-lg font-black tabular-nums" style={{ color: "var(--color-text)" }}>
              {match.score.penalties!.home} – {match.score.penalties!.away}
            </p>
          </div>
        )}
        <div
          className="flex-1 min-w-[120px] rounded-xl px-3 py-2 text-center"
          style={{
            backgroundColor: "color-mix(in srgb, var(--color-accent) 5%, transparent)",
            border: "1px solid color-mix(in srgb, var(--color-accent) 15%, transparent)",
          }}
        >
          <p className="text-xs font-semibold mb-0.5" style={{ color: "var(--color-accent)" }}>Full Time</p>
          <p className="text-xl font-black tabular-nums" style={{ color: "var(--color-text)" }}>
            {homeScore} – {awayScore}
          </p>
        </div>
      </div>

      {/* Event list */}
      {events.length === 0 ? (
        <p className="text-sm text-center py-4" style={{ color: "var(--color-muted)" }}>
          Detailed event data not available for this match.
        </p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {events.map((ev, idx) => {
            const isHome = ev.kind === "goal"
              ? ev.goal.team?.id === homeId
              : ev.booking.team?.id === homeId;

            const playerName = ev.kind === "goal"
              ? ev.goal.scorer?.name ?? (ev.goal.type === "OWN" ? "Own Goal" : "Unknown")
              : ev.booking.player?.name ?? "Unknown";

            const assistName = ev.kind === "goal" && ev.goal.assist?.name
              ? ev.goal.assist.name
              : null;

            const teamName = isHome ? homeName : awayName;

            return (
              <div
                key={idx}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs ${isHome ? "" : "flex-row-reverse"}`}
                style={{ backgroundColor: "var(--bg-page)", border: "1px solid var(--color-border)" }}
              >
                {/* Minute */}
                <span
                  className="font-black tabular-nums flex-shrink-0 w-10 text-center"
                  style={{ color: "var(--color-accent)" }}
                >
                  {minuteLabel(ev.minute, ev.extra ?? undefined)}
                </span>

                {/* Icon */}
                <span className="flex-shrink-0">
                  {ev.kind === "goal"
                    ? <GoalIcon type={ev.goal.type} />
                    : <CardIcon card={ev.booking.card} />}
                </span>

                {/* Player + assist */}
                <div className={`flex-1 flex flex-col min-w-0 ${isHome ? "" : "items-end"}`}>
                  <span className="font-bold truncate" style={{ color: "var(--color-text)" }}>
                    {playerName}
                  </span>
                  {assistName && (
                    <span className="truncate" style={{ color: "var(--color-muted)" }}>
                      Assist: {assistName}
                    </span>
                  )}
                  <span style={{ color: "var(--color-muted)", opacity: 0.7 }}>{teamName}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Section>
  );
}

// ── Match Report Links ────────────────────────────────────────────

function MatchReportLinks({ match }: { match: FDMatch }) {
  if (!isMatchFinished(match.status)) return null;

  const homeName = match.homeTeam.name ?? "TBD";
  const awayName = match.awayTeam.name ?? "TBD";
  const matchQuery = encodeURIComponent(`${homeName} vs ${awayName} World Cup 2026`);

  const links = [
    {
      label: "BBC Sport",
      href: `https://www.bbc.com/sport/football/world-cup`,
      icon: "📰",
    },
    {
      label: "Google News",
      href: `https://news.google.com/search?q=${matchQuery}`,
      icon: "🔍",
    },
    {
      label: "ESPN",
      href: `https://www.espn.com/soccer/match/_/gameId/${match.id}`,
      icon: "🏟️",
    },
  ];

  return (
    <Section title="Match Coverage" icon={<span className="text-sm">🗞️</span>}>
      <div className="flex flex-wrap gap-2">
        {links.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-70"
            style={{
              backgroundColor: "var(--bg-page)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text)",
            }}
          >
            <span>{link.icon}</span>
            {link.label}
          </a>
        ))}
      </div>
      <p className="text-xs mt-3" style={{ color: "var(--color-muted)" }}>
        Opens external sites — match reports, stats, and highlights.
      </p>
    </Section>
  );
}

// ── TBD Match Notice ──────────────────────────────────────────────

function TBDNotice({ match }: { match: FDMatch }) {
  const homeIsTBD = !match.homeTeam.name;
  const awayIsTBD = !match.awayTeam.name;
  if (!homeIsTBD && !awayIsTBD) return null;

  return (
    <div
      className="rounded-2xl px-5 py-4 mb-5 flex items-start gap-3"
      style={{
        backgroundColor: "color-mix(in srgb, var(--color-accent) 8%, transparent)",
        border: "1px solid color-mix(in srgb, var(--color-accent) 20%, transparent)",
      }}
    >
      <span className="text-xl flex-shrink-0">🏆</span>
      <div>
        <p className="text-sm font-bold" style={{ color: "var(--color-text)" }}>
          Teams not yet determined
        </p>
        <p className="text-xs mt-1" style={{ color: "var(--color-muted)" }}>
          This {getStageName(match.stage, match.group)} fixture will be populated once the qualifying
          round results are confirmed. Check back after earlier matches conclude.
        </p>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────

interface Props {
  match: FDMatch;
  h2h: FDH2HResponse | null;
  standings: FDStandingGroup[];
  homeSquad: FDSquadPlayer[];
  awaySquad: FDSquadPlayer[];
}

export default function MatchDetailClient({ match, h2h, standings, homeSquad, awaySquad }: Props) {

  return (
    <div className="pt-20 pb-20 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <Link
          href="/arena"
          className="inline-flex items-center gap-1.5 text-sm font-semibold mb-5 hover:opacity-70 transition-opacity"
          style={{ color: "var(--color-muted)" }}
        >
          <ArrowLeft size={15} /> Back to Arena
        </Link>

        <MatchHero match={match} />

        {/* TBD teams notice for undecided knockout fixtures */}
        <TBDNotice match={match} />

        {/* Match day center — timeline (only for finished/live) */}
        <MatchTimeline match={match} />

        {/* Match prediction widget */}
        <div className="mb-5">
          <MatchPredictionWidget match={match} />
        </div>

        <div className="flex flex-col gap-5">
          {/* Match coverage links for finished matches */}
          <MatchReportLinks match={match} />

          {/* H2H */}
          {h2h ? (
            <H2HSection match={match} h2h={h2h} />
          ) : (
            <Section title="Head-to-Head" icon={<Swords size={16} />}>
              <p className="text-sm text-center py-4" style={{ color: "var(--color-muted)" }}>
                H2H data not available.
              </p>
            </Section>
          )}

          {/* Key players carousel */}
          <KeyPlayersSection match={match} />

          {/* Full squads — side-by-side with tabs */}
          <SquadsSection match={match} homeSquad={homeSquad} awaySquad={awaySquad} />

          {/* Group standings */}
          <StandingsSection match={match} standings={standings} />

          {/* Venue */}
          {match.venue && (
            <Section title="Venue" icon={<MapPin size={16} />}>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "color-mix(in srgb, var(--color-accent) 12%, transparent)" }}
                >
                  <MapPin size={18} style={{ color: "var(--color-accent)" }} />
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: "var(--color-text)" }}>{match.venue}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--color-muted)" }}>
                    {fmt(match.utcDate)} · {fmtTime(match.utcDate)}
                  </p>
                </div>
              </div>
            </Section>
          )}
        </div>

        <div className="mt-10 text-center">
          <p className="text-xs" style={{ color: "var(--color-muted)" }}>
            Match data from{" "}
            <a href="https://www.football-data.org" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-70">
              football-data.org
            </a>{" "}
            · Player photos from{" "}
            <a href="https://en.wikipedia.org" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-70">
              Wikipedia
            </a>{" "}
            (CC BY-SA)
          </p>
        </div>
      </div>
    </div>
  );
}
