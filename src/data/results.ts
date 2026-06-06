// ============================================================
// WC26 Match & Tournament Results
// UPDATE THIS FILE after each match to trigger leaderboard scoring.
// Set `final: true` only when the result is confirmed.
// ============================================================

export interface MatchResult {
  winner: string;       // home team name | away team name | "draw"
  score_home: number;
  score_away: number;
  first_scorer: string; // must match exactly what predictors could pick
  var_controversy: boolean;
  final: boolean;       // false = match not played yet, score ignored
}

export interface TournamentResult {
  world_cup_winner: string | null;
  golden_boot: string | null;
  golden_ball: string | null;
  golden_glove: string | null;
  best_young_player: string | null;
  dark_horse: string | null;       // team that reached semis as a surprise
  first_eliminated: string | null; // big name knocked out earliest
  england_exit_round: string | null;
  tournament_final: boolean;       // true when tournament is fully over
}

// ── Match Results ────────────────────────────────────────────
// Update after each crew match. match_id must match predictions.ts IDs.

export const MATCH_RESULTS: Record<string, MatchResult> = {
  "houston-germany": {
    winner: "",
    score_home: 0,
    score_away: 0,
    first_scorer: "",
    var_controversy: false,
    final: false,
  },
  "kc-argentina": {
    winner: "",
    score_home: 0,
    score_away: 0,
    first_scorer: "",
    var_controversy: false,
    final: false,
  },
  "philly-brazil": {
    winner: "",
    score_home: 0,
    score_away: 0,
    first_scorer: "",
    var_controversy: false,
    final: false,
  },
  "semi-final-1": {
    winner: "",
    score_home: 0,
    score_away: 0,
    first_scorer: "",
    var_controversy: false,
    final: false,
  },
  "semi-final-2": {
    winner: "",
    score_home: 0,
    score_away: 0,
    first_scorer: "",
    var_controversy: false,
    final: false,
  },
  "final": {
    winner: "",
    score_home: 0,
    score_away: 0,
    first_scorer: "",
    var_controversy: false,
    final: false,
  },
};

// ── Tournament Results ───────────────────────────────────────
// Fill in gradually as the tournament progresses.
// Set tournament_final: true only after the final on July 19.

export const TOURNAMENT_RESULT: TournamentResult = {
  world_cup_winner: null,
  golden_boot: null,
  golden_ball: null,
  golden_glove: null,
  best_young_player: null,
  dark_horse: null,
  first_eliminated: null,
  england_exit_round: null,
  tournament_final: false,
};
