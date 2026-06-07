/**
 * football-data.org v4 API client
 * Free tier: 10 req/min — we use ISR (revalidate: 60) to stay well within limits.
 * API key: FOOTBALL_DATA_API_KEY env var (server-only, never sent to client)
 */

const BASE_URL = "https://api.football-data.org/v4";

// ── Types ────────────────────────────────────────────────────────

export type MatchStatus =
  | "SCHEDULED"
  | "TIMED"
  | "IN_PLAY"
  | "PAUSED"
  | "FINISHED"
  | "POSTPONED"
  | "CANCELLED"
  | "AWARDED"
  | "SUSPENDED";

export interface FDTeam {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
}

export interface FDScore {
  winner: "HOME_TEAM" | "AWAY_TEAM" | "DRAW" | null;
  duration: "REGULAR" | "EXTRA_TIME" | "PENALTY_SHOOTOUT";
  fullTime: { home: number | null; away: number | null };
  halfTime: { home: number | null; away: number | null };
  extraTime?: { home: number | null; away: number | null };
  penalties?: { home: number | null; away: number | null };
}

export interface FDMatch {
  id: number;
  utcDate: string;
  status: MatchStatus;
  matchday: number | null;
  stage: string;
  group: string | null;
  lastUpdated: string;
  homeTeam: FDTeam;
  awayTeam: FDTeam;
  score: FDScore;
  venue: string | null;
  referees: Array<{ id: number; name: string; type: string; nationality: string }>;
}

