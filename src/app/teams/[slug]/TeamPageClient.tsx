/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Shirt,
  Users,
  Calendar,
  Trophy,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  type FDMatch,
  type FDTeamInfo,
  type FDSquadPlayer,
  getFlag,
  getStageName,
  isMatchFinished,
  isMatchLive,
} from "@/lib/football-data";
import { type WCTeam, getKitArchiveUrl } from "@/data/teams-data";

// ── Props ─────────────────────────────────────────────────────────

interface Props {
  team: WCTeam;
  fdoCrest: string | null;
  teamInfo: FDTeamInfo | null;
  matches: FDMatch[];
}

// ── Helpers ──────────────────────────────────────────────────────

function calcAge(dob: string): number {
  return Math.floor((Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
}

function fmtDate(utcDate: string): string {
  return new Date(utcDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function fmtTime(utcDate: string): string {
  return new Date(utcDate).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZoneName: "short",
  });
}

const POSITION_ORDER = ["Goalkeeper", "Defence", "Midfield", "Offence"] as const;
const POSITION_LABEL: Record<string, string> = {
  Goalkeeper: "Goalkeepers",
  Defence: "Defenders",
  Midfield: "Midfielders",
  Offence: "Forwards",
};

// ── Sub-components ────────────────────────────────────────────────

function MatchRow({ match, teamName }: { match: FDMatch; teamName: string }) {
  const isHome =
    match.homeTeam.name === teamName ||
    match.homeTeam.shortName === teamName;
  const opponent = isHome ? match.awayTeam : match.homeTeam;
  const finished = isMatchFinished(match.status);
  const live = isMatchLive(match.status);

  const myScore = finished || live
    ? (isHome ? match.score.fullTime.home : match.score.fullTime.away)
    : null;
  const oppScore = finished || live
    ? (isHome ? match.score.fullTime.away : match.score.fullTime.home)
    : null;

  const resultColor =
    !finished && !live
      ? "inherit"
      : myScore !== null && oppScore !== null
      ? myScore > oppScore
        ? "#16a34a"
        : myScore < oppScore
        ? "#dc2626"
        : "#ca8a04"
      : "inherit";

  const oppFlag = getFlag(opponent.name);

  return (
    <Link
      href={`/arena/match/${match.id}`}
      className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all hover:scale-[1.01]"
      style={{
        backgroundColor: "var(--bg-page)",
        border: "1px solid var(--color-border)",
        textDecoration: "none",
      }}
    >
      {/* Stage + Date */}
      <div className="flex flex-col min-w-0" style={{ flex: "0 0 auto", width: "80px" }}>
        <span className="text-xs font-semibold" style={{ color: "var(--color-accent)" }}>
          {getStageName(match.stage, match.group)}
        </span>
        <span className="text-xs mt-0.5" style={{ color: "var(--color-muted)" }}>
          {fmtDate(match.utcDate)}
        </span>
        {!finished && !live && (
          <span className="text-xs" style={{ color: "var(--color-muted)" }}>
            {fmtTime(match.utcDate)}
          </span>
        )}
      </div>

      {/* H/A badge */}
      <span
        className="text-xs font-bold px-1.5 py-0.5 rounded"
        style={{
          backgroundColor: "var(--bg-surface-2)",
          color: "var(--color-muted)",
          flex: "0 0 auto",
        }}
      >
        {isHome ? "H" : "A"}
      </span>

      {/* Opponent */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="text-xl">{oppFlag}</span>
        <span
          className="text-sm font-medium truncate"
          style={{ color: "var(--color-text)" }}
        >
          {opponent.shortName || opponent.name}
        </span>
      </div>

      {/* Score / Status */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {live && (
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-full animate-pulse"
            style={{ backgroundColor: "rgba(239,68,68,0.15)", color: "#ef4444" }}
          >
            LIVE
          </span>
        )}
        {(finished || live) && myScore !== null && oppScore !== null ? (
          <span
            className="text-sm font-bold tabular-nums"
            style={{ color: resultColor }}
          >
            {myScore} – {oppScore}
          </span>
        ) : (
          !live && (
            <span
              className="text-xs font-medium px-2 py-0.5 rounded"
              style={{
                backgroundColor: "var(--bg-surface-2)",
                color: "var(--color-muted)",
              }}
            >
              TBD
            </span>
          )
        )}
      </div>
    </Link>
  );
}

function PlayerCard({ player }: { player: FDSquadPlayer }) {
  const age = player.dateOfBirth ? calcAge(player.dateOfBirth) : null;
  return (
    <div
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
      style={{
        backgroundColor: "var(--bg-page)",
        border: "1px solid var(--color-border)",
      }}
    >
      {/* Shirt number */}
      <div
        className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
        style={{
          backgroundColor: "var(--color-accent)",
          color: "var(--color-accent-text)",
        }}
      >
        {player.shirtNumber ?? "–"}
      </div>
      {/* Name + info */}
      <div className="flex flex-col min-w-0 flex-1">
        <span
          className="text-sm font-semibold truncate"
          style={{ color: "var(--color-text)" }}
        >
          {player.name}
        </span>
        <span className="text-xs" style={{ color: "var(--color-muted)" }}>
          {player.nationality}
          {age ? ` · ${age}y` : ""}
        </span>
      </div>
    </div>
  );
}

// ── Section wrapper ──────────────────────────────────────────────

function Section({
  title,
  icon,
  children,
  collapsible = false,
  defaultOpen = true,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--color-border)" }}
    >
      <button
        className="w-full flex items-center justify-between gap-2.5 px-5 py-3.5 text-left"
        style={{
          borderBottom: open ? "1px solid var(--color-border)" : "none",
          cursor: collapsible ? "pointer" : "default",
          background: "none",
        }}
        onClick={() => collapsible && setOpen((v) => !v)}
      >
        <div className="flex items-center gap-2.5">
          {icon && <span style={{ color: "var(--color-accent)" }}>{icon}</span>}
          <h3 className="text-sm font-bold tracking-wide uppercase" style={{ color: "var(--color-text)" }}>
            {title}
          </h3>
        </div>
        {collapsible && (
          <span style={{ color: "var(--color-muted)" }}>
            {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </span>
        )}
      </button>
      {open && <div className="p-5">{children}</div>}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────

export default function TeamPageClient({ team, fdoCrest, teamInfo, matches }: Props) {
  const squad = teamInfo?.squad ?? [];
  const coach = teamInfo?.coach ?? null;

  // Group squad by position
  const squadByPosition: Record<string, FDSquadPlayer[]> = {};
  for (const pos of POSITION_ORDER) {
    const players = squad.filter((p) => p.position === pos);
    if (players.length > 0) {
      squadByPosition[pos] = players.sort(
        (a, b) => (a.shirtNumber ?? 99) - (b.shirtNumber ?? 99)
      );
    }
  }

  // Derive group from match data
  const groupMatch = matches.find((m) => m.stage === "GROUP_STAGE" && m.group);
  const groupLabel = groupMatch?.group
    ? `Group ${groupMatch.group.replace("GROUP_", "")}`
    : null;

  // Separate group matches from knockout
  const groupMatches = matches.filter((m) => m.stage === "GROUP_STAGE");
  const knockoutMatches = matches.filter((m) => m.stage !== "GROUP_STAGE");

  // Find this team's FDO name for MatchRow (try a few things)
  const fdoTeamName =
    teamInfo?.name ??
    matches[0]?.homeTeam.name ??
    team.fdoName;

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--bg-page)" }}
    >
      {/* ── Inline theme override: team colors as accent ── */}
      <style>{`
        body[data-theme] .team-accent-override,
        .team-accent-override {
          --color-accent: ${team.colors.primary};
          --color-accent-hover: ${team.colors.primary}cc;
          --color-accent-text: ${
            isLightColor(team.colors.primary) ? "#000000" : "#FFFFFF"
          };
        }
      `}</style>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4 team-accent-override">

        {/* Back button */}
        <div>
          <Link
            href="/arena"
            className="inline-flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-70"
            style={{ color: "var(--color-muted)", textDecoration: "none" }}
          >
            <ArrowLeft size={15} />
            Back to Arena
          </Link>
        </div>

        {/* ── Hero ─────────────────────────────────────────── */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${team.colors.primary}22 0%, ${team.colors.secondary}11 100%)`,
            border: `1px solid ${team.colors.primary}33`,
          }}
        >
          <div className="flex items-center gap-5 p-6">
            {/* Crest or flag */}
            <div className="flex-shrink-0">
              {fdoCrest ? (
                <img
                  src={fdoCrest}
                  alt={`${team.displayName} crest`}
                  width={72}
                  height={72}
                  className="drop-shadow-md"
                  style={{ objectFit: "contain" }}
                />
              ) : (
                <span className="text-6xl">{team.flag}</span>
              )}
            </div>

            {/* Name + meta */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold mb-1" style={{ color: "var(--color-muted)" }}>
                {team.confederation} · {team.flag}
              </p>
              <h1
                className="text-2xl sm:text-3xl font-extrabold leading-tight"
                style={{ color: "var(--color-text)" }}
              >
                {team.displayName}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                {groupLabel && (
                  <span
                    className="text-xs font-bold px-2.5 py-1 rounded-full"
                    style={{
                      backgroundColor: `${team.colors.primary}22`,
                      color: team.colors.primary,
                      border: `1px solid ${team.colors.primary}44`,
                    }}
                  >
                    {groupLabel}
                  </span>
                )}
                {coach && (
                  <span
                    className="text-xs font-medium"
                    style={{ color: "var(--color-muted)" }}
                  >
                    Coach: <strong style={{ color: "var(--color-text)" }}>{coach.name}</strong>
                  </span>
                )}
                {teamInfo?.founded && (
                  <span className="text-xs" style={{ color: "var(--color-muted)" }}>
                    Est. {teamInfo.founded}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Color bar */}
          <div className="flex h-1.5">
            <div className="flex-1" style={{ backgroundColor: team.colors.primary }} />
            <div className="flex-1" style={{ backgroundColor: team.colors.secondary }} />
          </div>
        </div>

        {/* ── Fixtures ─────────────────────────────────────── */}
        {matches.length > 0 && (
          <Section title="Fixtures" icon={<Calendar size={16} />}>
            <div className="space-y-2">
              {groupMatches.length > 0 && (
                <>
                  <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--color-muted)" }}>
                    Group Stage
                  </p>
                  {groupMatches.map((m) => (
                    <MatchRow key={m.id} match={m} teamName={fdoTeamName} />
                  ))}
                </>
              )}
              {knockoutMatches.length > 0 && (
                <>
                  <p className="text-xs font-bold uppercase tracking-widest mt-4 mb-2" style={{ color: "var(--color-muted)" }}>
                    Knockout
                  </p>
                  {knockoutMatches.map((m) => (
                    <MatchRow key={m.id} match={m} teamName={fdoTeamName} />
                  ))}
                </>
              )}
            </div>
          </Section>
        )}

        {/* ── Squad ────────────────────────────────────────── */}
        {squad.length > 0 ? (
          <Section
            title={`Squad (${squad.length})`}
            icon={<Users size={16} />}
            collapsible
            defaultOpen
          >
            <div className="space-y-5">
              {POSITION_ORDER.filter((pos) => squadByPosition[pos]).map((pos) => (
                <div key={pos}>
                  <p
                    className="text-xs font-bold uppercase tracking-widest mb-2.5"
                    style={{ color: "var(--color-muted)" }}
                  >
                    {POSITION_LABEL[pos]} ({squadByPosition[pos].length})
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {squadByPosition[pos].map((player) => (
                      <PlayerCard key={player.id} player={player} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        ) : (
          <Section title="Squad" icon={<Users size={16} />}>
            <p className="text-sm text-center py-4" style={{ color: "var(--color-muted)" }}>
              Squad data not yet available for {team.displayName}.
            </p>
          </Section>
        )}

        {/* ── Coach ────────────────────────────────────────── */}
        {coach && (
          <Section title="Coach" icon={<Trophy size={16} />}>
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0"
                style={{
                  backgroundColor: `${team.colors.primary}22`,
                  border: `2px solid ${team.colors.primary}44`,
                  color: team.colors.primary,
                }}
              >
                {coach.firstName?.[0] ?? ""}
                {coach.lastName?.[0] ?? ""}
              </div>
              <div>
                <p className="font-bold" style={{ color: "var(--color-text)" }}>
                  {coach.name}
                </p>
                <p className="text-sm" style={{ color: "var(--color-muted)" }}>
                  {coach.nationality}
                  {coach.dateOfBirth
                    ? ` · ${calcAge(coach.dateOfBirth)}y old`
                    : ""}
                </p>
                {coach.contract && (
                  <p className="text-xs mt-0.5" style={{ color: "var(--color-muted)" }}>
                    Contract until {new Date(coach.contract.until).getFullYear()}
                  </p>
                )}
              </div>
            </div>
          </Section>
        )}

        {/* ── Kits ─────────────────────────────────────────── */}
        <Section title="2026 Kits" icon={<Shirt size={16} />}>
          <div className="flex flex-col gap-3">
            <p className="text-sm" style={{ color: "var(--color-muted)" }}>
              View {team.displayName}&apos;s official WC 2026 kit designs on Football Kit Archive.
            </p>
            <div className="flex items-center gap-3">
              {/* Color swatches */}
              <div className="flex gap-2">
                <div
                  className="w-8 h-8 rounded-lg shadow-sm border"
                  style={{
                    backgroundColor: team.colors.primary,
                    borderColor: "var(--color-border)",
                  }}
                  title="Primary"
                />
                <div
                  className="w-8 h-8 rounded-lg shadow-sm border"
                  style={{
                    backgroundColor: team.colors.secondary,
                    borderColor: "var(--color-border)",
                  }}
                  title="Secondary"
                />
              </div>
              {/* Link */}
              <a
                href={getKitArchiveUrl(team)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-lg transition-opacity hover:opacity-80"
                style={{
                  backgroundColor: `${team.colors.primary}22`,
                  color: team.colors.primary,
                  border: `1px solid ${team.colors.primary}44`,
                  textDecoration: "none",
                }}
              >
                View 2026 Kits
                <ExternalLink size={13} />
              </a>
            </div>
          </div>
        </Section>

        {/* ── Latest News (YouTube) ─────────────────────────── */}
        <Section title="Latest News" icon={<Trophy size={16} />} collapsible defaultOpen={false}>
          <p className="text-sm mb-3" style={{ color: "var(--color-muted)" }}>
            Recent {team.displayName} WC 2026 coverage.
          </p>
          <a
            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
              team.displayName + " World Cup 2026"
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl transition-opacity hover:opacity-80"
            style={{
              backgroundColor: "#FF0000",
              color: "#FFFFFF",
              textDecoration: "none",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" />
            </svg>
            Search YouTube
          </a>
        </Section>

        {/* Attribution */}
        <p className="text-center text-xs py-2" style={{ color: "var(--color-muted)" }}>
          Squad & match data via{" "}
          <a
            href="https://www.football-data.org"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--color-accent)" }}
          >
            football-data.org
          </a>
        </p>
      </div>
    </div>
  );
}

// ── Utility ───────────────────────────────────────────────────────

/** True if a hex color is perceptually light (use dark text on top). */
function isLightColor(hex: string): boolean {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  // Perceived luminance
  return r * 0.299 + g * 0.587 + b * 0.114 > 160;
}
