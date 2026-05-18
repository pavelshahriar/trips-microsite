// WC26 The Boys Trip — static data
// All data lives here. Easy to update for V2.

export const TRIP_META = {
  name: "WC26 The Boys Trip",
  tagline: "Atlanta to NYC. Football, food, roads, and old friends.",
  startDate: "2026-06-11",
  endDate: "2026-06-20",
  countdownTarget: "2026-06-12T06:00:00", // departure morning
  repo: "https://github.com/pavelshahriar/trips-microsite",
};

export const ROUTE = [
  { city: "Atlanta", abbr: "ATL", emoji: "🍑" },
  { city: "New Orleans", abbr: "NOLA", emoji: "🎷" },
  { city: "Houston", abbr: "HOU", emoji: "🤠" },
  { city: "Dallas", abbr: "DAL", emoji: "⭐" },
  { city: "Joplin", abbr: "JOP", emoji: "🛣️" },
  { city: "Kansas City", abbr: "KC", emoji: "🥩" },
  { city: "Columbia", abbr: "MO", emoji: "🌽" },
  { city: "Cincinnati", abbr: "CIN", emoji: "🌉" },
  { city: "Washington DC", abbr: "DC", emoji: "🏛️" },
  { city: "Philadelphia", abbr: "PHL", emoji: "🦅" },
  { city: "New York", abbr: "NYC", emoji: "🗽" },
];

export interface ItineraryDay {
  date: string;
  dayLabel: string;
  title: string;
  from: string;
  to: string;
  drive: string;
  hotel: string;
  hotelCity: string;
  food: string[];
  highlights: string[];
  isMatchDay?: boolean;
  matchTeams?: string;
}

