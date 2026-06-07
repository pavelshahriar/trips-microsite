/**
 * GET /api/arena/results
 *
 * Returns a MatchResultData map for every FINISHED WC26 match.
 * Used by the leaderboard to calculate live scores without needing
 * the manual results.ts file to be updated.
 *
 * Response shape:
 *   { results: Record<string, MatchResultData> }
 *   where the key is String(fdMatch.id)
 *
 * Cached at the edge for 60 seconds so the leaderboard stays fresh
 * without hammering football-data.org.
 */

import { NextResponse } from "next/server";
import { getAllWCMatches, isMatchFinished } from "@/lib/football-data";
import type { MatchResultData } from "@/lib/scoring";

export const revalidate = 60; // ISR — regenerate every 60s

export async function GET() {
  const matches = await getAllWCMatches();

  const results: Record<string, MatchResultData> = {};

  for (const match of matches) {
    if (!isMatchFinished(match.status)) continue;

    const { score, homeTeam, awayTeam } = match;
    const home = score.fullTime.home;
    const away = score.fullTime.away;

    if (home === null || away === null) continue;

    let winner: string;
    if (score.winner === "HOME_TEAM") {
      winner = homeTeam.name;
    } else if (score.winner === "AWAY_TEAM") {
      winner = awayTeam.name;
    } else {
      winner = "Draw";
    }

    results[String(match.id)] = {
      winner,
      score_home: home,
      score_away: away,
      final: true,
    };
  }

  return NextResponse.json(
    { results },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    }
  );
}
