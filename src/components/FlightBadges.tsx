"use client";

import { useEffect, useState } from "react";
import { Plane } from "lucide-react";
import type { FlightLeg } from "@/data/flights";
import { CREW } from "@/data/trip";

interface FlightBadgesProps {
  date: string; // e.g. "June 11"
}

function getCrewColor(crewName: string): string {
  const member = CREW.find((c) => c.name === crewName);
  if (!member) return "#64748b";
  return member.teamColor === "#000000" ? "#888" : member.teamColor;
}

function getCrewEmoji(crewName: string): string {
  const member = CREW.find((c) => c.name === crewName);
  return member?.teamEmoji ?? "✈️";
}

export default function FlightBadges({ date }: FlightBadgesProps) {
  const [flights, setFlights] = useState<FlightLeg[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/flights?date=${encodeURIComponent(date)}`)
      .then((r) => r.json())
      .then((data) => {
        setFlights(data.flights ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [date]);

  if (loading || flights.length === 0) return null;

  const arrivals = flights.filter((f) => f.type === "arrival");
  const departures = flights.filter((f) => f.type === "departure");

  return (
    <div
      className="mt-4 pt-4 space-y-3"
      style={{ borderTop: "1px solid var(--color-border)" }}
    >
      {arrivals.length > 0 && (
        <div>
          <p
            className="text-[10px] uppercase tracking-widest mb-2 flex items-center gap-1.5"
            style={{ color: "var(--color-muted)" }}
          >
            <Plane size={10} className="rotate-[-45deg]" />
            Crew arriving
          </p>
          <div className="flex flex-wrap gap-2">
            {arrivals.map((f, i) => (
              <FlightChip key={i} flight={f} />
            ))}
          </div>
        </div>
      )}
      {departures.length > 0 && (
        <div>
          <p
            className="text-[10px] uppercase tracking-widest mb-2 flex items-center gap-1.5"
            style={{ color: "var(--color-muted)" }}
          >
            <Plane size={10} className="rotate-45" />
            Crew departing
          </p>
          <div className="flex flex-wrap gap-2">
            {departures.map((f, i) => (
              <FlightChip key={i} flight={f} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FlightChip({ flight }: { flight: FlightLeg }) {
  const color = getCrewColor(flight.crewName);
  const emoji = getCrewEmoji(flight.crewName);
  const isTBC = flight.flightNumber === "TBC" || !flight.flightNumber;

  return (
    <div
      className="group relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs border cursor-default"
      style={{
        backgroundColor: `${color}12`,
        borderColor: `${color}35`,
        color: "var(--color-text)",
      }}
    >
      <span className="text-base leading-none">{emoji}</span>
      <div>
        <span className="font-semibold" style={{ color }}>
          {flight.crewName}
        </span>
        <span className="mx-1" style={{ color: "var(--color-muted)" }}>·</span>
        <span style={{ color: "var(--color-muted)" }}>
          {flight.from.split("(")[0].trim()} → {flight.to.split("(")[0].trim()}
        </span>
        {!isTBC && flight.arrivalTime && (
          <span className="ml-1" style={{ color: "var(--color-muted)" }}>
            @ {flight.arrivalTime}
          </span>
        )}
        {isTBC && (
          <span className="ml-1 italic" style={{ color: "var(--color-muted)", opacity: 0.6 }}>
            TBC
          </span>
        )}
      </div>
      {flight.note && (
        <div
          className="absolute bottom-full left-0 mb-1.5 z-10 hidden group-hover:block rounded-lg px-3 py-2 max-w-[220px] shadow-xl whitespace-normal text-xs"
          style={{
            backgroundColor: "var(--bg-nav)",
            border: "1px solid var(--color-border)",
            color: "var(--color-nav-text)",
          }}
        >
          {flight.note}
        </div>
      )}
    </div>
  );
}
