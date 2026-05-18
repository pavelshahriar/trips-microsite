# WC26 The Boys Trip 🏆

> Atlanta to NYC. Football, food, roads, and old friends.

A polished mobile-first microsite for a friends' FIFA World Cup 2026 road trip. 10 days, 11 cities, 3 matches. Built with Next.js, Tailwind, and zero corporate energy.

**Route:** Atlanta → New Orleans → Houston → Dallas → Joplin → Kansas City → Columbia → Cincinnati → Washington DC → Philadelphia → NYC

---

## Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Framer Motion** — subtle animations
- **lucide-react** — icons
- No backend. No auth. All static data. V1 is public.

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home — hero, countdown, featured matches, itinerary preview |
| `/itinerary` | Full 10-day trip timeline |
| `/matches` | Germany, Argentina, Brazil match cards |
| `/venues` | NRG Stadium, Arrowhead, Lincoln Financial |
| `/crew` | The 6-man squad |
| `/news` | Curated links — FIFA, host cities, tickets |
| `/trip-vault` | V2 teaser — locked features |

---

## Getting started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
# → http://localhost:3000

# Production build
npm run build

# Start production server
npm start
```

---

## Data files

| File | What's in it |
|------|-------------|
| `src/data/trip.ts` | Crew, itinerary, matches, venues, news links |
| `src/data/flights.ts` | Individual flight legs per crew member |

Update everything from these two files. No database, no API calls — just edit and push.

**Crew photos** live in `public/crew/<name>.png`. To swap a photo, replace the file there — that's it.

---

## Deploy to Netlify

`netlify.toml` is already configured. Just connect the GitHub repo to [netlify.com](https://netlify.com) and it auto-deploys on every push to `main`.

Environment variables needed for V1: **none**.

---

## V2 Roadmap

The Trip Vault (currently a teaser page) will become a full private crew portal:

- **Supabase Auth** — magic link login for crew members
- **Postgres tables** — trips, travellers, bookings, expenses, photos, venues, matches
- **Cloudinary upload widget** — drag and drop trip photos
- **Authenticated gallery** — private photo sharing for the crew only
- **Booking document upload** — store hotel confirmations, tickets, itineraries
- **Expense tracker** — log costs per person, split and settle up at the end
- **Face clustering** — automatically find photos you're in
- **AI reels** — Claude writes your trip story from photos and notes

---

## Repo

[github.com/pavelshahriar/trips-microsite](https://github.com/pavelshahriar/trips-microsite)

---

*No corporate vibes. Built for the boys. WC26 🏆*
