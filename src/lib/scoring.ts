// ============================================================
// WC26 Prediction Scoring Engine
// ============================================================

import { MATCH_RESULTS, TOURNAMENT_RESULT } from "@/data/results";
import type { TournamentPicks, MatchPick } from "@/data/predictions";

export interface ScoreBreakdown {
  total: number;
  matchPoints: Record<string, number>;  // match_id → points earned
  tournamentPoints: number;
  details: ScoreDetail[];
}

export interface ScoreDetail {
  label: string;
  points: number;
  correct: boolean;
}

// ── Match scoring ─────────────────────────────────────────────
// Correct winner:      1 pt
// Exact score:         3 pts (on top of winner point)
// First goalscorer:    5 pts
// VAR banter:          0 pts (just for laughs)

export function scoreMatchPick(pick: Partial<MatchPick>): { points: number; details: ScoreDetail[] } {
  if (!pick.match_id) return { points: 0, details: [] };

  const result = MATCH_RESULTS[pick.match_id];
  if (!result || !result.final) return { points: 0, details: [] };

  const details: ScoreDetail[] = [];
  let points = 0;

  // Winner
  const correctWinner = pick.winner === result.winner;
  if (correctWinner) {
    points += 1;
    details.push({ label: "Correct winner", points: 1, correct: true });
  } else {
    details.push({ label: "Wrong winner", points: 0, correct: false });
  }

  // Exact score (only if winner was also correct)
  if (
    correctWinner &&
    pick.score_home !== null &&
    pick.score_home !== undefined &&
    pick.score_away !== null &&
    pick.score_away !== undefined &&
    pick.score_home === result.score_home &&
    pick.score_away === result.score_away
  ) {
    points += 3;
    details.push({ label: "Exact score", points: 3, correct: true });
  }

  // First goalscorer
  if (pick.first_scorer && result.first_scorer && pick.first_scorer === result.first_scorer) {
    points += 5;
    details.push({ label: `First scorer: ${pick.first_scorer}`, points: 5, correct: true });
  }

  return { points, details };
}

// ── Tournament scoring ────────────────────────────────────────

const TOURNAMENT_POINTS: Record<keyof TournamentPicks, number> = {
  world_cup_winner: 10,
  golden_boot: 5,
  golden_ball: 5,
  golden_glove: 3,
  best_young_player: 3,
  dark_horse: 5,
  first_eliminated: 3,
  england_exit_round: 3,
};

const TOURNAMENT_LABELS: Record<keyof TournamentPicks, string> = {
  world_cup_winner: "World Cup winner",
  golden_boot: "Golden Boot",
  golden_ball: "Golden Ball",
  golden_glove: "Golden Glove",
  best_young_player: "Best Young Player",
  dark_horse: "Dark horse semifinalist",
  first_eliminated: "First big name out",
  england_exit_round: "England exit round",
};

export function scoreTournamentPicks(picks: Partial<TournamentPicks>): { points: number; details: ScoreDetail[] } {
  if (!TOURNAMENT_RESULT.tournament_final) return { points: 0, details: [] };

  const details: ScoreDetail[] = [];
  let points = 0;

  (Object.keys(TOURNAMENT_POINTS) as (keyof TournamentPicks)[]).forEach((key) => {
    const picked = picks[key];
    const actual = TOURNAMENT_RESULT[key];
    if (!picked || !actual) return;
    const correct = picked === actual;
    const pts = correct ? TOURNAMENT_POINTS[key] : 0;
    points += pts;
    details.push({ label: TOURNAMENT_LABELS[key], points: pts, correct });
  });

  return { points, details };
}

// ── Full score for a predictor ────────────────────────────────

export function calculateScore(
  tournamentPicks: Partial<TournamentPicks> | null,
  matchPicks: MatchPick[]
): ScoreBreakdown {
  const matchPointsMap: Record<string, number> = {};
  const allDetails: ScoreDetail[] = [];
  let matchTotal = 0;

  matchPicks.forEach((pick) => {
    const { points, details } = scoreMatchPick(pick);
    matchPointsMap[pick.match_id] = points;
    matchTotal += points;
    allDetails.push(...details.map((d) => ({ ...d, label: `[${pick.match_id}] ${d.label}` })));
  });

  const { points: tournamentTotal, details: tournamentDetails } = tournamentPicks
    ? scoreTournamentPicks(tournamentPicks)
    : { points: 0, details: [] };

  return {
    total: matchTotal + tournamentTotal,
    matchPoints: matchPointsMap,
    tournamentPoints: tournamentTotal,
    details: [...allDetails, ...tournamentDetails],
  };
}

// ── Helper: has any result been entered yet? ──────────────────
export function hasAnyResult(): boolean {
  return Object.values(MATCH_RESULTS).some((r) => r.final);
}
