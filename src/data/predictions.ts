// WC26 Predictions — questions, options, and match definitions

export interface PredictionOption {
  value: string;
  label: string;
  flag?: string;
}

export interface TournamentQuestion {
  id: keyof TournamentPicks;
  question: string;
  emoji: string;
  options: PredictionOption[];
}

export interface TournamentPicks {
  world_cup_winner: string;
  golden_boot: string;
  golden_ball: string;
  golden_glove: string;
  best_young_player: string;
  dark_horse: string;
  first_eliminated: string;
  england_exit_round: string;
}

export interface MatchDefinition {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeFlag: string;
  awayFlag: string;
  venue: string;
  city: string;
  date: string;           // display date
  kickoff: string;        // ISO string — predictions lock at this time
  crewMatch: boolean;     // one of the 3 matches the boys attend
  scorers: string[];      // likely scorers for first goalscorer pick
}

export interface MatchPick {
  match_id: string;
  winner: string;         // homeTeam name | awayTeam name | "draw"
  score_home: number | null;
  score_away: number | null;
  first_scorer: string;
  var_controversy: boolean;
}

// ── Tournament Questions ────────────────────────────────────

export const TOURNAMENT_QUESTIONS: TournamentQuestion[] = [
  {
    id: "world_cup_winner",
    question: "Who lifts the trophy on July 19?",
    emoji: "🏆",
    options: [
      { value: "Brazil", label: "Brazil", flag: "🇧🇷" },
      { value: "France", label: "France", flag: "🇫🇷" },
      { value: "Argentina", label: "Argentina", flag: "🇦🇷" },
      { value: "England", label: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
      { value: "Spain", label: "Spain", flag: "🇪🇸" },
      { value: "Germany", label: "Germany", flag: "🇩🇪" },
      { value: "Portugal", label: "Portugal", flag: "🇵🇹" },
      { value: "Other", label: "Other / Dark horse", flag: "🌍" },
    ],
  },
  {
    id: "golden_boot",
    question: "Golden Boot — top scorer of the tournament?",
    emoji: "👟",
    options: [
      { value: "Kylian Mbappé", label: "Kylian Mbappé", flag: "🇫🇷" },
      { value: "Vinicius Jr", label: "Vinicius Jr", flag: "🇧🇷" },
      { value: "Harry Kane", label: "Harry Kane", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
      { value: "Lamine Yamal", label: "Lamine Yamal", flag: "🇪🇸" },
      { value: "Jude Bellingham", label: "Jude Bellingham", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
      { value: "Lionel Messi", label: "Lionel Messi", flag: "🇦🇷" },
      { value: "Erling Haaland", label: "Erling Haaland", flag: "🇳🇴" },
      { value: "Other", label: "Someone else entirely", flag: "⚡" },
    ],
  },
  {
    id: "golden_ball",
    question: "Golden Ball — best player of the tournament?",
    emoji: "🥇",
    options: [
      { value: "Kylian Mbappé", label: "Kylian Mbappé", flag: "🇫🇷" },
      { value: "Vinicius Jr", label: "Vinicius Jr", flag: "🇧🇷" },
      { value: "Jude Bellingham", label: "Jude Bellingham", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
      { value: "Lamine Yamal", label: "Lamine Yamal", flag: "🇪🇸" },
      { value: "Lionel Messi", label: "Lionel Messi", flag: "🇦🇷" },
      { value: "Pedri", label: "Pedri", flag: "🇪🇸" },
      { value: "Rodri", label: "Rodri", flag: "🇪🇸" },
      { value: "Other", label: "Someone else entirely", flag: "⚡" },
    ],
  },
  {
    id: "golden_glove",
    question: "Golden Glove (Yashin Trophy) — best goalkeeper?",
    emoji: "🧤",
    options: [
      { value: "Alisson Becker", label: "Alisson Becker", flag: "🇧🇷" },
      { value: "Thibaut Courtois", label: "Thibaut Courtois", flag: "🇧🇪" },
      { value: "Manuel Neuer", label: "Manuel Neuer", flag: "🇩🇪" },
      { value: "Gianluigi Donnarumma", label: "Donnarumma", flag: "🇮🇹" },
      { value: "Marc-André ter Stegen", label: "Ter Stegen", flag: "🇩🇪" },
      { value: "Jordan Pickford", label: "Jordan Pickford", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
      { value: "Other", label: "Someone else", flag: "🧱" },
    ],
  },
  {
    id: "best_young_player",
    question: "Best Young Player (under 21)?",
    emoji: "🌟",
    options: [
      { value: "Lamine Yamal", label: "Lamine Yamal", flag: "🇪🇸" },
      { value: "Gavi", label: "Gavi", flag: "🇪🇸" },
      { value: "Pedri", label: "Pedri", flag: "🇪🇸" },
      { value: "Warren Zaïre-Emery", label: "Zaïre-Emery", flag: "🇫🇷" },
      { value: "Florian Wirtz", label: "Florian Wirtz", flag: "🇩🇪" },
      { value: "Jamal Musiala", label: "Jamal Musiala", flag: "🇩🇪" },
      { value: "Other", label: "Someone else", flag: "💫" },
    ],
  },
  {
    id: "dark_horse",
    question: "Dark horse — surprise semifinalist no one expects?",
    emoji: "🐴",
    options: [
      { value: "USA", label: "USA (home crowd factor)", flag: "🇺🇸" },
      { value: "Morocco", label: "Morocco", flag: "🇲🇦" },
      { value: "Japan", label: "Japan", flag: "🇯🇵" },
      { value: "Netherlands", label: "Netherlands", flag: "🇳🇱" },
      { value: "Colombia", label: "Colombia", flag: "🇨🇴" },
      { value: "Mexico", label: "Mexico", flag: "🇲🇽" },
      { value: "Turkey", label: "Turkey", flag: "🇹🇷" },
      { value: "No surprises", label: "No surprises, chalk all the way", flag: "😴" },
    ],
  },
  {
    id: "first_eliminated",
    question: "Which big name crashes out earliest?",
    emoji: "💀",
    options: [
      { value: "Germany", label: "Germany (again?)", flag: "🇩🇪" },
      { value: "Argentina", label: "Argentina (defending champs)", flag: "🇦🇷" },
      { value: "Belgium", label: "Belgium (golden generation gone)", flag: "🇧🇪" },
      { value: "Italy", label: "Italy (classic chaos)", flag: "🇮🇹" },
      { value: "Uruguay", label: "Uruguay", flag: "🇺🇾" },
      { value: "Mexico", label: "Mexico (quintazo curse?)", flag: "🇲🇽" },
      { value: "Portugal", label: "Portugal (post-Ronaldo?)", flag: "🇵🇹" },
    ],
  },
  {
    id: "england_exit_round",
    question: "How far does England go? 👀",
    emoji: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    options: [
      { value: "Group Stage", label: "Group stage 💀" },
      { value: "Round of 32", label: "Round of 32" },
      { value: "Round of 16", label: "Round of 16" },
      { value: "Quarter-Final", label: "Quarter-final (classic)" },
      { value: "Semi-Final", label: "Semi-final (so close...)" },
      { value: "Final", label: "The final! (bold pick)" },
      { value: "Winners", label: "WINNERS 🏆 (absolutely not)" },
    ],
  },
];

// ── Matches ─────────────────────────────────────────────────
// Covering the 3 crew matches + semis + final

export const PREDICTION_MATCHES: MatchDefinition[] = [
  {
    id: "houston-germany",
    homeTeam: "Germany",
    awayTeam: "Curaçao",
    homeFlag: "🇩🇪",
    awayFlag: "🇨🇼",
    venue: "NRG Stadium",
    city: "Houston, TX",
    date: "June 14, 2026",
    kickoff: "2026-06-14T21:00:00-05:00",
    crewMatch: true,
    scorers: [
      "Kai Havertz", "Florian Wirtz", "Jamal Musiala", "Leroy Sané",
      "Thomas Müller", "Niclas Füllkrug", "Other",
    ],
  },
  {
    id: "kc-argentina",
    homeTeam: "Argentina",
    awayTeam: "Algeria",
    homeFlag: "🇦🇷",
    awayFlag: "🇩🇿",
    venue: "Arrowhead Stadium",
    city: "Kansas City, MO",
    date: "June 16, 2026",
    kickoff: "2026-06-16T21:00:00-05:00",
    crewMatch: true,
    scorers: [
      "Lionel Messi", "Julián Álvarez", "Lautaro Martínez", "Ángel Di María",
      "Paulo Dybala", "Rodrigo De Paul", "Riyad Mahrez", "Other",
    ],
  },
  {
    id: "philly-brazil",
    homeTeam: "Brazil",
    awayTeam: "Haiti",
    homeFlag: "🇧🇷",
    awayFlag: "🇭🇹",
    venue: "Lincoln Financial Field",
    city: "Philadelphia, PA",
    date: "June 19, 2026",
    kickoff: "2026-06-19T21:00:00-04:00",
    crewMatch: true,
    scorers: [
      "Vinicius Jr", "Rodrygo", "Raphinha",
      "Gabriel Martinelli", "Richarlison", "Endrick", "Other",
    ],
  },
  {
    id: "semi-final-1",
    homeTeam: "SF1 Team A",
    awayTeam: "SF1 Team B",
    homeFlag: "🏳️",
    awayFlag: "🏳️",
    venue: "MetLife Stadium",
    city: "New York/New Jersey",
    date: "July 14, 2026",
    kickoff: "2026-07-14T15:00:00-04:00",
    crewMatch: false,
    scorers: ["Other"],
  },
  {
    id: "semi-final-2",
    homeTeam: "SF2 Team A",
    awayTeam: "SF2 Team B",
    homeFlag: "🏳️",
    awayFlag: "🏳️",
    venue: "AT&T Stadium",
    city: "Dallas, TX",
    date: "July 15, 2026",
    kickoff: "2026-07-15T15:00:00-05:00",
    crewMatch: false,
    scorers: ["Other"],
  },
  {
    id: "final",
    homeTeam: "Final Team A",
    awayTeam: "Final Team B",
    homeFlag: "🏳️",
    awayFlag: "🏳️",
    venue: "MetLife Stadium",
    city: "New York/New Jersey",
    date: "July 19, 2026",
    kickoff: "2026-07-19T15:00:00-04:00",
    crewMatch: false,
    scorers: ["Other"],
  },
];

export const EMOJI_OPTIONS = [
  "⚽", "🏆", "🔥", "🇦🇷", "🇧🇷", "🇩🇪", "🇫🇷", "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  "🇪🇸", "🇵🇹", "🇺🇸", "🇨🇦", "🇲🇽", "😎", "🤙", "💪",
  "🦅", "🐉", "🦁", "🐆", "👑", "⚡", "🎯", "🧠",
];
