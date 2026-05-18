export type ThemeId = "default" | "brazil" | "germany" | "argentina";

export interface Theme {
  id: ThemeId;
  name: string;
  emoji: string;
  tagline: string;
}

export const THEMES: Theme[] = [
  {
    id: "default",
    name: "Uncle Sam",
    emoji: "🇺🇸",
    tagline: "Host Nation — USA",
  },
  {
    id: "brazil",
    name: "Samba",
    emoji: "🇧🇷",
    tagline: "Vai Brasil",
  },
  {
    id: "germany",
    name: "Das Boot",
    emoji: "🇩🇪",
    tagline: "Die Mannschaft",
  },
  {
    id: "argentina",
    name: "El Tango",
    emoji: "🇦🇷",
    tagline: "La Albiceleste",
  },
];

export const DEFAULT_THEME: ThemeId = "default";
