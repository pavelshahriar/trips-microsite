/**
 * Daily "Question of the Day" bank for the Arena page
 *
 * Questions rotate by day — some are match-day specific,
 * some are tournament-wide fun, some are pure banter.
 * We assign them by tournament day index (day 0 = June 11, 2026).
 *
 * To add new questions: append to QUESTION_BANK with a new `id`.
 * To override a specific day: add to DAILY_SCHEDULE.
 */

export interface QuestionOption {
  id: string;
  label: string;
  emoji?: string;
}

export interface DailyQuestion {
  id: string;
  question: string;
  category: "banter" | "prediction" | "debate" | "viral" | "tactical";
  emoji: string;
  options: QuestionOption[];
}

// ── Pre-tournament (Days 0-3: June 11-14) ────────────────────────

export const PRETOURNAMENT_QUESTIONS: DailyQuestion[] = [
  {
    id: "pre-1",
    question: "Which team arrives at this World Cup most overrated?",
    category: "banter",
    emoji: "🤡",
    options: [
      { id: "germany", label: "Germany (still in rebuild mode)", emoji: "🇩🇪" },
      { id: "england", label: "England (perpetual hype machine)", emoji: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
      { id: "france", label: "France (locker room chaos)", emoji: "🇫🇷" },
      { id: "belgium", label: "Belgium (golden generation, silver medals)", emoji: "🇧🇪" },
      { id: "argentina", label: "Argentina (post-Messi peak?)", emoji: "🇦🇷" },
    ],
  },
  {
    id: "pre-2",
    question: "Who scores the very first goal of WC2026?",
    category: "prediction",
    emoji: "⚡",
    options: [
      { id: "messi", label: "Messi", emoji: "🇦🇷" },
      { id: "mbappe", label: "Mbappé", emoji: "🇫🇷" },
      { id: "vinicius", label: "Vinicius Jr", emoji: "🇧🇷" },
      { id: "kane", label: "Harry Kane", emoji: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
      { id: "unknown", label: "Someone you'd never predict", emoji: "💫" },
    ],
  },
  {
    id: "pre-3",
    question: "Best haircut at this World Cup — who's got the drip?",
    category: "viral",
    emoji: "💈",
    options: [
      { id: "mbappe", label: "Mbappé (always clean)", emoji: "🇫🇷" },
      { id: "bellingham", label: "Bellingham (bleached era)", emoji: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
      { id: "vinicius", label: "Vinicius (creative flair)", emoji: "🇧🇷" },
      { id: "neymar", label: "Neymar (if fit, always wild)", emoji: "🇧🇷" },
      { id: "yamal", label: "Lamine Yamal (Gen Z energy)", emoji: "🇪🇸" },
    ],
  },
  {
    id: "pre-4",
    question: "Which group stage game will be the most entertaining?",
    category: "prediction",
    emoji: "🔥",
    options: [
      { id: "ger-crew", label: "Germany's opener (June 14)", emoji: "🇩🇪" },
      { id: "arg-crew", label: "Argentina's opener (June 16)", emoji: "🇦🇷" },
      { id: "bra-crew", label: "Brazil's opener (June 19)", emoji: "🇧🇷" },
      { id: "usa-match", label: "USA's first home game", emoji: "🇺🇸" },
      { id: "france-match", label: "France vs Spain (if it happens)", emoji: "🇫🇷" },
    ],
  },
];

// ── The full question bank ────────────────────────────────────────

export const QUESTION_BANK: DailyQuestion[] = [
  // ── BANTER ──────────────────────────────────
  {
    id: "q-overreaction",
    question: "It's only Group Stage — pick the most overblown early take",
    category: "banter",
    emoji: "🗣️",
    options: [
      { id: "a", label: "\"[Team] are winning the World Cup\"", emoji: "🏆" },
      { id: "b", label: "\"[Big team] are DONE\"", emoji: "💀" },
      { id: "c", label: "\"VAR has ruined football\"", emoji: "😤" },
      { id: "d", label: "\"The host nation is going all the way\"", emoji: "🇺🇸" },
      { id: "e", label: "\"This is the worst World Cup ever\"", emoji: "🤦" },
    ],
  },
  {
    id: "q-manager",
    question: "Which manager looks most out of their depth so far?",
    category: "banter",
    emoji: "😰",
    options: [
      { id: "a", label: "The one screaming at the 4th official", emoji: "😡" },
      { id: "b", label: "The one doing nothing in the dugout", emoji: "🪑" },
      { id: "c", label: "The one with the clipboard nobody reads", emoji: "📋" },
      { id: "d", label: "The one already making excuses", emoji: "🎙️" },
    ],
  },
  {
    id: "q-penalty",
    question: "Which team will bottle a penalty shootout first?",
    category: "banter",
    emoji: "😬",
    options: [
      { id: "england", label: "England (it's tradition at this point)", emoji: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
      { id: "germany", label: "Germany (their era of penalty dominance is over)", emoji: "🇩🇪" },
      { id: "france", label: "France (chaos specialists)", emoji: "🇫🇷" },
      { id: "brazil", label: "Brazil (1994 was 30 years ago)", emoji: "🇧🇷" },
      { id: "dark", label: "A dark horse you least expect", emoji: "🌑" },
    ],
  },
  {
    id: "q-commentator",
    question: "Which phrase will be repeated so much it makes you want to turn the TV off?",
    category: "banter",
    emoji: "📺",
    options: [
      { id: "a", label: "\"He's got another gear...\"", emoji: "⚙️" },
      { id: "b", label: "\"World Cup football is different\"", emoji: "🌍" },
      { id: "c", label: "\"Can they handle the occasion?\"", emoji: "😤" },
      { id: "d", label: "\"Messi/Ronaldo final World Cup...\"", emoji: "🏆" },
      { id: "e", label: "\"The heat will be a factor\"", emoji: "☀️" },
    ],
  },

  // ── PREDICTIONS ────────────────────────────
  {
    id: "q-topscorer-day",
    question: "Who scores the best goal today?",
    category: "prediction",
    emoji: "🎯",
    options: [
      { id: "a", label: "Rocket from outside the box", emoji: "💥" },
      { id: "b", label: "Silky finish after a 1v1", emoji: "🧊" },
      { id: "c", label: "Header from a set piece", emoji: "✈️" },
      { id: "d", label: "Tap-in from a perfect cross", emoji: "📬" },
      { id: "e", label: "Own goal takes the prize", emoji: "🫤" },
    ],
  },
  {
    id: "q-red-card",
    question: "Will there be a red card today?",
    category: "prediction",
    emoji: "🟥",
    options: [
      { id: "yes-early", label: "Yes — before half time", emoji: "⏱️" },
      { id: "yes-late", label: "Yes — in the second half", emoji: "🕐" },
      { id: "no", label: "No red cards, just yellows", emoji: "🟨" },
      { id: "no-way", label: "Clean matches all round today", emoji: "🤝" },
    ],
  },
  {
    id: "q-upset",
    question: "Today's biggest upset goes to:",
    category: "prediction",
    emoji: "💣",
    options: [
      { id: "a", label: "An African side beats a European giant", emoji: "🌍" },
      { id: "b", label: "An Asian side shocks a South American", emoji: "🌏" },
      { id: "c", label: "A CONCACAF team goes 3-0 up", emoji: "🌎" },
      { id: "d", label: "No upsets — favourites win everything", emoji: "😴" },
      { id: "e", label: "The biggest name loses their group", emoji: "💀" },
    ],
  },
  {
    id: "q-var",
    question: "VAR watch: how many reviews today?",
    category: "prediction",
    emoji: "📹",
    options: [
      { id: "0", label: "Zero — smooth day", emoji: "😌" },
      { id: "1-2", label: "1-2 reviews — standard", emoji: "😐" },
      { id: "3-4", label: "3-4 — properly messy", emoji: "😬" },
      { id: "5+", label: "5+ — chaos, absolutely feral", emoji: "😱" },
    ],
  },
  {
    id: "q-motm",
    question: "What type of player wins Man of the Match today?",
    category: "prediction",
    emoji: "🌟",
    options: [
      { id: "a", label: "The striker who bagged a brace", emoji: "⚽⚽" },
      { id: "b", label: "The goalkeeper who made 8 saves", emoji: "🧤" },
      { id: "c", label: "The midfielder who ran 14km", emoji: "🏃" },
      { id: "d", label: "The defender who headed everything", emoji: "🪖" },
      { id: "e", label: "The sub who came on and changed the game", emoji: "🔄" },
    ],
  },

  // ── DEBATE ─────────────────────────────────
  {
    id: "q-formation",
    question: "Which tactical setup is running this tournament?",
    category: "tactical",
    emoji: "♟️",
    options: [
      { id: "a", label: "4-3-3 — the classic returns", emoji: "🔺" },
      { id: "b", label: "3-5-2 — wing backs everywhere", emoji: "🔷" },
      { id: "c", label: "4-2-3-1 — safe and boring wins", emoji: "🛡️" },
      { id: "d", label: "High press chaos — no fixed shape", emoji: "💨" },
      { id: "e", label: "Park the bus and nick it on the break", emoji: "🚌" },
    ],
  },
  {
    id: "q-penalty-taker",
    question: "If your life depended on a penalty, who takes it?",
    category: "debate",
    emoji: "🥅",
    options: [
      { id: "messi", label: "Messi", emoji: "🇦🇷" },
      { id: "mbappe", label: "Mbappé", emoji: "🇫🇷" },
      { id: "kane", label: "Harry Kane", emoji: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
      { id: "lewandowski", label: "Lewandowski", emoji: "🇵🇱" },
      { id: "ronaldo", label: "Ronaldo (if playing)", emoji: "🇵🇹" },
    ],
  },
  {
    id: "q-who-cried",
    question: "Which player/manager will cry on camera first?",
    category: "banter",
    emoji: "😢",
    options: [
      { id: "a", label: "A legend playing their last World Cup", emoji: "👴" },
      { id: "b", label: "A young kid after their first goal", emoji: "🥹" },
      { id: "c", label: "A manager after an early exit", emoji: "😭" },
      { id: "d", label: "A whole squad after a penalty loss", emoji: "💔" },
      { id: "e", label: "Nobody — football men don't cry 😐", emoji: "🪨" },
    ],
  },
  {
    id: "q-pub",
    question: "Which World Cup pub atmosphere does your crew want?",
    category: "viral",
    emoji: "🍺",
    options: [
      { id: "a", label: "Silent until a goal, then absolute mayhem", emoji: "🔇→🔊" },
      { id: "b", label: "Singing throughout, barely watching", emoji: "🎵" },
      { id: "c", label: "Tactical analysis with every touch", emoji: "🧠" },
      { id: "d", label: "Everyone on their phones until big moments", emoji: "📱" },
      { id: "e", label: "Arguing about VAR for 90 minutes", emoji: "🗣️" },
    ],
  },

  // ── VIRAL / FUN ─────────────────────────────
  {
    id: "q-best-celebration",
    question: "Best celebration style seen so far in this tournament",
    category: "viral",
    emoji: "🕺",
    options: [
      { id: "a", label: "The chill walk (too cool to celebrate)", emoji: "😎" },
      { id: "b", label: "The sprint to the corner flag", emoji: "🏃💨" },
      { id: "c", label: "The whole squad pile-on", emoji: "🫸🤸" },
      { id: "d", label: "The phone call celebration", emoji: "📞" },
      { id: "e", label: "Something completely new nobody expected", emoji: "✨" },
    ],
  },
  {
    id: "q-pitch-invader",
    question: "Which non-football moment will go most viral?",
    category: "viral",
    emoji: "📱",
    options: [
      { id: "a", label: "A pitch invader who somehow gets a photo with a player", emoji: "🤳" },
      { id: "b", label: "A manager absolutely losing it on the touchline", emoji: "😤" },
      { id: "c", label: "A goalkeeper's celebration that shouldn't have happened", emoji: "🧤" },
      { id: "d", label: "A scoreboard update that breaks the internet", emoji: "📊" },
      { id: "e", label: "A fan's sign that wins the whole tournament", emoji: "📝" },
    ],
  },
  {
    id: "q-food",
    question: "The World Cup host city food ranking — where would you eat every day?",
    category: "viral",
    emoji: "🍽️",
    options: [
      { id: "houston", label: "Houston (BBQ + Tex-Mex, it's not close)", emoji: "🤠" },
      { id: "kc", label: "Kansas City (BBQ capital of the world, fight me)", emoji: "🥩" },
      { id: "philly", label: "Philadelphia (cheesesteak gang)", emoji: "🥖" },
      { id: "nyc", label: "New York/New Jersey (everything exists here)", emoji: "🗽" },
      { id: "miami", label: "Miami (Cuban food, beach vibes)", emoji: "🌴" },
    ],
  },
  {
    id: "q-tunnel",
    question: "What happens in the tunnel before today's biggest game?",
    category: "viral",
    emoji: "🚇",
    options: [
      { id: "a", label: "Staredown that breaks the internet", emoji: "👀" },
      { id: "b", label: "Wholesome handshake moment", emoji: "🤝" },
      { id: "c", label: "Complete silence — pure focus", emoji: "🧘" },
      { id: "d", label: "Someone's squad starts singing already", emoji: "🎶" },
      { id: "e", label: "Nothing — cameras are banned now", emoji: "🚫" },
    ],
  },
  {
    id: "q-injury",
    question: "We'll look back on which moment as the tournament turning point?",
    category: "debate",
    emoji: "🔄",
    options: [
      { id: "a", label: "A star player gets injured in week 1", emoji: "🏥" },
      { id: "b", label: "A last-minute group stage goal that flips the bracket", emoji: "⏱️" },
      { id: "c", label: "A VAR decision that sparks a conspiracy theory", emoji: "👁️" },
      { id: "d", label: "A goalkeeper howler in the quarters", emoji: "🤦" },
      { id: "e", label: "A penalty miss that ends a dynasty", emoji: "😬" },
    ],
  },
  {
    id: "q-legacy",
    question: "After this World Cup, which player's legacy gets UPGRADED the most?",
    category: "debate",
    emoji: "📈",
    options: [
      { id: "mbappe", label: "Mbappé (finally escapes Messi's shadow)", emoji: "🇫🇷" },
      { id: "bellingham", label: "Bellingham (becomes the face of his generation)", emoji: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
      { id: "yamal", label: "Lamine Yamal (16 going on legend)", emoji: "🇪🇸" },
      { id: "vinicius", label: "Vinicius Jr (team player, winner)", emoji: "🇧🇷" },
      { id: "dark", label: "Someone nobody's picked yet", emoji: "🌟" },
    ],
  },
  {
    id: "q-halftime",
    question: "You're the manager — halftime. Team is 0-1 down. What's your move?",
    category: "tactical",
    emoji: "🪑",
    options: [
      { id: "a", label: "Hairdryer treatment — absolute fury", emoji: "💨" },
      { id: "b", label: "Stay calm, tactical switch, trust the players", emoji: "🧠" },
      { id: "c", label: "Double substitution, change the shape", emoji: "🔄" },
      { id: "d", label: "Go full attack — 3-4-3, we go again", emoji: "⚔️" },
      { id: "e", label: "Blame the ref, then the players, then the pitch", emoji: "😤" },
    ],
  },
  {
    id: "q-extra-time",
    question: "Extra time — which player do you trust most to keep going?",
    category: "debate",
    emoji: "⏰",
    options: [
      { id: "a", label: "Your best player (obviously)", emoji: "⭐" },
      { id: "b", label: "The workhorse midfielder who never stops", emoji: "🏃" },
      { id: "c", label: "Your young sub with nothing to lose", emoji: "🔋" },
      { id: "d", label: "The experienced head who's been here before", emoji: "🧓" },
      { id: "e", label: "Nobody — everyone's cooked by 90", emoji: "😮‍💨" },
    ],
  },
  {
    id: "q-bracket",
    question: "Whose bracket is completely destroyed already?",
    category: "banter",
    emoji: "📊",
    options: [
      { id: "a", label: "The one who predicted all the upsets (too brave)", emoji: "🏆" },
      { id: "b", label: "The one who picked all the safe options (too boring)", emoji: "😴" },
      { id: "c", label: "The one who picked England to win it all", emoji: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
      { id: "d", label: "The one who ignored the group stage entirely", emoji: "🤡" },
      { id: "e", label: "Mine is fine, yours is the disaster", emoji: "😇" },
    ],
  },
];

// ── Daily schedule (override specific days) ───────────────────────
// Day 0 = June 11, 2026 (tournament opener)
// If a day isn't in this map, question is picked by rotation from QUESTION_BANK

export const DAILY_SCHEDULE: Record<number, DailyQuestion> = {
  0: PRETOURNAMENT_QUESTIONS[1], // Opening day: who scores first?
  1: PRETOURNAMENT_QUESTIONS[2], // Day 2: haircut vibes
};

// ── Get question for a given date ─────────────────────────────────

const TOURNAMENT_START = new Date("2026-06-11T00:00:00Z");

export function getTodaysQuestion(): DailyQuestion {
  const now = new Date();
  const dayIndex = Math.floor(
    (now.getTime() - TOURNAMENT_START.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Pre-tournament: rotate through pre-tournament questions
  if (dayIndex < 0) {
    const idx = Math.abs(dayIndex) % PRETOURNAMENT_QUESTIONS.length;
    return PRETOURNAMENT_QUESTIONS[idx];
  }

  // Override for specific days
  if (DAILY_SCHEDULE[dayIndex]) {
    return DAILY_SCHEDULE[dayIndex];
  }

  // Rotate through the main bank
  return QUESTION_BANK[dayIndex % QUESTION_BANK.length];
}