export const ITINERARY: ItineraryDay[] = [
  {
    date: "June 11",
    dayLabel: "Thu",
    title: "ATL Pickup Day",
    from: "Atlanta",
    to: "Atlanta",
    drive: "Local only",
    hotel: "Home base / ATL airport",
    hotelCity: "Atlanta, GA",
    food: ["Costco/Walmart snack run"],
    highlights: [
      "Evening — Pick up the minivan from ATL airport",
      "Load luggage, flags, jerseys, snacks",
      "Final prep before road trip starts",
    ],
  },
  {
    date: "June 12",
    dayLabel: "Fri",
    title: "Atlanta → New Orleans",
    from: "Atlanta",
    to: "New Orleans",
    drive: "~7 hrs",
    hotel: "Contempra Inn",
    hotelCity: "Kenner / NOLA area, LA",
    food: ["Cafe du Monde", "Cochon", "Jazz bars"],
    highlights: [
      "6:00 AM — Leave Atlanta",
      "9:30 AM — Breakfast/coffee stop near Mobile",
      "1:00–2:00 PM — Reach New Orleans",
      "Afternoon — French Quarter + Jackson Square",
      "Night — Jazz + Cajun food + chill",
    ],
  },
  {
    date: "June 13",
    dayLabel: "Sat",
    title: "New Orleans → Houston",
    from: "New Orleans",
    to: "Houston",
    drive: "~5–5.5 hrs",
    hotel: "GreenTree Inn Houston IAH Airport",
    hotelCity: "Houston, TX",
    food: ["Truth BBQ", "Xochi", "Tex-Mex"],
    highlights: [
      "9:00 AM — Breakfast in New Orleans",
      "10:00 AM — Leave for Houston",
      "1:00 PM — Lunch stop near Lafayette",
      "4:00 PM — Reach Houston",
      "Night — Explore Houston food scene",
    ],
  },
  {
    date: "June 14",
    dayLabel: "Sun",
    title: "Germany Match Day 🇩🇪",
    from: "Houston",
    to: "Dallas",
    drive: "~4 hrs late-night after match",
    hotel: "HomeTowne Studios Dallas - Mesquite",
    hotelCity: "Dallas / Mesquite, TX",
    food: ["Texas BBQ", "Match-day food"],
    highlights: [
      "Morning — Sleep in + brunch",
      "Afternoon — Fan zones / stadium atmosphere",
      "Evening — Germany match at NRG Stadium",
      "~10:00 PM — Leave Houston after the match",
      "~2:00 AM — Reach Dallas/Mesquite",
    ],
    isMatchDay: true,
    matchTeams: "Germany",
  },
  {
    date: "June 15",
    dayLabel: "Mon",
    title: "Dallas → Joplin",
    from: "Dallas",
    to: "Joplin",
    drive: "~5.5–6 hrs",
    hotel: "Days Inn by Wyndham Joplin",
    hotelCity: "Joplin, MO",
    food: ["Route 66 diners", "Oklahoma stops"],
    highlights: [
      "Late morning — Leave Dallas",
      "Afternoon — Oklahoma food/gas stops",
      "Evening — Reach Joplin",
      "Night — Relax + recovery",
    ],
  },
  {
    date: "June 16",
    dayLabel: "Tue",
    title: "Argentina Match Day 🇦🇷",
    from: "Joplin",
    to: "Columbia",
    drive: "~4 hrs + late-night ~2 hrs",
    hotel: "Best Western Plus Columbia Inn",
    hotelCity: "Columbia, MO",
    food: ["Joe's KC BBQ", "Q39"],
    highlights: [
      "Morning — Leave Joplin",
      "Afternoon — Reach Kansas City",
      "BBQ + stadium atmosphere",
      "8:00 PM — Argentina match at Arrowhead Stadium",
      "~10:00 PM — Match ends",
      "10:30 PM — Start driving toward Columbia",
      "~1:00 AM — Reach Columbia hotel",
    ],
    isMatchDay: true,
    matchTeams: "Argentina",
  },
  {
    date: "June 17",
    dayLabel: "Wed",
    title: "Columbia → Cincinnati",
    from: "Columbia",
    to: "Cincinnati",
    drive: "~7–8 hrs",
    hotel: "Extended Stay America Suites",
    hotelCity: "Cincinnati / Blue Ash, OH",
    food: ["Skyline Chili"],
    highlights: [
      "Morning — Sleep in after late-night arrival",
      "10:00 AM — Leave Columbia",
      "Afternoon — Scenic Midwest driving",
      "Evening — Reach Cincinnati",
      "Night — Casual dinner + recovery",
    ],
  },
  {
    date: "June 18",
    dayLabel: "Thu",
    title: "Cincinnati → Washington DC",
    from: "Cincinnati",
    to: "Washington DC",
    drive: "~8–9 hrs",
    hotel: "Gateway Hotel",
    hotelCity: "Washington DC",
    food: ["Founding Farmers", "Ben's Chili Bowl"],
    highlights: [
      "Morning — Leave Cincinnati",
      "Afternoon — Appalachian / WV driving",
      "Evening — Reach DC",
      "Night — Monuments + relaxed evening",
    ],
  },
  {
    date: "June 19",
    dayLabel: "Fri",
    title: "Brazil Match Day 🇧🇷",
    from: "Washington DC",
    to: "NYC",
    drive: "~2–3 hrs to Philly + ~2 hrs to NYC",
    hotel: "Post-match NYC arrival",
    hotelCity: "New York City, NY",
    food: ["Philly cheesesteak", "NYC halal cart"],
    highlights: [
      "Morning — Brunch / slow start in DC",
      "Noon — Leave for Philly",
      "Afternoon — Reach stadium area",
      "Evening — Brazil vs Haiti at Lincoln Financial Field",
      "Late night — Drive to NYC",
      "~2:00 AM — Reach NYC",
    ],
    isMatchDay: true,
    matchTeams: "Brazil vs Haiti",
  },
  {
    date: "June 20",
    dayLabel: "Sat",
    title: "Return Day",
    from: "NYC",
    to: "Home",
    drive: "Local only",
    hotel: "LaGuardia Airport",
    hotelCity: "New York City, NY",
    food: ["Airport survival mode"],
    highlights: [
      "Sleep",
      "Coffee",
      "Return the minivan at LaGuardia",
      "Trip officially ends",
    ],
  },
];

export interface MatchTickets {
  fifa: string;
  stubhub: string;
  seatgeek: string;
  ticketmaster: string;
}

export interface Match {
  id: string;
  team: string;
  opponent?: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  stadium: string;
  emoji: string;
  color: string;
  vibe: string;
  url: string;          // FIFA/match info page
  teamNewsUrl: string;  // FIFA team news
  mapsUrl: string;      // Google Maps link for the stadium
  tickets: MatchTickets;
}

