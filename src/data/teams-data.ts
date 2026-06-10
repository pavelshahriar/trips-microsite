// ─────────────────────────────────────────────────────────────────────────────
// All 48 FIFA World Cup 2026 teams
// fdoName = name as returned by football-data.org API (for matching)
// kitSlug = team slug used by footballkitarchive.com
// kitId   = kit page ID on footballkitarchive.com
// ─────────────────────────────────────────────────────────────────────────────

export interface WCTeam {
  slug: string;            // URL slug for /teams/[slug]
  displayName: string;     // human-readable name
  fdoName: string;         // football-data.org API name (primary match key)
  fdoAliases: string[];    // alternative names the API might use
  flag: string;            // emoji flag
  confederation: string;   // "UEFA" | "CONMEBOL" | "CONCACAF" | "CAF" | "AFC" | "OFC"
  colors: {
    primary: string;       // primary kit color (hex)
    secondary: string;     // secondary kit color (hex)
  };
  kitSlug: string;         // slug used on footballkitarchive.com
  kitId: number;           // numeric kit page ID on footballkitarchive.com
}

export const WC_TEAMS: WCTeam[] = [
  // ── Africa (CAF) ────────────────────────────────────────────────────────────
  {
    slug: "algeria",
    displayName: "Algeria",
    fdoName: "Algeria",
    fdoAliases: [],
    flag: "🇩🇿",
    confederation: "CAF",
    colors: { primary: "#006233", secondary: "#FFFFFF" },
    kitSlug: "algeria",
    kitId: 422915,
  },
  {
    slug: "cape-verde",
    displayName: "Cape Verde",
    fdoName: "Cape Verde",
    fdoAliases: ["Cabo Verde"],
    flag: "🇨🇻",
    confederation: "CAF",
    colors: { primary: "#003893", secondary: "#CF0921" },
    kitSlug: "cape-verde",
    kitId: 474511,
  },
  {
    slug: "dr-congo",
    displayName: "DR Congo",
    fdoName: "DR Congo",
    fdoAliases: ["Congo DR", "Democratic Republic Congo", "Democratic Republic of Congo"],
    flag: "🇨🇩",
    confederation: "CAF",
    colors: { primary: "#007FFF", secondary: "#F7D618" },
    kitSlug: "dr-congo",
    kitId: 438164,
  },
  {
    slug: "egypt",
    displayName: "Egypt",
    fdoName: "Egypt",
    fdoAliases: [],
    flag: "🇪🇬",
    confederation: "CAF",
    colors: { primary: "#C8102E", secondary: "#FFFFFF" },
    kitSlug: "egypt",
    kitId: 465452,
  },
  {
    slug: "ghana",
    displayName: "Ghana",
    fdoName: "Ghana",
    fdoAliases: [],
    flag: "🇬🇭",
    confederation: "CAF",
    colors: { primary: "#FFFFFF", secondary: "#FFD700" },
    kitSlug: "ghana",
    kitId: 441220,
  },
  {
    slug: "ivory-coast",
    displayName: "Ivory Coast",
    fdoName: "Côte d'Ivoire",
    fdoAliases: ["Ivory Coast", "Cote d'Ivoire"],
    flag: "🇨🇮",
    confederation: "CAF",
    colors: { primary: "#F77F00", secondary: "#009A44" },
    kitSlug: "ivory-coast",
    kitId: 465453,
  },
  {
    slug: "morocco",
    displayName: "Morocco",
    fdoName: "Morocco",
    fdoAliases: [],
    flag: "🇲🇦",
    confederation: "CAF",
    colors: { primary: "#C1272D", secondary: "#006233" },
    kitSlug: "morocco",
    kitId: 441671,
  },
  {
    slug: "senegal",
    displayName: "Senegal",
    fdoName: "Senegal",
    fdoAliases: [],
    flag: "🇸🇳",
    confederation: "CAF",
    colors: { primary: "#009A44", secondary: "#FFFFFF" },
    kitSlug: "senegal",
    kitId: 419614,
  },
  {
    slug: "south-africa",
    displayName: "South Africa",
    fdoName: "South Africa",
    fdoAliases: [],
    flag: "🇿🇦",
    confederation: "CAF",
    colors: { primary: "#007A4D", secondary: "#FFB81C" },
    kitSlug: "south-africa",
    kitId: 461917,
  },
  {
    slug: "tunisia",
    displayName: "Tunisia",
    fdoName: "Tunisia",
    fdoAliases: [],
    flag: "🇹🇳",
    confederation: "CAF",
    colors: { primary: "#E70013", secondary: "#FFFFFF" },
    kitSlug: "tunisia",
    kitId: 485834,
  },

  // ── Asia / Middle East (AFC) ────────────────────────────────────────────────
  {
    slug: "australia",
    displayName: "Australia",
    fdoName: "Australia",
    fdoAliases: [],
    flag: "🇦🇺",
    confederation: "AFC",
    colors: { primary: "#FFCD00", secondary: "#00843D" },
    kitSlug: "australia",
    kitId: 443769,
  },
  {
    slug: "iran",
    displayName: "Iran",
    fdoName: "Iran",
    fdoAliases: ["IR Iran"],
    flag: "🇮🇷",
    confederation: "AFC",
    colors: { primary: "#239F40", secondary: "#FFFFFF" },
    kitSlug: "iran",
    kitId: 482883,
  },
  {
    slug: "iraq",
    displayName: "Iraq",
    fdoName: "Iraq",
    fdoAliases: [],
    flag: "🇮🇶",
    confederation: "AFC",
    colors: { primary: "#007A3D", secondary: "#CE1126" },
    kitSlug: "iraq",
    kitId: 484724,
  },
  {
    slug: "japan",
    displayName: "Japan",
    fdoName: "Japan",
    fdoAliases: [],
    flag: "🇯🇵",
    confederation: "AFC",
    colors: { primary: "#003087", secondary: "#FFFFFF" },
    kitSlug: "japan",
    kitId: 407383,
  },
  {
    slug: "jordan",
    displayName: "Jordan",
    fdoName: "Jordan",
    fdoAliases: [],
    flag: "🇯🇴",
    confederation: "AFC",
    colors: { primary: "#007A3D", secondary: "#CE1126" },
    kitSlug: "jordan",
    kitId: 483806,
  },
  {
    slug: "qatar",
    displayName: "Qatar",
    fdoName: "Qatar",
    fdoAliases: [],
    flag: "🇶🇦",
    confederation: "AFC",
    colors: { primary: "#8D1B3D", secondary: "#FFFFFF" },
    kitSlug: "qatar",
    kitId: 423325,
  },
  {
    slug: "saudi-arabia",
    displayName: "Saudi Arabia",
    fdoName: "Saudi Arabia",
    fdoAliases: [],
    flag: "🇸🇦",
    confederation: "AFC",
    colors: { primary: "#006C35", secondary: "#FFFFFF" },
    kitSlug: "saudi-arabia",
    kitId: 424839,
  },
  {
    slug: "south-korea",
    displayName: "South Korea",
    fdoName: "Korea Republic",
    fdoAliases: ["South Korea", "Republic of Korea"],
    flag: "🇰🇷",
    confederation: "AFC",
    colors: { primary: "#CD2E3A", secondary: "#003478" },
    kitSlug: "south-korea",
    kitId: 443383,
  },
  {
    slug: "uzbekistan",
    displayName: "Uzbekistan",
    fdoName: "Uzbekistan",
    fdoAliases: [],
    flag: "🇺🇿",
    confederation: "AFC",
    colors: { primary: "#1EB53A", secondary: "#FFFFFF" },
    kitSlug: "uzbekistan",
    kitId: 485364,
  },

  // ── CONCACAF ─────────────────────────────────────────────────────────────────
  {
    slug: "canada",
    displayName: "Canada",
    fdoName: "Canada",
    fdoAliases: [],
    flag: "🇨🇦",
    confederation: "CONCACAF",
    colors: { primary: "#FF0000", secondary: "#FFFFFF" },
    kitSlug: "canada",
    kitId: 425416,
  },
  {
    slug: "curacao",
    displayName: "Curaçao",
    fdoName: "Curaçao",
    fdoAliases: ["Curacao"],
    flag: "🇨🇼",
    confederation: "CONCACAF",
    colors: { primary: "#003DA5", secondary: "#F9E300" },
    kitSlug: "curacao",
    kitId: 478485,
  },
  {
    slug: "haiti",
    displayName: "Haiti",
    fdoName: "Haiti",
    fdoAliases: [],
    flag: "🇭🇹",
    confederation: "CONCACAF",
    colors: { primary: "#00209F", secondary: "#D21034" },
    kitSlug: "haiti",
    kitId: 469693,
  },
  {
    slug: "mexico",
    displayName: "Mexico",
    fdoName: "Mexico",
    fdoAliases: [],
    flag: "🇲🇽",
    confederation: "CONCACAF",
    colors: { primary: "#006847", secondary: "#FFFFFF" },
    kitSlug: "mexico",
    kitId: 399841,
  },
  {
    slug: "panama",
    displayName: "Panama",
    fdoName: "Panama",
    fdoAliases: [],
    flag: "🇵🇦",
    confederation: "CONCACAF",
    colors: { primary: "#DA121A", secondary: "#003893" },
    kitSlug: "panama",
    kitId: 474801,
  },
  {
    slug: "usa",
    displayName: "USA",
    fdoName: "United States",
    fdoAliases: ["USA", "US", "United States of America"],
    flag: "🇺🇸",
    confederation: "CONCACAF",
    colors: { primary: "#002868", secondary: "#BF0A30" },
    kitSlug: "usa",
    kitId: 442990,
  },

  // ── South America (CONMEBOL) ─────────────────────────────────────────────────
  {
    slug: "argentina",
    displayName: "Argentina",
    fdoName: "Argentina",
    fdoAliases: [],
    flag: "🇦🇷",
    confederation: "CONMEBOL",
    colors: { primary: "#74ACDF", secondary: "#FFFFFF" },
    kitSlug: "argentina",
    kitId: 385111,
  },
  {
    slug: "brazil",
    displayName: "Brazil",
    fdoName: "Brazil",
    fdoAliases: [],
    flag: "🇧🇷",
    confederation: "CONMEBOL",
    colors: { primary: "#009C3B", secondary: "#FFDF00" },
    kitSlug: "brazil",
    kitId: 430690,
  },
  {
    slug: "colombia",
    displayName: "Colombia",
    fdoName: "Colombia",
    fdoAliases: [],
    flag: "🇨🇴",
    confederation: "CONMEBOL",
    colors: { primary: "#FCD116", secondary: "#003087" },
    kitSlug: "colombia",
    kitId: 406309,
  },
  {
    slug: "ecuador",
    displayName: "Ecuador",
    fdoName: "Ecuador",
    fdoAliases: [],
    flag: "🇪🇨",
    confederation: "CONMEBOL",
    colors: { primary: "#FFD100", secondary: "#003087" },
    kitSlug: "ecuador",
    kitId: 459605,
  },
  {
    slug: "paraguay",
    displayName: "Paraguay",
    fdoName: "Paraguay",
    fdoAliases: [],
    flag: "🇵🇾",
    confederation: "CONMEBOL",
    colors: { primary: "#D52B1E", secondary: "#FFFFFF" },
    kitSlug: "paraguay",
    kitId: 466862,
  },
  {
    slug: "uruguay",
    displayName: "Uruguay",
    fdoName: "Uruguay",
    fdoAliases: [],
    flag: "🇺🇾",
    confederation: "CONMEBOL",
    colors: { primary: "#5EB6E4", secondary: "#FFFFFF" },
    kitSlug: "uruguay",
    kitId: 382851,
  },

  // ── Europe (UEFA) ─────────────────────────────────────────────────────────────
  {
    slug: "austria",
    displayName: "Austria",
    fdoName: "Austria",
    fdoAliases: [],
    flag: "🇦🇹",
    confederation: "UEFA",
    colors: { primary: "#ED2939", secondary: "#FFFFFF" },
    kitSlug: "austria",
    kitId: 430860,
  },
  {
    slug: "belgium",
    displayName: "Belgium",
    fdoName: "Belgium",
    fdoAliases: [],
    flag: "🇧🇪",
    confederation: "UEFA",
    colors: { primary: "#ED2939", secondary: "#000000" },
    kitSlug: "belgium",
    kitId: 403585,
  },
  {
    slug: "bosnia",
    displayName: "Bosnia & Herzegovina",
    fdoName: "Bosnia-Herzegovina",
    fdoAliases: ["Bosnia and Herzegovina", "Bosnia", "Bosnia & Herzegovina"],
    flag: "🇧🇦",
    confederation: "UEFA",
    colors: { primary: "#002395", secondary: "#FFCE00" },
    kitSlug: "bosnia",
    kitId: 482729,
  },
  {
    slug: "croatia",
    displayName: "Croatia",
    fdoName: "Croatia",
    fdoAliases: [],
    flag: "🇭🇷",
    confederation: "UEFA",
    colors: { primary: "#FF0000", secondary: "#FFFFFF" },
    kitSlug: "croatia",
    kitId: 378903,
  },
  {
    slug: "czech-republic",
    displayName: "Czech Republic",
    fdoName: "Czechia",
    fdoAliases: ["Czech Republic", "Czech Rep."],
    flag: "🇨🇿",
    confederation: "UEFA",
    colors: { primary: "#D7141A", secondary: "#003087" },
    kitSlug: "czech-republic",
    kitId: 431415,
  },
  {
    slug: "england",
    displayName: "England",
    fdoName: "England",
    fdoAliases: [],
    flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    confederation: "UEFA",
    colors: { primary: "#FFFFFF", secondary: "#CF081F" },
    kitSlug: "england",
    kitId: 412024,
  },
  {
    slug: "france",
    displayName: "France",
    fdoName: "France",
    fdoAliases: [],
    flag: "🇫🇷",
    confederation: "UEFA",
    colors: { primary: "#003189", secondary: "#FFFFFF" },
    kitSlug: "france",
    kitId: 417399,
  },
  {
    slug: "germany",
    displayName: "Germany",
    fdoName: "Germany",
    fdoAliases: [],
    flag: "🇩🇪",
    confederation: "UEFA",
    colors: { primary: "#FFCE00", secondary: "#000000" },
    kitSlug: "germany",
    kitId: 395137,
  },
  {
    slug: "netherlands",
    displayName: "Netherlands",
    fdoName: "Netherlands",
    fdoAliases: ["Holland"],
    flag: "🇳🇱",
    confederation: "UEFA",
    colors: { primary: "#FF6600", secondary: "#003DA5" },
    kitSlug: "netherlands",
    kitId: 441585,
  },
  {
    slug: "norway",
    displayName: "Norway",
    fdoName: "Norway",
    fdoAliases: [],
    flag: "🇳🇴",
    confederation: "UEFA",
    colors: { primary: "#EF2B2D", secondary: "#FFFFFF" },
    kitSlug: "norway",
    kitId: 442771,
  },
  {
    slug: "portugal",
    displayName: "Portugal",
    fdoName: "Portugal",
    fdoAliases: [],
    flag: "🇵🇹",
    confederation: "UEFA",
    colors: { primary: "#006600", secondary: "#C8102E" },
    kitSlug: "portugal",
    kitId: 402690,
  },
  {
    slug: "scotland",
    displayName: "Scotland",
    fdoName: "Scotland",
    fdoAliases: [],
    flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
    confederation: "UEFA",
    colors: { primary: "#003380", secondary: "#FFFFFF" },
    kitSlug: "scotland",
    kitId: 425408,
  },
  {
    slug: "spain",
    displayName: "Spain",
    fdoName: "Spain",
    fdoAliases: [],
    flag: "🇪🇸",
    confederation: "UEFA",
    colors: { primary: "#C60B1E", secondary: "#FFC400" },
    kitSlug: "spain",
    kitId: 412023,
  },
  {
    slug: "sweden",
    displayName: "Sweden",
    fdoName: "Sweden",
    fdoAliases: [],
    flag: "🇸🇪",
    confederation: "UEFA",
    colors: { primary: "#006AA7", secondary: "#FECC02" },
    kitSlug: "sweden",
    kitId: 424843,
  },
  {
    slug: "switzerland",
    displayName: "Switzerland",
    fdoName: "Switzerland",
    fdoAliases: [],
    flag: "🇨🇭",
    confederation: "UEFA",
    colors: { primary: "#FF0000", secondary: "#FFFFFF" },
    kitSlug: "switzerland",
    kitId: 415626,
  },
  {
    slug: "turkey",
    displayName: "Türkiye",
    fdoName: "Türkiye",
    fdoAliases: ["Turkey"],
    flag: "🇹🇷",
    confederation: "UEFA",
    colors: { primary: "#E30A17", secondary: "#FFFFFF" },
    kitSlug: "turkey",
    kitId: 378883,
  },

  // ── Oceania (OFC) ────────────────────────────────────────────────────────────
  {
    slug: "new-zealand",
    displayName: "New Zealand",
    fdoName: "New Zealand",
    fdoAliases: [],
    flag: "🇳🇿",
    confederation: "OFC",
    colors: { primary: "#000000", secondary: "#FFFFFF" },
    kitSlug: "new-zealand",
    kitId: 418413,
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Get a team by slug. */
export function getTeamBySlug(slug: string): WCTeam | null {
  return WC_TEAMS.find((t) => t.slug === slug) ?? null;
}

/**
 * Match a football-data.org API team name to a WCTeam.
 * Tries exact match on fdoName first, then aliases, then fuzzy includes.
 */
export function getTeamByFdoName(name: string): WCTeam | null {
  const lower = name.toLowerCase();
  // Exact fdoName match
  let match = WC_TEAMS.find((t) => t.fdoName.toLowerCase() === lower);
  if (match) return match;
  // Alias match
  match = WC_TEAMS.find((t) =>
    t.fdoAliases.some((a) => a.toLowerCase() === lower)
  );
  if (match) return match;
  // Fuzzy: one contains the other
  match = WC_TEAMS.find(
    (t) =>
      lower.includes(t.fdoName.toLowerCase()) ||
      t.fdoName.toLowerCase().includes(lower) ||
      t.fdoAliases.some(
        (a) => lower.includes(a.toLowerCase()) || a.toLowerCase().includes(lower)
      )
  );
  return match ?? null;
}

/** Get the full kit archive URL for a team (home kit page). */
export function getKitArchiveUrl(team: WCTeam): string {
  return `https://www.footballkitarchive.com/${team.kitSlug}-2026-home-kit-${team.kitId}/`;
}

/** Return all teams sorted by confederation then name. */
export function getTeamsByConfederation(): Record<string, WCTeam[]> {
  const confOrder = ["UEFA", "CONMEBOL", "CONCACAF", "CAF", "AFC", "OFC"];
  const result: Record<string, WCTeam[]> = {};
  for (const conf of confOrder) {
    result[conf] = WC_TEAMS.filter((t) => t.confederation === conf).sort((a, b) =>
      a.displayName.localeCompare(b.displayName)
    );
  }
  return result;
}
