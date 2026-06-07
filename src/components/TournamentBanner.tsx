"use client";

/**
 * TournamentBanner — smart, contextual, self-updating.
 * Shows something different based on where we are in the tournament:
 *   • Pre-tournament  → countdown clock
 *   • Matchday        → next kickoff + pick CTA / live score ticker
 *   • Post-tournament → champion celebration
 *
 * Accepts optional `matches` prop (FDMatch[]) for live-score awareness.
 * Falls back gracefully if no API data (static dates only).
 */

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import type { FDMatch } from "@/lib/football-data";
import { getFlag, getStageName, isMatchLive } from "@/lib/football-data";

// ── Types ─────────────────────────────────────────────────────────

interface TournamentBannerProps {
  /** Pass server-fetched matches for live awareness. Optional. */
  matches?: FDMatch[];
  /** Which page is showing this banner — tweaks the CTA */
  context?: "arena" | "predictions" | "home";
  /** Skip the pick CTA (e.g. already on predictions page) */
  hideCta?: boolean;
}

// ── Key dates ─────────────────────────────────────────────────────

const TOURNAMENT_START = new Date("2026-06-11T16:00:00Z"); // Opening match UTC
const TOURNAMENT_END = new Date("2026-07-19T20:00:00Z"); // Final UTC
const OUR_MATCHES = [
  { date: new Date("2026-06-14T02:00:00Z"), label: "Germany match (Houston)", emoji: "🇩🇪" },
  { date: new Date("2026-06-17T02:00:00Z"), label: "Argentina match (KC)", emoji: "🇦🇷" },
  { date: new Date("2026-06-20T00:00:00Z"), label: "Brazil match (Philly)", emoji: "🇧🇷" },
];

// Fun rotating pre-tournament hype lines
const HYPE_LINES = [
  "48 teams. 104 matches. One trophy. 🏆",
  "The boys are going to three matches. Everyone else gets to predict all 104.",
  "Your bracket WILL get destroyed. Embrace it. ⚽",
  "Who's winning the Golden Boot? Put your pick in now.",
  "June 11 can't come fast enough.",
  "Three host nations. 16 cities. The biggest World Cup ever.",
];

// ── Helpers ───────────────────────────────────────────────────────

