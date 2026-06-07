import { getMatch, getMatchH2H, getWCStandings, getTeamSquad } from "@/lib/football-data";
import MatchDetailClient from "./MatchDetailClient";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function MatchDetailPage({ params }: Props) {
  const { id } = await params;
  const matchId = parseInt(id, 10);

  if (isNaN(matchId)) notFound();

  // Step 1: get the match directly so we have team IDs
  const match = await getMatch(matchId);
  if (!match) notFound();

  // Step 2: parallel fetch everything else
  const [h2h, standings, homeSquad, awaySquad] = await Promise.all([
    getMatchH2H(matchId),
    getWCStandings(),
    getTeamSquad(match.homeTeam.id),
    getTeamSquad(match.awayTeam.id),
  ]);

  return (
    <MatchDetailClient
      match={match}
      h2h={h2h}
      standings={standings}
      homeSquad={homeSquad}
      awaySquad={awaySquad}
    />
  );
}
