"use client";

import { useState } from "react";
import CrewCard from "@/components/CrewCard";
import CrewModal from "@/components/CrewModal";
import type { CrewMember } from "@/data/trip";

interface CrewPageClientProps {
  crew: CrewMember[];
}

export default function CrewPageClient({ crew }: CrewPageClientProps) {
  const [selected, setSelected] = useState<CrewMember | null>(null);

  const isOrphan = crew.length % 3 === 1;

  return (
    <>
      {/* Crew grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-12">
        {crew.map((member, i) => {
          const lastCard = i === crew.length - 1;
          return (
            <div
              key={member.name}
              className={lastCard && isOrphan ? "col-span-1 md:col-start-2" : ""}
            >
              <CrewCard
                member={member}
                index={i}
                onClick={() => setSelected(member)}
              />
            </div>
          );
        })}
      </div>

      {/* Modal */}
      <CrewModal member={selected} onClose={() => setSelected(null)} />
    </>
  );
}
