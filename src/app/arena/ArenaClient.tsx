"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  type FDMatch,
  getFlag,
  getStageName,
  isMatchLive,
  isMatchFinished,
} from "@/lib/football-data";
import { getTodaysQuestion, type DailyQuestion } from "@/data/daily-questions";
import SectionHeader from "@/components/SectionHeader";
import TournamentBanner from "@/components/TournamentBanner";

interface ArenaClientProps {
  matches: FDMatch[];
}

// ── Helpers ──────────────────────────────────────────────────────

/** Return "YYYY-MM-DD" in the visitor's local timezone for a UTC date string. */
function localDateStr(utcDateStr: string): string {
  const d = new Date(utcDateStr);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Group matches by local calendar date (visitor's timezone). */
function groupMatchesByLocalDate(matches: FDMatch[]): Record<string, FDMatch[]> {
  const groups: Record<string, FDMatch[]> = {};
  for (const match of matches) {
    const key = localDateStr(match.utcDate);
    if (!groups[key]) groups[key] = [];
    groups[key].push(match);
  }
  return groups;
}

function formatTabDate(dateStr: string): { dayNum: string; dayName: string; monthAbr: string } {
  // Parse "YYYY-MM-DD" as a local-noon Date so display stays on the right calendar day
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day, 12, 0, 0);
  return {
    dayNum: d.toLocaleDateString("en-US", { day: "numeric" }),
    dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
    monthAbr: d.toLocaleDateString("en-US", { month: "short" }),
  };
}

function formatKickoffLocal(utcDate: string): string {
  return new Date(utcDate).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZoneName: "short",
  });
}

function matchesHaveStarted(matches: FDMatch[]): boolean {
  return matches.some((m) => isMatchLive(m.status) || isMatchFinished(m.status));
}

// ── Match status badge ───────────────────────────────────────────

function StatusBadge({ status }: { status: FDMatch["status"] }) {
  if (isMatchLive(status)) {
    return (
      <span
        className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full"
        style={{ backgroundColor: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)" }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block" />
        LIVE
      </span>
    );
  }
  if (isMatchFinished(status)) {
    return (
      <span
        className="text-xs font-bold px-2.5 py-1 rounded-full"
        style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "var(--color-muted)", border: "1px solid var(--color-border)" }}
      >
        FT
      </span>
    );
  }
  return null;
}

// ── Match card ───────────────────────────────────────────────────

