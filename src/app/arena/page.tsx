import { getAllWCMatches } from "@/lib/football-data";
import ArenaClient from "./ArenaClient";

// Revalidate every 60 seconds — keeps match statuses fresh without hammering the free tier
export const revalidate = 60;

export const metadata = {
  title: "Match Arena — WC26 The Boys",
  description: "All 104 FIFA World Cup 2026 matches. Pick your winners, track results, compete daily.",
};

export default async function ArenaPage() {
  const matches = await getAllWCMatches();

  return <ArenaClient matches={matches} />;
}