export interface FDStandingEntry {
  position: number;
  team: FDTeam;
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

export interface FDStandingGroup {
  stage: string;
  type: string;
  group: string | null;
  table: FDStandingEntry[];
}

// ── Country → Flag emoji ─────────────────────────────────────────

export const TEAM_FLAGS: Record<string, string> = {
  // Americas
  Brazil: "🇧🇷",
  Argentina: "🇦🇷",
  Mexico: "🇲🇽",
  "United States": "🇺🇸",
  USA: "🇺🇸",
  Canada: "🇨🇦",
  Colombia: "🇨🇴",
  Ecuador: "🇪🇨",
  Uruguay: "🇺🇾",
  Venezuela: "🇻🇪",
  Chile: "🇨🇱",
  Peru: "🇵🇪",
  Paraguay: "🇵🇾",
  Bolivia: "🇧🇴",
  Jamaica: "🇯🇲",
  "Costa Rica": "🇨🇷",
  Honduras: "🇭🇳",
  Panama: "🇵🇦",
  Haiti: "🇭🇹",
  "Curaçao": "🇨🇼",
  "Trinidad and Tobago": "🇹🇹",
  Guatemala: "🇬🇹",
  Cuba: "🇨🇺",

  // Europe
  Germany: "🇩🇪",
  France: "🇫🇷",
  Spain: "🇪🇸",
  England: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  Portugal: "🇵🇹",
  Netherlands: "🇳🇱",
  Belgium: "🇧🇪",
  Italy: "🇮🇹",
  Croatia: "🇭🇷",
  Denmark: "🇩🇰",
  Switzerland: "🇨🇭",
  Austria: "🇦🇹",
  Poland: "🇵🇱",
  Serbia: "🇷🇸",
  Czechia: "🇨🇿",
  "Czech Republic": "🇨🇿",
  Hungary: "🇭🇺",
  Romania: "🇷🇴",
  Ukraine: "🇺🇦",
  Scotland: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  Wales: "🏴󠁧󠁢󠁷󠁬󠁳󠁿",
  Norway: "🇳🇴",
  Sweden: "🇸🇪",
  Finland: "🇫🇮",
  Turkey: "🇹🇷",
  Greece: "🇬🇷",
  Slovakia: "🇸🇰",
  Slovenia: "🇸🇮",
  Albania: "🇦🇱",
  "North Macedonia": "🇲🇰",
  Georgia: "🇬🇪",
  Iceland: "🇮🇸",
  Bulgaria: "🇧🇬",
  Kosovo: "🇽🇰",
  Bosnia: "🇧🇦",
  "Bosnia and Herzegovina": "🇧🇦",
  Montenegro: "🇲🇪",

  // Africa
  Morocco: "🇲🇦",
  Senegal: "🇸🇳",
  Nigeria: "🇳🇬",
  Ghana: "🇬🇭",
  Cameroon: "🇨🇲",
  Egypt: "🇪🇬",
  Algeria: "🇩🇿",
  Tunisia: "🇹🇳",
  "Ivory Coast": "🇨🇮",
  "Côte d'Ivoire": "🇨🇮",
  "South Africa": "🇿🇦",
  Mali: "🇲🇱",
  "Burkina Faso": "🇧🇫",
  "DR Congo": "🇨🇩",
  "Democratic Republic Congo": "🇨🇩",
  Congo: "🇨🇬",
  Angola: "🇦🇴",
  Zimbabwe: "🇿🇼",
  "Cape Verde": "🇨🇻",
  Zambia: "🇿🇲",
  Comoros: "🇰🇲",
  Tanzania: "🇹🇿",
  Uganda: "🇺🇬",
  Kenya: "🇰🇪",
  Ethiopia: "🇪🇹",
  Libya: "🇱🇾",
  Sudan: "🇸🇩",
  Guinea: "🇬🇳",
  Mozambique: "🇲🇿",
  Namibia: "🇳🇦",
  Rwanda: "🇷🇼",
  Gabon: "🇬🇦",
  Benin: "🇧🇯",
  Mauritania: "🇲🇷",

  // Asia / Middle East
  Japan: "🇯🇵",
  "South Korea": "🇰🇷",
  "Saudi Arabia": "🇸🇦",
  Iran: "🇮🇷",
  Australia: "🇦🇺",
  "New Zealand": "🇳🇿",
  Qatar: "🇶🇦",
  UAE: "🇦🇪",
  Indonesia: "🇮🇩",
  "China PR": "🇨🇳",
  China: "🇨🇳",
  Thailand: "🇹🇭",
  Iraq: "🇮🇶",
  Uzbekistan: "🇺🇿",
  Jordan: "🇯🇴",
  Philippines: "🇵🇭",
  India: "🇮🇳",
  Oman: "🇴🇲",
  Bahrain: "🇧🇭",
  Kuwait: "🇰🇼",
  Vietnam: "🇻🇳",
  "Kyrgyz Republic": "🇰🇬",
  Tajikistan: "🇹🇯",
  Lebanon: "🇱🇧",
  Palestine: "🇵🇸",
  Syria: "🇸🇾",

  // Oceania
  "New Caledonia": "🇳🇨",
  Fiji: "🇫🇯",
  "Papua New Guinea": "🇵🇬",
  Tahiti: "🇵🇫",
  Vanuatu: "🇻🇺",
  "Solomon Islands": "🇸🇧",
};

export function getFlag(teamName: string): string {
  return TEAM_FLAGS[teamName] ?? "🏳️";
}

/** Stage label for display */
export function getStageName(stage: string, group: string | null): string {
  if (stage === "GROUP_STAGE" && group) {
    // "GROUP_A" → "Group A"
    return `Group ${group.replace("GROUP_", "")}`;
  }
  const stageMap: Record<string, string> = {
    GROUP_STAGE: "Group Stage",
    ROUND_OF_32: "Round of 32",
    LAST_32: "Round of 32",
    ROUND_OF_16: "Round of 16",
    LAST_16: "Round of 16",
    QUARTER_FINALS: "Quarter-Final",
    SEMI_FINALS: "Semi-Final",
    THIRD_PLACE: "3rd Place",
    FINAL: "Final",
  };
  return stageMap[stage] ?? stage;
}

// ── API helpers ──────────────────────────────────────────────────

async function fdFetch<T>(path: string, revalidateSeconds = 60): Promise<T | null> {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  if (!apiKey) {
    console.warn("[football-data] FOOTBALL_DATA_API_KEY not set");
    return null;
  }
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: { "X-Auth-Token": apiKey },
      next: { revalidate: revalidateSeconds },
    });
    if (!res.ok) {
      console.warn(`[football-data] ${path} → ${res.status} ${res.statusText}`);
      return null;
    }
    return res.json() as Promise<T>;
  } catch (err) {
    console.error("[football-data] fetch error:", err);
    return null;
  }
}

