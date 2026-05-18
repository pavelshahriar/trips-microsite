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

  return (
    <>
      {/* Crew grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-12">
        {crew.map((member, i) => (
          <CrewCard
            key={member.name}
            member={member}
            index={i}
            onClick={() => setSelected(member)}
          />
        ))}
      </div>

      {/* Modal */}
      <CrewModal member={selected} onClose={() => setSelected(null)} />
    </>
  );
}