export const MATCHES: Match[] = [
  {
    id: "germany",
    team: "Germany",
    opponent: "Curaçao",
    date: "June 14, 2026",
    time: "Evening",
    venue: "Houston, TX",
    city: "Houston",
    stadium: "NRG Stadium",
    emoji: "🇩🇪",
    color: "#000000",
    vibe: "Texas BBQ + German football",
    url: "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026",
    teamNewsUrl: "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/teams/germany/team-news",
    mapsUrl: "https://maps.google.com/?q=NRG+Stadium,+Houston,+TX",
    tickets: {
      fifa: "https://fwc26-resale-usd.tickets.fifa.com/secure/selection/event/seat/performance/10229226700895/lang/en",
      stubhub: "https://www.stubhub.com/world-cup-houston-tickets-6-14-2026/event/153020800/?backUrl=%2Fworld-cup-tickets%2Fgrouping%2F45410&lt=33.858&lg=-84.216",
      seatgeek: "https://seatgeek.com/fifa-world-cup-tickets/international-soccer/2026-06-14-12-pm/17307552?quantity=2",
      ticketmaster: "https://www.ticketmaster.com/event/Z7r9jZ1A7433b",
    },
  },
  {
    id: "argentina",
    team: "Argentina",
    opponent: "Algeria",
    date: "June 16, 2026",
    time: "8:00 PM",
    venue: "Kansas City, MO",
    city: "Kansas City",
    stadium: "Arrowhead Stadium",
    emoji: "🇦🇷",
    color: "#74ACDF",
    vibe: "KC BBQ + World Champions",
    url: "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026",
    teamNewsUrl: "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/teams/argentina/team-news",
    mapsUrl: "https://maps.google.com/?q=GEHA+Field+at+Arrowhead+Stadium,+Kansas+City,+MO",
    tickets: {
      fifa: "https://fwc26-resale-usd.tickets.fifa.com/secure/selection/event/seat/performance/10229226700907/lang/en",
      stubhub: "https://www.stubhub.com/world-cup-kansas-city-tickets-6-16-2026/event/153021561/?backUrl=%2Fworld-cup-tickets%2Fgrouping%2F45410&lt=33.858&lg=-84.216",
      seatgeek: "https://seatgeek.com/fifa-world-cup-tickets/international-soccer/2026-06-16-8-pm/17196233?quantity=2",
      ticketmaster: "https://www.ticketmaster.com/event/Z7r9jZ1A743fk",
    },
  },
  {
    id: "brazil",
    team: "Brazil",
    opponent: "Haiti",
    date: "June 19, 2026",
    time: "Evening",
    venue: "Philadelphia, PA",
    city: "Philadelphia",
    stadium: "Lincoln Financial Field",
    emoji: "🇧🇷",
    color: "#009C3B",
    vibe: "Philly energy + Samba vibes",
    url: "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026",
    teamNewsUrl: "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/teams/brazil/team-news",
    mapsUrl: "https://maps.google.com/?q=Lincoln+Financial+Field,+Philadelphia,+PA",
    tickets: {
      fifa: "https://fwc26-resale-usd.tickets.fifa.com/secure/selection/event/seat/performance/10229226700917/contact-advantages/10229997383410/lang/en",
      stubhub: "https://www.stubhub.com/world-cup-philadelphia-tickets-6-19-2026/event/153022742/?backUrl=%2Fworld-cup-tickets%2Fgrouping%2F45410&lt=33.858&lg=-84.216",
      seatgeek: "https://seatgeek.com/fifa-world-cup-tickets/international-soccer/2026-06-19-9-pm/17213260?quantity=2",
      ticketmaster: "https://www.ticketmaster.com/event/Z7r9jZ1A743ff",
    },
  },
];

export const TICKETS_NOTE =
  "Tickets are a bonus. If we don't get stadium tickets, we'll watch together in fan zones or sports bars.";

export interface Venue {
  id: string;
  stadium: string;
  city: string;
  state: string;
  matchDay: string;
  matchTeam: string;
  travelNote: string;
  foodNearby: string[];
  emoji: string;
  capacity: string;
  url: string;                // Official stadium website
  mapsUrl: string;            // Google Maps
  officialChannelUrl: string; // FIFA official WhatsApp channel
}

