/* eslint-disable @next/next/no-img-element */
import { notFound } from "next/navigation";
import { WC_TEAMS, getTeamBySlug, getTeamByFdoName } from "@/data/teams-data";
import { getAllWCMatches, getTeamInfo } from "@/lib/football-data";
import TeamPageClient from "./TeamPageClient";

// ISR: rebuild team pages every 60 min (squad + match data)
export const revalidate = 3600;

// ── Static params for all 48 teams ──────────────────────────────

export function generateStaticParams() {
  return WC_TEAMS.map((t) => ({ slug: t.slug }));
}

// ── Metadata ─────────────────────────────────────────────────────

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const team = getTeamBySlug(slug);
  if (!team) return {};
  return {
    title: `${team.flag} ${team.displayName} — WC26 The Boys`,
    description: `Squad, fixtures, coach info, and kit for ${team.displayName} at the FIFA World Cup 2026.`,
  };
}

// ── Page ─────────────────────────────────────────────────────────

export default async function TeamPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const team = getTeamBySlug(slug);
  if (!team) notFound();

  // Fetch all WC matches — used to find the team's FDO id + their fixtures
  const allMatches = await getAllWCMatches();

  // Find this team's FDO representation from any match they appear in
  const foundInMatch = allMatches.find(
    (m) =>
      getTeamByFdoName(m.homeTeam.name ?? "")?.slug === slug ||
      getTeamByFdoName(m.awayTeam.name ?? "")?.slug === slug
  );

  const fdoTeam = foundInMatch
    ? getTeamByFdoName(foundInMatch.homeTeam.name ?? "")?.slug === slug
      ? foundInMatch.homeTeam
      : foundInMatch.awayTeam
    : null;

  // Fetch full team info (squad + coach) if we found a FDO ID
  const teamInfo = fdoTeam?.id ? await getTeamInfo(fdoTeam.id) : null;

  // All matches featuring this team
  const teamMatches = allMatches
    .filter(
      (m) =>
        getTeamByFdoName(m.homeTeam.name ?? "")?.slug === slug ||
        getTeamByFdoName(m.awayTeam.name ?? "")?.slug === slug
    )
    .sort((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime());

  return (
    <TeamPageClient
      team={team}
      fdoCrest={fdoTeam?.crest ?? null}
      teamInfo={teamInfo}
      matches={teamMatches}
    />
  );
}
