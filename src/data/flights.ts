// WC26 The Boys Trip — crew flight details
// Each entry links to a crew member by name and a trip day by date string (matches ITINERARY[].date).

export interface FlightLeg {
  crewName: string;          // Must match CREW[].name exactly
  type: "arrival" | "departure";
  date: string;              // e.g. "June 11" — must match ITINERARY[].date
  flightNumber?: string;
  airline?: string;
  from: string;
  to: string;
  departureTime?: string;    // Local time at origin
  arrivalTime?: string;      // Local time at destination
  note?: string;
}

export const FLIGHTS: FlightLeg[] = [

  // ── ARRIVALS ────────────────────────────────────

  // PAVEL — already in Atlanta, no flight needed ✅

  // RUPON — London Heathrow → Atlanta (arrives June 10)
  {
    crewName: "Rupan",
    type: "arrival",
    date: "June 11",
    flightNumber: "AF3587",
    airline: "Delta (operated by Air France)",
    from: "London Heathrow (LHR)",
    to: "Atlanta (ATL)",
    departureTime: "09:20",
    arrivalTime: "13:33",
    note: "Arrives June 10 — first one in",
  },

  // TOPU — Chicago → Atlanta (arrives June 10)
  {
    crewName: "Topu",
    type: "arrival",
    date: "June 11",
    flightNumber: "AA2779",
    airline: "American Airlines",
    from: "Chicago O'Hare (ORD)",
    to: "Atlanta (ATL)",
    departureTime: "18:59",
    arrivalTime: "22:05",
    note: "Arrives June 10",
  },

  // ROCKY — Sydney → Dallas → Atlanta (arrives June 10)
  {
    crewName: "Rocky",
    type: "arrival",
    date: "June 11",
    flightNumber: "QF7 → QF4659",
    airline: "Qantas + American Airlines",
    from: "Sydney (SYD)",
    to: "Atlanta (ATL)",
    departureTime: "12:00",
    arrivalTime: "22:43",
    note: "Arrives June 10 via Dallas Fort Worth (DFW) — 24h 43m total journey",
  },

  // IMRAN — Edmonton → Calgary → Atlanta (arrives June 11)
  {
    crewName: "Imran",
    type: "arrival",
    date: "June 11",
    flightNumber: "WS3309 → WS1992",
    airline: "WestJet",
    from: "Edmonton (YEG)",
    to: "Atlanta (ATL)",
    departureTime: "21:30",
    arrivalTime: "06:55",
    note: "Via Calgary (YYC) — slipping away from the family Canada trip",
  },

  // ABBAS — Winnipeg → Minneapolis → Atlanta (arrives June 11)
  {
    crewName: "Abbas",
    type: "arrival",
    date: "June 11",
    flightNumber: "DL4005 → DL1032",
    airline: "Delta Air Lines",
    from: "Winnipeg (YWG)",
    to: "Atlanta (ATL)",
    departureTime: "17:41",
    arrivalTime: "23:47",
    note: "Via Minneapolis (MSP)",
  },

  // ── DEPARTURES ───────────────────────────────────

  // TOPU — Houston → Chicago (June 14, before the rest head to Dallas)
  {
    crewName: "Topu",
    type: "departure",
    date: "June 14",
    flightNumber: "AA (return)",
    airline: "American Airlines",
    from: "Houston IAH",
    to: "Chicago O'Hare (ORD)",
    departureTime: "13:30",
    arrivalTime: "16:19",
    note: "Early exit after Houston — back to Chicago life 👋",
  },

  // IMRAN — New York → Chicago (June 20, rejoins family)
  {
    crewName: "Imran",
    type: "departure",
    date: "June 20",
    flightNumber: "UA211",
    airline: "United Airlines",
    from: "New York LaGuardia (LGA)",
    to: "Chicago O'Hare (ORD)",
    departureTime: "07:00",
    arrivalTime: "08:24",
    note: "Slipping back to rejoin the family 🎩",
  },

  // RUPON — New York JFK → London Heathrow (June 21)
  {
    crewName: "Rupan",
    type: "departure",
    date: "June 20",
    flightNumber: "KL2501",
    airline: "Virgin Atlantic (operated by KLM)",
    from: "New York JFK",
    to: "London Heathrow (LHR)",
    departureTime: "18:00",
    arrivalTime: "06:20",
    note: "Arrives London June 22 — Der Kaiser returns",
  },

  // ABBAS — Atlanta → Minneapolis → Winnipeg (June 21)
  {
    crewName: "Abbas",
    type: "departure",
    date: "June 20",
    flightNumber: "DL2668 → DL3823",
    airline: "Delta Air Lines",
    from: "Atlanta (ATL)",
    to: "Winnipeg (YWG)",
    departureTime: "07:25",
    arrivalTime: "15:04",
    note: "Via Minneapolis (MSP) — back to the prairies",
  },

  // ROCKY — New York JFK → Dallas → Sydney (June 22)
  {
    crewName: "Rocky",
    type: "departure",
    date: "June 20",
    flightNumber: "AA606 → QF8",
    airline: "American Airlines + Qantas",
    from: "New York JFK",
    to: "Sydney (SYD)",
    departureTime: "17:33",
    arrivalTime: "06:55",
    note: "Via Dallas (DFW) — 23h 22m home. Worth it 🦘",
  },
];