export const VENUES: Venue[] = [
  {
    id: "houston",
    stadium: "NRG Stadium",
    city: "Houston",
    state: "TX",
    matchDay: "June 14, 2026",
    matchTeam: "Germany match",
    travelNote: "Drive in from NOLA the day before. Staying near IAH airport.",
    foodNearby: ["Truth BBQ", "Xochi", "Pappas Bros Steakhouse"],
    emoji: "🤠",
    capacity: "72,000",
    url: "https://www.nrgpark.com/nrg-stadium/",
    mapsUrl: "https://maps.google.com/?q=NRG+Stadium,+Houston,+TX",
    officialChannelUrl: "https://www.whatsapp.com/channel/0029VbBmdjd3QxS2SPEL0q3C",
  },
  {
    id: "kc",
    stadium: "Arrowhead Stadium",
    city: "Kansas City",
    state: "MO",
    matchDay: "June 16, 2026",
    matchTeam: "Argentina match",
    travelNote: "Drive up from Joplin morning of match. Head to Columbia after.",
    foodNearby: ["Joe's Kansas City BBQ", "Q39", "Gates Bar-B-Q"],
    emoji: "🏈",
    capacity: "76,000",
    url: "https://www.chiefs.com/stadium/",
    mapsUrl: "https://maps.google.com/?q=GEHA+Field+at+Arrowhead+Stadium,+Kansas+City,+MO",
    officialChannelUrl: "https://www.whatsapp.com/channel/0029Vb6T56g1Hsq1jUDMVt1m",
  },
  {
    id: "philly",
    stadium: "Lincoln Financial Field",
    city: "Philadelphia",
    state: "PA",
    matchDay: "June 19, 2026",
    matchTeam: "Brazil vs Haiti",
    travelNote: "Drive up from DC. Head to NYC after the match.",
    foodNearby: ["Pat's King of Steaks", "Geno's Steaks", "Reading Terminal Market"],
    emoji: "🦅",
    capacity: "69,000",
    url: "https://www.lincolnfinancialfield.com/",
    mapsUrl: "https://maps.google.com/?q=Lincoln+Financial+Field,+Philadelphia,+PA",
    officialChannelUrl: "https://www.whatsapp.com/channel/0029VbBwemv17EmlvqB0y43E",
  },
];

// Arrival order = chronological order arriving in Atlanta, June 11
export interface CrewMember {
  name: string;
  from: string;
  flag: string;
  team: string;
  teamEmoji: string;
  teamColor: string;
  nickname: string;
  role: string;
  bio: string;
  facebook: string;
  arrivalOrder: number; // 1 = first to arrive in ATL
  photo?: string;
}

// ─── CREW PHOTOS ────────────────────────────────────────────────────────────
// Photos live in:  app/public/crew/<filename>.png
// They are served at the URL path:  /crew/<filename>.png
// To update a photo: replace the file in app/public/crew/ — that's all.
// ────────────────────────────────────────────────────────────────────────────

