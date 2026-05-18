import { NextResponse } from "next/server";
import { FLIGHTS } from "@/data/flights";

// GET /api/flights
// Returns all crew flight legs.
// Optional query params:
//   ?crew=Pavel        → filter by crew member name
//   ?date=June+11      → filter by trip day
//   ?type=arrival      → filter by arrival or departure
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const crew = searchParams.get("crew");
  const date = searchParams.get("date");
  const type = searchParams.get("type") as "arrival" | "departure" | null;

  let flights = FLIGHTS;

  if (crew) {
    flights = flights.filter(
      (f) => f.crewName.toLowerCase() === crew.toLowerCase()
    );
  }
  if (date) {
    flights = flights.filter(
      (f) => f.date.toLowerCase() === date.toLowerCase()
    );
  }
  if (type) {
    flights = flights.filter((f) => f.type === type);
  }

  return NextResponse.json({
    count: flights.length,
    flights,
  });
}
