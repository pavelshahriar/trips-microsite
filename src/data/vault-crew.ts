// ─────────────────────────────────────────────────────────────────────────────
// Trip Vault — Crew configuration
// Each entry maps a crew member's email to their vault profile.
// ─────────────────────────────────────────────────────────────────────────────

export type SupportedTeam = "Brazil" | "Germany" | "Argentina";

export interface VaultCrewMember {
  name: string;
  nickname: string;
  nicknameReason: string; // shown after the nickname reveal
  city: string;
  team: SupportedTeam;
  teamEmoji: string;
  teamFunFact: string;
  teamInspo: string; // short inspirational line about their team
  welcomeMessage: string; // funny, personal first-line greeting
  gift: string; // what gift they're getting / need to confirm
}

// ── Team data ─────────────────────────────────────────────────────────────────
export const TEAM_DATA: Record<SupportedTeam, { flag: string; color: string }> = {
  Brazil: { flag: "🇧🇷", color: "#009C3B" },
  Germany: { flag: "🇩🇪", color: "#FFCE00" },
  Argentina: { flag: "🇦🇷", color: "#74ACDF" },
};

// ── Crew members keyed by email ───────────────────────────────────────────────
export const VAULT_CREW: Record<string, VaultCrewMember> = {
  "shahriar.tanvir@gmail.com": {
    name: "Pavel",
    nickname: "The Gaffer",
    nicknameReason:
      "Organized the whole bloody trip, wrangled six idiots across four time zones, and somehow still wants to go. Legend.",
    city: "Atlanta",
    team: "Brazil",
    teamEmoji: "🇧🇷",
    teamFunFact:
      "Brazil is the only nation to appear at every single FIFA World Cup since 1930. Five titles. Pelé. Ronaldo. Cafu. They don't just play football — they invented a religion.",
    teamInspo: "Joga bonito. The beautiful game starts with you.",
    welcomeMessage:
      "Well, well, well… The man who made this whole thing happen finally shows up. 👀",
    gift: "your captain's armband — you earned it, mate. Confirm you got the crew's welcome pack.",
  },

  "tanzirmannan@gmail.com": {
    name: "Rupan",
    nickname: "The Londoner",
    nicknameReason:
      "Flew the furthest just to watch Germany. That's not fandom, that's a personality disorder. We respect it.",
    city: "London",
    team: "Germany",
    teamEmoji: "🇩🇪",
    teamFunFact:
      "Germany have won the World Cup 4 times ('54, '74, '90, '14). Die Mannschaft don't do luck — they do structure, precision, and quietly efficient football. Like a really good car.",
    teamInspo: "Nein means nein — to giving up.",
    welcomeMessage:
      "Oi oi! All the way from London. Did you pack an umbrella? We know you did.",
    gift:
      "your welcome pack from the crew — check your bag, it should be in there.",
  },

  "tmullick25@gmail.com": {
    name: "Topu",
    nickname: "The Messiah",
    nicknameReason:
      "Because every Argentina fan thinks Messi chose them personally. And honestly? We think you might be right.",
    city: "Chicago",
    team: "Argentina",
    teamEmoji: "🇦🇷",
    teamFunFact:
      "Argentina finally got their third World Cup in Qatar 2022. Messi's last dance. 36 years of hurt washed away in one perfect tournament. We were all crying and we're not even Argentina fans.",
    teamInspo: "Si se puede. If anyone can, la Albiceleste can.",
    welcomeMessage: "Chicago in the building! Bro, you made it. We were worried. 😅",
    gift:
      "your welcome pack — a little something from the boys to get you in the mood.",
  },

  "md_riasat@yahoo.com.au": {
    name: "Rocky",
    nickname: "The Kangaroo",
    nicknameReason:
      "Sydney to the Americas. Hopped across the Pacific like it was nothing. Absolute unit.",
    city: "Sydney",
    team: "Argentina",
    teamEmoji: "🇦🇷",
    teamFunFact:
      "Did you know Australia's farthest World Cup run was 2006 — the same year they knocked out Croatia? Rocky probably watched that in a pub and said 'yeah but Argentina tho.'",
    teamInspo: "No worries, mate. Messi's got this.",
    welcomeMessage:
      "G'day mate! Longest trip of the crew, shortest sleep, first one at the bar. Classic rocky.",
    gift:
      "your welcome pack — the one with the Vegemite survival kit. You're welcome.",
  },

  "shah.imran.md@gmail.com": {
    name: "Imran",
    nickname: "The Pioneer",
    nicknameReason:
      "Dhaka to the Americas for a World Cup. That's not a trip, that's a statement. History-maker, right here.",
    city: "Dhaka",
    team: "Brazil",
    teamEmoji: "🇧🇷",
    teamFunFact:
      "Brazil's 1970 squad, featuring Pelé, is widely considered the greatest football team ever assembled. imran probably has a poster.",
    teamInspo: "From Dhaka with love. And samba.",
    welcomeMessage:
      "imran! Brother! You actually made it. We had a small bet going. Shah owes rupan five dollars.",
    gift:
      "your welcome pack — yellow and green, obviously.",
  },

  "abbas.viscaria@gmail.com": {
    name: "Abbas",
    nickname: "Maple Messi",
    nicknameReason:
      "An Argentina fan living in Winnipeg. The dedication. The cold resistance. The delusion. We love every bit of it.",
    city: "Winnipeg",
    team: "Argentina",
    teamEmoji: "🇦🇷",
    teamFunFact:
      "Argentina beat France in one of the greatest World Cup finals ever in 2022. On penalties. After being 2-0 up, then 2-2, then 3-3. Abbas aged 10 years in 30 minutes.",
    teamInspo: "Cold outside. 🔥 inside. Vamos Argentina.",
    welcomeMessage:
      "abbas from the Peg! Put the parka away, brother — it's 35°C in Houston.",
    gift:
      "your welcome pack from the crew — light blue and white, just how you like it.",
  },

  "mafruhkazi213@gmail.com": {
    name: "Jitu",
    nickname: "El Showstopper",
    nicknameReason:
      "Rolls in late, leaves early, and somehow still makes the biggest entrance in the room. A banker who understands risk and return — except when it comes to punctuality. Short duration, high yield.",
    city: "Miami",
    team: "Argentina",
    teamEmoji: "🇦🇷",
    teamFunFact:
      "Argentina beat France in the 2022 final in one of the most dramatic finishes in World Cup history. jitu delivered his match verdict like breaking news. We were all howling.",
    teamInspo: "Late to the party, first on the dance floor. Vamos!",
    welcomeMessage:
      "jitu! The showstopper arrives. We were starting the opening ceremony without you. 😂",
    gift:
      "your welcome pack from the crew — arrive fashionably late, leave with everything.",
  },
};

// ── Helper: look up crew member by email ──────────────────────────────────────
export function getCrewMemberByEmail(email: string): VaultCrewMember | null {
  const normalized = email.toLowerCase().trim();
  return VAULT_CREW[normalized] ?? null;
}

// ── Default for unknown emails (shouldn't happen after allowlist check) ───────
export const UNKNOWN_CREW: VaultCrewMember = {
  name: "Mystery Guest",
  nickname: "The Stranger",
  nicknameReason: "We literally don't know who you are. How did you get in here?",
  city: "Parts Unknown",
  team: "Brazil",
  teamEmoji: "⚽",
  teamFunFact: "Football is round. The goals are square. Life is chaos.",
  teamInspo: "Keep going.",
  welcomeMessage: "Erm… hi? You're not on the list. But here you are. Welcome, I guess.",
  gift: "a mystery gift — because neither do we.",
};