export const CREW: CrewMember[] = [
  {
    name: "Pavel",
    from: "Atlanta, GA",
    flag: "🇺🇸",
    team: "Brazil",
    teamEmoji: "🇧🇷",
    teamColor: "#009C3B",
    nickname: "O Arquiteto",
    role: "Trip organizer & driver lead",
    bio: "Started planning a 10-man cross-country epic. Ended up with 6 guys in a minivan. Still counts. Professional photographer turned software guy, Brasil fan since 1990, and owner of every Seleção jersey since 1998. Basically a one-man World Cup.",
    facebook: "https://www.facebook.com/pavelshahriar",
    arrivalOrder: 1,
    photo: "/crew/pavel.png",
  },
  {
    name: "Rupan",
    from: "London, UK",
    flag: "🇬🇧",
    team: "Germany",
    teamEmoji: "🇩🇪",
    teamColor: "#000000",
    nickname: "Der Kaiser",
    role: "Food scout & navigator",
    bio: "Lawyer by profession, German by birth — Rupan came into the world in Germany and never let anyone forget it. Will remind you, unprompted, that Die Mannschaft have won four World Cups. His arch nemesis is Argentina. His favourite fun fact to drop on Brasil fans: the 7-1. In a minivan. With nowhere to run.",
    facebook: "https://www.facebook.com/tanzir.m",
    arrivalOrder: 2,
    photo: "/crew/rupan.png",
  },
  {
    name: "Topu",
    from: "Chicago, IL",
    flag: "🇺🇸",
    team: "Argentina",
    teamEmoji: "🇦🇷",
    teamColor: "#74ACDF",
    nickname: "El Matador",
    role: "Hype man & playlist curator",
    bio: "A family man through and through — but don't let that fool you. Topu has a gift for the perfectly timed, surgically precise comeback that leaves the whole group in stitches. You never see it coming. He's quiet, then suddenly you're the one who got roasted. Flies in for Atlanta and Houston, then bails back to Chicago before the rest of the trip. Short stay, maximum damage.",
    facebook: "https://www.facebook.com/tanveer.ahmed.25593",
    arrivalOrder: 3,
    photo: "/crew/topu.png",
  },
  {
    name: "Rocky",
    from: "Sydney, Australia",
    flag: "🇦🇺",
    team: "Argentina",
    teamEmoji: "🇦🇷",
    teamColor: "#74ACDF",
    nickname: "El Asador",
    role: "Good vibes, full time",
    bio: "Made the longest journey of anyone — Sydney to Atlanta — and arrived with the most energy. Rocky is always smiling, always in fun mode, never stops. The guy is a perpetual good time. When he's not on road trips, he runs a couple of restaurants back in Sydney. A man of many talents, all of them cheerful.",
    facebook: "https://www.facebook.com/mohammad.riasat",
    arrivalOrder: 4,
    photo: "/crew/rocky.png",
  },
  {
    name: "Imran",
    from: "Dhaka, Bangladesh",
    flag: "🇧🇩",
    team: "Brazil",
    teamEmoji: "🇧🇷",
    teamColor: "#009C3B",
    nickname: "O Maestro",
    role: "Hotel logistics & snacks",
    bio: "Without Imran, this trip is a Facebook Messenger thread that goes nowhere. He kept pushing, chased the stragglers until some of them had no choice, and somehow made it happen. A true Brasil fan who danced samba through and through to get this off the ground — who, by the way, will casually slip away from a family trip to join the boys in Atlanta. Nobody else could pull that off.",
    facebook: "https://www.facebook.com/imran.shah.398937",
    arrivalOrder: 5,
    photo: "/crew/imran.png",
  },
  {
    name: "Abbas",
    from: "Winnipeg, Canada",
    flag: "🇨🇦",
    team: "Argentina",
    teamEmoji: "🇦🇷",
    teamColor: "#74ACDF",
    nickname: "D10S",
    role: "Argentina's #1 ambassador",
    bio: "Abbas doesn't support Argentina — he lives and breathes it. Messi, Maradona, La Albiceleste — this is the man's entire operating system. Argentina are the reigning World Cup champions, ending a 32-year wait, and the group is convinced it was Abbas's prayers that finally did it. Anything Argentine and Abbas is already sold. Don't even try to argue.",
    facebook: "https://www.facebook.com/STIGA.CARBON",
    arrivalOrder: 6,
    photo: "/crew/abbas.png",
  },
];

export interface NewsLink {
  id: string;
  category: string;
  title: string;
  description: string;
  url: string;
  emoji: string;
}

export const NEWS_LINKS: NewsLink[] = [
  {
    id: "fifa-schedule",
    category: "Official",
    title: "FIFA WC26 Official Schedule",
    description:
      "Full match schedule, group stages, knockout rounds, and venue details from FIFA.",
    url: "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026",
    emoji: "🏆",
  },
  {
    id: "houston-updates",
    category: "Host City",
    title: "Houston Fan Zone Updates",
    description:
      "Official WC26 fan zone, transport, and event info for Houston match day.",
    url: "https://www.visithoustontexas.com/worldcup",
    emoji: "🤠",
  },
  {
    id: "kc-updates",
    category: "Host City",
    title: "Kansas City Match Day Guide",
    description:
      "Fan zones, transport, and local events around Arrowhead Stadium for WC26.",
    url: "https://www.visitkc.com/world-cup",
    emoji: "🏈",
  },
  {
    id: "philly-updates",
    category: "Host City",
    title: "Philadelphia WC26 Info",
    description:
      "Everything you need to know about the WC26 experience in Philly.",
    url: "https://www.discoverphl.com/worldcup",
    emoji: "🦅",
  },
  {
    id: "tickets",
    category: "Tickets",
    title: "Ticket Updates & Resale",
    description:
      "Stay up to date on ticket availability, resale platforms, and fan packages.",
    url: "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/tickets",
    emoji: "🎟️",
  },
  {
    id: "wc26-news",
    category: "News",
    title: "World Cup 2026 Latest News",
    description:
      "Team news, qualifications, squads, and everything happening before and during the tournament.",
    url: "https://www.goal.com/en/world-cup",
    emoji: "📰",
  },
  {
    id: "transport",
    category: "Logistics",
    title: "Road Trip Route Planner",
    description:
      "Plan your route, check road conditions, and find the best stops along the way.",
    url: "https://maps.google.com",
    emoji: "🗺️",
  },
  {
    id: "visas",
    category: "Logistics",
    title: "US Entry & Visa Info",
    description:
      "Entry requirements for international crew members flying into the US for the trip.",
    url: "https://travel.state.gov",
    emoji: "✈️",
  },
];

