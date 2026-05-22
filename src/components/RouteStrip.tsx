"use client";

import { motion } from "framer-motion";
import { ROUTE } from "@/data/trip";
import { ChevronRight } from "lucide-react";

export default function RouteStrip() {
  return (
    <section
      className="py-8 overflow-x-auto"
      style={{
        backgroundColor: "var(--bg-surface)",
        borderBottom: "1px solid var(--color-border)",
        boxShadow: "0 4px 24px var(--color-card-shadow)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <p
          className="text-xs uppercase tracking-widest mb-4 text-center"
          style={{ color: "var(--color-muted)" }}
        >
          The Route
        </p>
        <div className="flex items-center justify-start sm:justify-center gap-1 min-w-max mx-auto px-2">
          {ROUTE.map((stop, i) => (
            <motion.div
              key={stop.city}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-1"
            >
              <div className="flex flex-col items-center group">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-xl transition-all duration-200"
                  style={{
                    background: "var(--bg-surface)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  {stop.emoji}
                </div>
                <span
                  className="text-[11px] mt-1 transition-colors duration-200 group-hover:opacity-100"
                  style={{ color: "var(--color-muted)", opacity: 0.7 }}
                >
                  {stop.abbr}
                </span>
              </div>
              {i < ROUTE.length - 1 && (
                <ChevronRight
                  size={14}
                  className="mx-0.5 flex-shrink-0"
                  style={{ color: "var(--color-border)" }}
                />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