function MatchCard({ match, isCrewMatch }: { match: FDMatch; isCrewMatch: boolean }) {
  const finished = isMatchFinished(match.status);
  const live = isMatchLive(match.status);
  const upcoming = !finished && !live;

  const homeFlag = getFlag(match.homeTeam.name);
  const awayFlag = getFlag(match.awayTeam.name);
  const stageLabel = getStageName(match.stage, match.group);

  const homeScore = match.score.fullTime.home;
  const awayScore = match.score.fullTime.away;

  const homeWon = finished && match.score.winner === "HOME_TEAM";
  const awayWon = finished && match.score.winner === "AWAY_TEAM";

  // Deep-link: crew matches go to match picks tab, others to tournament tab
  const predHref = isCrewMatch ? "/predictions?tab=matches" : "/predictions?tab=tournament";

  return (
    <Link
      href={`/arena/match/${match.id}`}
      className="block rounded-2xl overflow-hidden transition-all hover:scale-[1.01] hover:shadow-lg"
      style={{
        backgroundColor: "var(--bg-surface)",
        border: isCrewMatch
          ? "1.5px solid var(--color-accent)"
          : "1px solid var(--color-border)",
        boxShadow: isCrewMatch ? "0 0 0 1px var(--color-accent-subtle, rgba(255,200,0,0.15))" : undefined,
        textDecoration: "none",
      }}
    >
      {/* Crew match indicator */}
      {isCrewMatch && (
        <div
          className="px-4 py-1.5 text-xs font-bold flex items-center gap-1.5"
          style={{ backgroundColor: "var(--color-accent)", color: "var(--color-accent-text)" }}
        >
          <span>🎟️</span> We&apos;re there for this one · tap for match details
        </div>
      )}

      <div className="p-4">
        {/* Stage + status */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold" style={{ color: "var(--color-muted)" }}>
            {stageLabel}
            {match.venue ? ` · ${match.venue}` : ""}
          </span>
          <StatusBadge status={match.status} />
        </div>

        {/* Teams + score */}
        <div className="flex items-center gap-3">
          {/* Home team */}
          <div className="flex-1 flex flex-col items-center gap-1.5 text-center min-w-0">
            <span className="text-3xl">{homeFlag}</span>
            <span
              className="text-xs font-bold leading-tight line-clamp-2"
              style={{ color: homeWon ? "var(--color-text)" : finished ? "var(--color-muted)" : "var(--color-text)" }}
            >
              {match.homeTeam.shortName || match.homeTeam.name}
            </span>
            {homeWon && <span className="text-xs font-bold" style={{ color: "var(--color-accent)" }}>W</span>}
          </div>

          {/* Score / time */}
          <div className="flex flex-col items-center gap-1 flex-shrink-0 min-w-[64px]">
            {(finished || live) && homeScore !== null && awayScore !== null ? (
              <div className="flex items-center gap-2">
                <span
                  className="text-2xl font-black tabular-nums"
                  style={{ color: homeWon ? "var(--color-text)" : "var(--color-muted)" }}
                >
                  {homeScore}
                </span>
                <span className="text-lg font-bold" style={{ color: "var(--color-muted)" }}>–</span>
                <span
                  className="text-2xl font-black tabular-nums"
                  style={{ color: awayWon ? "var(--color-text)" : "var(--color-muted)" }}
                >
                  {awayScore}
                </span>
              </div>
            ) : (
              <>
                <span className="text-lg font-black" style={{ color: "var(--color-muted)" }}>vs</span>
                <span className="text-xs font-semibold text-center" style={{ color: "var(--color-accent)" }}>
                  {formatKickoffLocal(match.utcDate)}
                </span>
              </>
            )}
            {live && (
              <span className="text-xs font-bold" style={{ color: "#ef4444" }}>
                {match.status === "PAUSED" ? "HT" : "LIVE"}
              </span>
            )}
            {finished && match.score.duration !== "REGULAR" && (
              <span className="text-xs" style={{ color: "var(--color-muted)" }}>
                {match.score.duration === "PENALTY_SHOOTOUT" ? "PSO" : "AET"}
              </span>
            )}
          </div>

          {/* Away team */}
          <div className="flex-1 flex flex-col items-center gap-1.5 text-center min-w-0">
            <span className="text-3xl">{awayFlag}</span>
            <span
              className="text-xs font-bold leading-tight line-clamp-2"
              style={{ color: awayWon ? "var(--color-text)" : finished ? "var(--color-muted)" : "var(--color-text)" }}
            >
              {match.awayTeam.shortName || match.awayTeam.name}
            </span>
            {awayWon && <span className="text-xs font-bold" style={{ color: "var(--color-accent)" }}>W</span>}
          </div>
        </div>

        {/* Pick CTA (upcoming only) */}
        {upcoming && (
          <div className="mt-4 pt-3" style={{ borderTop: "1px solid var(--color-border)" }}>
            <div className="flex gap-2">
              <div
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold"
                style={{
                  backgroundColor: "var(--color-accent)",
                  color: "var(--color-accent-text)",
                }}
                onClick={(e) => { e.preventDefault(); window.location.href = predHref; }}
              >
                ⚽ Make your pick
              </div>
              <div
                className="flex items-center justify-center px-3 py-2.5 rounded-xl text-xs font-semibold"
                style={{
                  backgroundColor: "var(--bg-page)",
                  color: "var(--color-muted)",
                  border: "1px solid var(--color-border)",
                }}
              >
                Stats →
              </div>
            </div>
          </div>
        )}

        {/* Results CTA (finished matches) */}
        {finished && (
          <div className="mt-4 pt-3" style={{ borderTop: "1px solid var(--color-border)" }}>
            <div
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold"
              style={{
                backgroundColor: "rgba(255,255,255,0.05)",
                color: "var(--color-muted)",
                border: "1px solid var(--color-border)",
              }}
            >
              👥 Results &amp; picks → view match
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}

// ── Daily Question of the Day ────────────────────────────────────

function QuestionOfTheDay({ question }: { question: DailyQuestion }) {
  const [voted, setVoted] = useState<string | null>(null);
  const [votes, setVotes] = useState<Record<string, number>>({});

  useEffect(() => {
    // Persist votes locally so they survive refresh
    const stored = localStorage.getItem(`qotd-${question.id}`);
    if (stored) {
      const parsed = JSON.parse(stored) as { voted: string; votes: Record<string, number> };
      setVoted(parsed.voted);
      setVotes(parsed.votes);
    }
  }, [question.id]);

  const handleVote = (optionId: string) => {
    if (voted) return;
    const newVotes = { ...votes, [optionId]: (votes[optionId] ?? 0) + 1 };
    setVoted(optionId);
    setVotes(newVotes);
    localStorage.setItem(`qotd-${question.id}`, JSON.stringify({ voted: optionId, votes: newVotes }));
  };

  const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0);

  const categoryColors: Record<string, string> = {
    banter: "#f59e0b",
    prediction: "var(--color-accent)",
    debate: "#8b5cf6",
    viral: "#ec4899",
    tactical: "#06b6d4",
  };

  return (
    <div
      className="rounded-2xl p-5 mb-6"
      style={{
        backgroundColor: "var(--bg-surface)",
        border: `1px solid ${categoryColors[question.category] ?? "var(--color-border)"}33`,
        background: `linear-gradient(135deg, var(--bg-surface), ${categoryColors[question.category] ?? "var(--color-accent)"}08)`,
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span
          className="text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-widest"
          style={{
            backgroundColor: `${categoryColors[question.category] ?? "var(--color-accent)"}20`,
            color: categoryColors[question.category] ?? "var(--color-accent)",
          }}
        >
          {question.category}
        </span>
        <span className="text-xs" style={{ color: "var(--color-muted)" }}>
          Question of the Day
        </span>
      </div>

      <div className="flex items-start gap-2 mb-4">
        <span className="text-2xl flex-shrink-0">{question.emoji}</span>
        <h3 className="text-base font-bold leading-snug" style={{ color: "var(--color-text)" }}>
          {question.question}
        </h3>
      </div>

      <div className="flex flex-col gap-2">
        {question.options.map((opt) => {
          const optVotes = votes[opt.id] ?? 0;
          const pct = totalVotes > 0 ? Math.round((optVotes / totalVotes) * 100) : 0;
          const isMyVote = voted === opt.id;
          const showResults = voted !== null;

          return (
            <button
              key={opt.id}
              onClick={() => handleVote(opt.id)}
              disabled={voted !== null}
              className="relative w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all overflow-hidden"
              style={{
                backgroundColor: isMyVote
                  ? `${categoryColors[question.category] ?? "var(--color-accent)"}20`
                  : "var(--bg-page)",
                border: `1.5px solid ${isMyVote ? (categoryColors[question.category] ?? "var(--color-accent)") : "var(--color-border)"}`,
                color: "var(--color-text)",
                cursor: voted ? "default" : "pointer",
              }}
            >
              {/* Progress bar background */}
              {showResults && (
                <div
                  className="absolute inset-y-0 left-0 transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: isMyVote
                      ? `${categoryColors[question.category] ?? "var(--color-accent)"}25`
                      : "rgba(255,255,255,0.04)",
                  }}
                />
              )}

              <div className="relative flex items-center justify-between gap-3">
                <span className="flex items-center gap-2">
                  {opt.emoji && <span>{opt.emoji}</span>}
                  {opt.label}
                </span>
                {showResults && (
                  <span
                    className="text-xs font-bold flex-shrink-0"
                    style={{ color: isMyVote ? (categoryColors[question.category] ?? "var(--color-accent)") : "var(--color-muted)" }}
                  >
                    {pct}%
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {voted && (
        <p className="text-xs mt-3 text-center" style={{ color: "var(--color-muted)" }}>
          {totalVotes} vote{totalVotes !== 1 ? "s" : ""} · your pick is locked in 🔒
        </p>
      )}
    </div>
  );
}

// ── No API key / no data placeholder ────────────────────────────

function NoDataPlaceholder() {
  return (
    <div className="text-center py-20">
      <div className="text-5xl mb-4">📡</div>
      <h3 className="text-lg font-bold mb-2" style={{ color: "var(--color-text)" }}>
        Connecting to match data...
      </h3>
      <p className="text-sm max-w-xs mx-auto" style={{ color: "var(--color-muted)" }}>
        The match schedule will appear here once the API is connected.
        {" "}Tournament starts June 11, 2026.
      </p>
    </div>
  );
}

// ── Main Arena client ────────────────────────────────────────────

export default function ArenaClient({ matches }: ArenaClientProps) {
  const question = useMemo(() => getTodaysQuestion(), []);

  // Group matches by the visitor's local calendar date
  const matchesByDate = useMemo(() => groupMatchesByLocalDate(matches), [matches]);
  const sortedDates = useMemo(
    () => Object.keys(matchesByDate).sort(),
    [matchesByDate]
  );

  // Crew match IDs (from our prediction data)
  const CREW_MATCH_API_PATTERN = useMemo(
    () => new Set([
      "Germany", // crew watch June 14
      "Argentina", // crew watch June 16
      "Brazil", // crew watch June 19
    ]),
    []
  );

  const isCrewMatch = (match: FDMatch): boolean => {
    const crewDates = ["2026-06-14", "2026-06-16", "2026-06-19"];
    const matchDate = localDateStr(match.utcDate); // local calendar date, not UTC
    if (!crewDates.includes(matchDate)) return false;
    return (
      CREW_MATCH_API_PATTERN.has(match.homeTeam.name) ||
      CREW_MATCH_API_PATTERN.has(match.awayTeam.name)
    );
  };

  // Default to today's date (local), or first available date
  const todayStr = localDateStr(new Date().toISOString());
  const defaultDate = sortedDates.find((d) => d >= todayStr) ?? sortedDates[0] ?? todayStr;
  const [selectedDate, setSelectedDate] = useState(defaultDate);

  // When matches change, keep the selected date valid
  const currentMatches = matchesByDate[selectedDate] ?? [];

  if (matches.length === 0) {
    return (
      <div className="pt-24 pb-20 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="The Arena"
            title="Match Arena"
            subtitle="All 104 FIFA World Cup 2026 matches — pick winners, track results, dominate the leaderboard."
          />
          <NoDataPlaceholder />
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-6">
          <SectionHeader
            label="The Arena"
            title="Match Arena"
            subtitle="All 104 FIFA World Cup 2026 matches — pick winners, track results, dominate the leaderboard."
          />
        </div>

        {/* Live banner */}
        <TournamentBanner matches={matches} context="arena" />

        {/* Question of the Day */}
        <QuestionOfTheDay question={question} />

        {/* Date tab strip */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-1 px-1 scrollbar-hide">
          {sortedDates.map((date) => {
            const { dayNum, dayName, monthAbr } = formatTabDate(date);
            const isSelected = date === selectedDate;
            const hasLive = (matchesByDate[date] ?? []).some((m) => isMatchLive(m.status));
            const isToday = date === todayStr;

            return (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className="flex-shrink-0 flex flex-col items-center px-4 py-2.5 rounded-xl transition-all text-center"
                style={{
                  backgroundColor: isSelected ? "var(--color-accent)" : "var(--bg-surface)",
                  color: isSelected ? "var(--color-accent-text)" : "var(--color-muted)",
                  border: `1.5px solid ${isSelected ? "var(--color-accent)" : "var(--color-border)"}`,
                  minWidth: "60px",
                  position: "relative",
                }}
              >
                <span className="text-xs font-semibold">{dayName}</span>
                <span className="text-lg font-black leading-none">{dayNum}</span>
                <span className="text-xs opacity-70">{monthAbr}</span>
                {hasLive && !isSelected && (
                  <span
                    className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 animate-pulse"
                  />
                )}
                {isToday && !isSelected && (
                  <span className="text-xs font-bold mt-0.5" style={{ color: "var(--color-accent)" }}>
                    Today
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Match grid for selected date */}
        {currentMatches.length === 0 ? (
          <div className="text-center py-16" style={{ color: "var(--color-muted)" }}>
            <div className="text-4xl mb-3">📅</div>
            <p className="text-sm">No matches on this day</p>
          </div>
        ) : (
          <>
            {/* Date heading */}
            <div className="mb-4">
              <h2 className="text-base font-bold" style={{ color: "var(--color-text)" }}>
                {(() => {
                  const [y, mo, d] = selectedDate.split("-").map(Number);
                  return new Date(y, mo - 1, d, 12, 0, 0).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  });
                })()}
              </h2>
              <p className="text-xs mt-0.5" style={{ color: "var(--color-muted)" }}>
                {currentMatches.length} match{currentMatches.length !== 1 ? "es" : ""}
                {matchesHaveStarted(currentMatches) ? " · results in" : " · picks open"}
              </p>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentMatches.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  isCrewMatch={isCrewMatch(match)}
                />
              ))}
            </div>
          </>
        )}

        {/* Footer attribution */}
        <div className="mt-10 text-center">
          <p className="text-xs" style={{ color: "var(--color-muted)" }}>
            Match data from{" "}
            <a
              href="https://www.football-data.org"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:opacity-70"
            >
              football-data.org
            </a>
            {" "}· refreshes every 60 seconds
          </p>
        </div>
      </div>
    </div>
  );
}