export const VAULT_FEATURES = [
  {
    icon: "Lock",
    title: "Private Login",
    description: "Secure crew-only access with magic link login.",
    status: "V2",
  },
  {
    icon: "Camera",
    title: "Shared Photos",
    description: "Upload and browse trip photos together in real-time.",
    status: "V2",
  },
  {
    icon: "FileText",
    title: "Booking Docs",
    description: "All hotel confirmations, itineraries, and tickets in one place.",
    status: "V2",
  },
  {
    icon: "DollarSign",
    title: "Expense Tracker",
    description: "Split costs, log expenses, settle up at the end.",
    status: "V2",
  },
  {
    icon: "Sparkles",
    title: "AI Trip Story",
    description: "Claude writes your trip story from photos and notes. Auto-generated.",
    status: "V2",
  },
];

// Google Maps route through all 3 match stadiums
export const STADIUMS_MAP_URL =
  "https://www.google.com/maps/dir/NRG+Stadium,+Houston,+TX/GEHA+Field+at+Arrowhead+Stadium,+Kansas+City,+MO/Lincoln+Financial+Field,+Philadelphia,+PA";

// Full 10-stop road trip route: ATL → NOLA → Houston → Joplin → KC → Columbia → Cincinnati → DC → Philly → NYC
export const FULL_ROUTE_MAP_URL =
  "https://www.google.com/maps/dir/Atlanta,+Georgia/New+Orleans,+Louisiana/NRG+Stadium,+1+NRG+Pkwy,+Houston,+TX+77054/Joplin,+Missouri/Kansas+City+Stadium,+1+Arrowhead+Dr,+Kansas+City,+MO+64129/Columbia,+Missouri/Cincinnati,+Ohio/Washington,+District+of+Columbia/Lincoln+Financial+Field,+One+Lincoln+Financial+Field+Way,+Philadelphia,+PA+19148/New+York/@34.7385043,-96.0269228,5z/data=!4m62!4m61!1m5!1m1!1s0x88f5045d6993098d:0x66fede2f990b630b!2m2!1d-84.3885209!2d33.7501275!1m5!1m1!1s0x8620a454b2118265:0xdb065be85e22d3b4!2m2!1d-90.0758356!2d29.9508941!1m5!1m1!1s0x8640c0194b406bad:0x1b0f6ec2399a9d57!2m2!1d-95.4107074!2d29.6847219!1m5!1m1!1s0x87c86537eae4d3eb:0x981637362835a30e!2m2!1d-94.5134312!2d37.0854844!1m5!1m1!1s0x87c0e4a194db922b:0xbccd4d8cf72544e6!2m2!1d-94.4840141!2d39.0489647!1m5!1m1!1s0x87dcabf3bb8182c9:0xa011692dbabd6f20!2m2!1d-92.3282932!2d38.951768!1m5!1m1!1s0x884051b1de3821f9:0x69fb7e8be4c09317!2m2!1d-84.5120196!2d39.1031182!1m5!1m1!1s0x89b7c6de5af6e45b:0xc2524522d4885d2a!2m2!1d-77.0369274!2d38.9072873!1m5!1m1!1s0x89c6c7a9e03add31:0xf4050036d4293709!2m2!1d-75.1675992!2d39.9014189!1m5!1m1!1s0x89c24fa5d33f083b:0xc80b8f06e177fe62!2m2!1d-74.0059728!2d40.7127753!3e0?entry=ttu&g_ep=EgoyMDI2MDUxMy4wIKXMDSoASAFQAw%3D%3D";
