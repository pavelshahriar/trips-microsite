import { ITINERARY } from "@/data/trip";
import DayCard from "./DayCard";

interface ItineraryTimelineProps {
  limit?: number;
}

export default function ItineraryTimeline({
  limit,
}: ItineraryTimelineProps) {
  const days = limit ? ITINERARY.slice(0, limit) : ITINERARY;

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-gold/30 via-navy-700 to-transparent hidden sm:block" />

      <div className="space-y-6">
        {days.map((day, i) => (
          <div key={day.date} className="relative sm:pl-10">
            {/* Timeline dot */}
            <div
              className={`absolute left-0 top-6 w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold hidden sm:flex ${
                day.isMatchDay
                  ? "bg-gold border-gold text-navy-950"
                  : "bg-navy-800 border-navy-600 text-slate-400"
              }`}
            >
              {i + 1}
            </div>
            <DayCard day={day} index={i} />
          </div>
        ))}
      </div>
    </div>
  );
}