function formatCountdown(ms: number): { days: number; hours: number; minutes: number; seconds: number } {
  const totalSeconds = Math.floor(ms / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

// ── Sub-components ────────────────────────────────────────────────

/** Pre-tournament: big countdown clock + rotating hype */
function PreTournamentBanner({ msLeft, context }: { msLeft: number; context: string }) {
  const { days, hours, minutes, seconds } = formatCountdown(msLeft);
  const [hypeIdx, setHypeIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setHypeIdx((i) => (i + 1) % HYPE_LINES.length), 4000);
    return () => clearInterval(t);
  }, []);

  // Next crew match countdown
  const nextCrewMatch = OUR_MATCHES.find((m) => m.date > new Date());

  return (
    <div
      className="rounded-2xl overflow-hidden mb-6"
      style={{
        background: "var(--bg-surface)",
        border: "1.5px solid color-mix(in srgb, var(--color-accent) 30%, transparent)",
        boxShadow: "0 2px 24px color-mix(in srgb, var(--color-accent) 8%, transparent)",
      }}
    >
      {/* Top accent bar */}
      <div
        className="h-1 w-full"
        style={{ background: "linear-gradient(90deg, var(--color-accent), transparent)" }}
      />

      <div className="px-5 py-5 flex flex-col items-center text-center">
        {/* Label row */}
        <div className="flex items-center gap-2 mb-4">
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-widest"
            style={{
              backgroundColor: "color-mix(in srgb, var(--color-accent) 12%, transparent)",
              color: "var(--color-accent)",
              border: "1px solid color-mix(in srgb, var(--color-accent) 25%, transparent)",
            }}
          >
            WC26 Countdown
          </span>
          {nextCrewMatch && (
            <span className="text-xs font-medium" style={{ color: "var(--color-muted)" }}>
              {nextCrewMatch.emoji} Our first match soon
            </span>
          )}
        </div>

        {/* Clock */}
        <div className="flex items-end gap-3 sm:gap-4 mb-4">
          {[
            { value: days, label: "Days" },
            { value: hours, label: "Hrs" },
            { value: minutes, label: "Min" },
            { value: seconds, label: "Sec" },
          ].map(({ value, label }, i) => (
            <div key={label} className="flex items-end gap-1 sm:gap-2">
              <div className="flex flex-col items-center">
                <span
                  className="text-3xl sm:text-4xl font-black tabular-nums leading-none"
                  style={{ color: "var(--color-accent)", fontVariantNumeric: "tabular-nums" }}
                >
                  {pad(value)}
                </span>
                <span className="text-xs font-semibold mt-1" style={{ color: "var(--color-muted)" }}>
                  {label}
                </span>
              </div>
              {i < 3 && (
                <span
                  className="text-2xl font-black pb-4 leading-none"
                  style={{ color: "color-mix(in srgb, var(--color-accent) 40%, transparent)" }}
                >
                  :
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Rotating hype line */}
        <p
          key={hypeIdx}
          className="text-sm font-medium mb-4 transition-opacity duration-500"
          style={{ color: "var(--color-muted)" }}
        >
          {HYPE_LINES[hypeIdx]}
        </p>

        {/* CTAs */}
        {context !== "predictions" && (
          <div className="flex flex-wrap justify-center gap-2">
            <Link
              href="/predictions"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all hover:opacity-85"
              style={{ backgroundColor: "var(--color-accent)", color: "var(--color-accent-text)" }}
            >
              🏆 Make your predictions
            </Link>
            {context !== "arena" && (
              <Link
                href="/arena"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all hover:opacity-85"
                style={{
                  backgroundColor: "rgba(255,255,255,0.06)",
                  color: "rgba(255,255,255,0.7)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                ⚽ Browse all 104 matches
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/** Live right now — score ticker */
function LiveBanner({ liveMatches }: { liveMatches: FDMatch[] }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (liveMatches.length <= 1) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % liveMatches.length), 5000);
    return () => clearInterval(t);
  }, [liveMatches.length]);

  const match = liveMatches[idx % liveMatches.length];
  if (!match) return null;

  const homeScore = match.score.fullTime.home ?? 0;
  const awayScore = match.score.fullTime.away ?? 0;
  const isHT = match.status === "PAUSED";

  return (
    <div
      className="rounded-2xl overflow-hidden mb-6"
      style={{
        background: "linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(239,68,68,0.05) 100%)",
        border: "1.5px solid rgba(239,68,68,0.35)",
      }}
    >
      <div className="px-5 py-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            {/* Live pulse */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-black tracking-widest uppercase" style={{ color: "#ef4444" }}>
                {isHT ? "Half Time" : "Live"}
              </span>
            </div>

            {/* Score */}
            <div className="flex items-center gap-2 text-sm font-bold" style={{ color: "var(--color-text)" }}>
              <span>{getFlag(match.homeTeam.name)}</span>
              <span>{match.homeTeam.shortName || match.homeTeam.tla}</span>
              <span
                className="text-xl font-black tabular-nums mx-1"
                style={{ color: "#ef4444" }}
              >
                {homeScore} – {awayScore}
              </span>
              <span>{match.awayTeam.shortName || match.awayTeam.tla}</span>
              <span>{getFlag(match.awayTeam.name)}</span>
            </div>

            {/* Stage */}
            <span className="text-xs hidden sm:inline" style={{ color: "rgba(255,255,255,0.4)" }}>
              {getStageName(match.stage, match.group)}
            </span>
          </div>

          {/* Picks locked indicator */}
          <span
            className="text-xs font-semibold px-3 py-1.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: "rgba(239,68,68,0.12)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}
          >
            🔒 Picks locked
          </span>
        </div>

        {/* Multiple live matches indicator */}
        {liveMatches.length > 1 && (
          <div className="flex items-center gap-1 mt-2">
            {liveMatches.map((_, i) => (
              <span
                key={i}
                className="w-1.5 h-1.5 rounded-full transition-all"
                style={{ backgroundColor: i === idx ? "#ef4444" : "rgba(255,255,255,0.2)" }}
              />
            ))}
            <span className="text-xs ml-1" style={{ color: "rgba(255,255,255,0.4)" }}>
              {liveMatches.length} matches live
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/** Matchday — next upcoming match with pick CTA */
function MatchdayBanner({
  nextMatch,
  context,
  hideCta,
}: {
  nextMatch: FDMatch;
  context: string;
  hideCta: boolean;
}) {
  const [msLeft, setMsLeft] = useState(
    new Date(nextMatch.utcDate).getTime() - Date.now()
  );

  useEffect(() => {
    const t = setInterval(() => {
      setMsLeft(new Date(nextMatch.utcDate).getTime() - Date.now());
    }, 1000);
    return () => clearInterval(t);
  }, [nextMatch.utcDate]);

  const { hours, minutes, seconds } = formatCountdown(Math.max(0, msLeft));
  const kickoffDate = new Date(nextMatch.utcDate);
  const isToday = kickoffDate.toDateString() === new Date().toDateString();
  const kicksOffSoon = msLeft > 0 && msLeft < 2 * 60 * 60 * 1000; // within 2h

  // Check if this is one of our crew matches
  const ourMatchEmoji = OUR_MATCHES.find((m) => {
    const diff = Math.abs(m.date.getTime() - kickoffDate.getTime());
    return diff < 6 * 60 * 60 * 1000; // within 6 hours
  })?.emoji;

  return (
    <div
      className="rounded-2xl overflow-hidden mb-6"
      style={{
        background: ourMatchEmoji
          ? "linear-gradient(135deg, rgba(255,200,0,0.1) 0%, var(--bg-surface) 100%)"
          : "var(--bg-surface)",
        border: ourMatchEmoji
          ? "1.5px solid rgba(255,200,0,0.3)"
          : "1px solid var(--color-border)",
      }}
    >
      <div className="px-5 py-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Match info */}
          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-xs font-semibold" style={{ color: "var(--color-muted)" }}>
                  {ourMatchEmoji ? (
                    <span style={{ color: "var(--color-accent)" }}>
                      {ourMatchEmoji} Our match — {isToday ? "Today!" : kickoffDate.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                    </span>
                  ) : isToday ? (
                    kicksOffSoon ? "🔥 Kicks off soon" : "Today's match"
                  ) : (
                    "Next match · " + kickoffDate.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm font-bold" style={{ color: "var(--color-text)" }}>
                <span className="text-xl">{getFlag(nextMatch.homeTeam.name)}</span>
                <span>{nextMatch.homeTeam.shortName || nextMatch.homeTeam.tla}</span>
                <span className="font-black" style={{ color: "var(--color-muted)" }}>vs</span>
                <span>{nextMatch.awayTeam.shortName || nextMatch.awayTeam.tla}</span>
                <span className="text-xl">{getFlag(nextMatch.awayTeam.name)}</span>
              </div>
              <div className="text-xs mt-1" style={{ color: "var(--color-muted)" }}>
                {getStageName(nextMatch.stage, nextMatch.group)}
                {nextMatch.venue ? ` · ${nextMatch.venue}` : ""}
              </div>
            </div>

            {/* Countdown (only if today) */}
            {isToday && msLeft > 0 && (
              <div
                className="hidden sm:flex flex-col items-center px-3 py-2 rounded-xl flex-shrink-0"
                style={{ backgroundColor: kicksOffSoon ? "rgba(255,200,0,0.12)" : "rgba(255,255,255,0.05)", border: "1px solid var(--color-border)" }}
              >
                <span
                  className="text-base font-black tabular-nums"
                  style={{ color: kicksOffSoon ? "var(--color-accent)" : "var(--color-text)" }}
                >
                  {pad(hours)}:{pad(minutes)}:{pad(seconds)}
                </span>
                <span className="text-xs" style={{ color: "var(--color-muted)" }}>until kickoff</span>
              </div>
            )}
          </div>

          {/* CTA */}
          {!hideCta && context !== "predictions" && (
            <Link
              href="/predictions"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all hover:opacity-85 flex-shrink-0"
              style={{ backgroundColor: "var(--color-accent)", color: "var(--color-accent-text)" }}
            >
              ⚽ Make your pick
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

/** Between stages — no matches today but tournament is ongoing */
function BetweenMatchesBanner({ nextMatch, context, hideCta }: { nextMatch: FDMatch | null; context: string; hideCta: boolean }) {
  const funLines = [
    "The group stage drama is over. Knockout time is coming. 🔥",
    "16 teams left. Your bracket is already a disaster. Own it.",
    "No matches today — time to check the leaderboard and gloat.",
    "Rest day. But the vibes are immaculate.",
  ];
  const line = funLines[Math.floor(Date.now() / 86400000) % funLines.length];

  return (
    <div
      className="rounded-2xl px-5 py-4 mb-6 flex items-center justify-between flex-wrap gap-3"
      style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--color-border)" }}
    >
      <div>
        <div className="text-sm font-bold mb-0.5" style={{ color: "var(--color-text)" }}>
          {line}
        </div>
        {nextMatch && (
          <div className="text-xs" style={{ color: "var(--color-muted)" }}>
            Next:{" "}
            <span className="font-semibold" style={{ color: "var(--color-text)" }}>
              {getFlag(nextMatch.homeTeam.name)} {nextMatch.homeTeam.shortName} vs {nextMatch.awayTeam.shortName} {getFlag(nextMatch.awayTeam.name)}
            </span>
            {" · "}
            {new Date(nextMatch.utcDate).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
          </div>
        )}
      </div>
      {!hideCta && context !== "predictions" && (
        <Link
          href="/predictions#leaderboard"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-85 flex-shrink-0"
          style={{
            backgroundColor: "rgba(255,255,255,0.06)",
            color: "var(--color-text)",
            border: "1px solid var(--color-border)",
          }}
        >
          👀 View leaderboard
        </Link>
      )}
    </div>
  );
}

/** Tournament over — celebrate the champion */
function PostTournamentBanner() {
  return (
    <div
      className="rounded-2xl px-5 py-5 mb-6 text-center"
      style={{
        background: "linear-gradient(135deg, rgba(255,200,0,0.12), rgba(255,200,0,0.04))",
        border: "1.5px solid rgba(255,200,0,0.3)",
      }}
    >
      <div className="text-4xl mb-2">🏆</div>
      <div className="text-base font-black mb-1" style={{ color: "var(--color-text)" }}>
        WC26 is over. The legend lives on.
      </div>
      <div className="text-sm" style={{ color: "var(--color-muted)" }}>
        Check the final leaderboard — did The Boys predict a champion?
      </div>
      <Link
        href="/predictions#leaderboard"
        className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold mt-4 transition-all hover:opacity-85"
        style={{ backgroundColor: "var(--color-accent)", color: "var(--color-accent-text)" }}
      >
        🏆 Final standings
      </Link>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────

export default function TournamentBanner({
  matches = [],
  context = "home",
  hideCta = false,
}: TournamentBannerProps) {
  const [now, setNow] = useState(() => new Date());

  // Re-render every second for countdown accuracy
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const liveMatches = useMemo(
    () => matches.filter((m) => isMatchLive(m.status)),
    [matches]
  );

  const nextMatch = useMemo(
    () =>
      matches
        .filter((m) => m.status === "SCHEDULED" || m.status === "TIMED")
        .sort((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime())[0] ?? null,
    [matches]
  );

  // ── State machine ──────────────────────────────────────────────

  // 1. Before tournament starts
  if (now < TOURNAMENT_START) {
    const msLeft = TOURNAMENT_START.getTime() - now.getTime();
    return <PreTournamentBanner msLeft={msLeft} context={context} />;
  }

  // 2. Tournament over
  if (now > TOURNAMENT_END) {
    return <PostTournamentBanner />;
  }

  // 3. Matches live right now
  if (liveMatches.length > 0) {
    return <LiveBanner liveMatches={liveMatches} />;
  }

  // 4. Match today (coming up) or very next match soon
  if (nextMatch) {
    const kickoffDate = new Date(nextMatch.utcDate);
    const isToday = kickoffDate.toDateString() === now.toDateString();
    const isTomorrow =
      kickoffDate.getTime() - now.getTime() < 36 * 60 * 60 * 1000;

    if (isToday || isTomorrow) {
      return (
        <MatchdayBanner nextMatch={nextMatch} context={context} hideCta={hideCta} />
      );
    }

    // Rest day — next match is further out
    return (
      <BetweenMatchesBanner nextMatch={nextMatch} context={context} hideCta={hideCta} />
    );
  }

  // 5. No upcoming matches found (API unavailable) — show generic tournament banner
  return (
    <div
      className="rounded-2xl px-5 py-4 mb-6 flex items-center gap-3"
      style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--color-border)" }}
    >
      <span className="text-2xl">⚽</span>
      <div>
        <div className="text-sm font-bold" style={{ color: "var(--color-text)" }}>
          FIFA World Cup 2026
        </div>
        <div className="text-xs" style={{ color: "var(--color-muted)" }}>
          104 matches · June 11 – July 19
        </div>
      </div>
    </div>
  );
}