/** Fetch ALL WC26 matches (no date filter). Cached for 60s. */
export async function getAllWCMatches(): Promise<FDMatch[]> {
  const data = await fdFetch<{ matches: FDMatch[] }>("/competitions/WC/matches", 60);
  return data?.matches ?? [];
}

/** Fetch WC26 matches for a date range (YYYY-MM-DD). */
export async function getWCMatchesByDate(dateFrom: string, dateTo: string): Promise<FDMatch[]> {
  const data = await fdFetch<{ matches: FDMatch[] }>(
    `/competitions/WC/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`,
    60
  );
  return data?.matches ?? [];
}

/** Fetch WC26 group standings. */
export async function getWCStandings(): Promise<FDStandingGroup[]> {
  const data = await fdFetch<{ standings: FDStandingGroup[] }>("/competitions/WC/standings", 120);
  return data?.standings ?? [];
}

/** Fetch a single match by ID (for live score polling). */
export async function getMatch(matchId: number): Promise<FDMatch | null> {
  const data = await fdFetch<FDMatch>(`/matches/${matchId}`, 30);
  return data ?? null;
}

// ── H2H types & fetcher ──────────────────────────────────────────

export interface FDH2HTeamRecord {
  id: number;
  name: string;
  wins: number;
  draws: number;
  losses: number;
}

export interface FDH2HStats {
  numberOfMatches: number;
  totalGoals: number;
  homeTeam: FDH2HTeamRecord;
  awayTeam: FDH2HTeamRecord;
}

export interface FDH2HResponse {
  head2head: FDH2HStats;
  matches: FDMatch[];
}

/** Fetch H2H record + last 5 meetings for a given match ID. Cached for 1h. */
export async function getMatchH2H(matchId: number): Promise<FDH2HResponse | null> {
  return fdFetch<FDH2HResponse>(`/matches/${matchId}/head2head?limit=5`, 3600);
}

// ── Squad types & fetcher ────────────────────────────────────────

export interface FDSquadPlayer {
  id: number;
  name: string;
  position: string; // "Goalkeeper" | "Defence" | "Midfield" | "Offence"
  dateOfBirth: string;
  nationality: string;
  shirtNumber: number | null;
}

/** Fetch the full squad for a team. Cached 24h (squads rarely change). */
export async function getTeamSquad(teamId: number): Promise<FDSquadPlayer[]> {
  const data = await fdFetch<{ squad: FDSquadPlayer[] }>(`/teams/${teamId}`, 86400);
  return data?.squad ?? [];
}

// ── Utility helpers ──────────────────────────────────────────────

/** Group matches by UTC date string (YYYY-MM-DD). */
export function groupMatchesByDate(matches: FDMatch[]): Record<string, FDMatch[]> {
  const groups: Record<string, FDMatch[]> = {};
  for (const match of matches) {
    const date = match.utcDate.slice(0, 10); // "2026-06-14"
    if (!groups[date]) groups[date] = [];
    groups[date].push(match);
  }
  return groups;
}

/** True if match is currently live (or paused). */
export function isMatchLive(status: MatchStatus): boolean {
  return status === "IN_PLAY" || status === "PAUSED";
}

/** True if match has finished. */
export function isMatchFinished(status: MatchStatus): boolean {
  return status === "FINISHED" || status === "AWARDED";
}

/** True if picks are locked (match started or finished). */
export function isMatchLocked(status: MatchStatus): boolean {
  return isMatchLive(status) || isMatchFinished(status);
}

/** Format a UTC ISO date into local time string, e.g. "3:00 PM" */
export function formatKickoff(utcDate: string): string {
  return new Date(utcDate).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZoneName: "short",
  });
}

/** Format a UTC date for display, e.g. "Saturday, June 14" */
export function formatMatchDate(utcDate: string): string {
  return new Date(utcDate).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}
