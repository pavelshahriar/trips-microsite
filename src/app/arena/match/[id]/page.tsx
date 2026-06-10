import { getMatchWithEvents, getMatchH2H, getWCStandings, getTeamSquad } from "@/lib/football-data";
import MatchDetailClient from "./MatchDetailClient";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function MatchDetailPage({ params }: Props) {
  const { id } = await params;
  const matchId = parseInt(id, 10);

  if (isNaN(matchId)) notFound();

  // Step 1: get the match (with full event detail for match day center)
  const match = await getMatchWithEvents(matchId);
  if (!match) notFound();

  // Step 2: parallel fetch everything else.
  // Guard squad fetches — knockout-round TBD teams have null IDs.
  const [h2h, standings, homeSquad, awaySquad] = await Promise.all([
    getMatchH2H(matchId),
    getWCStandings(),
    match.homeTeam.id ? getTeamSquad(match.homeTeam.id) : Promise.resolve([]),
    match.awayTeam.id ? getTeamSquad(match.awayTeam.id) : Promise.resolve([]),
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
