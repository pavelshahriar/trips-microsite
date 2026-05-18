"use client";

import { useState } from "react";
import { useTheme } from "./ThemeProvider";
import { THEMES } from "@/lib/themes";

export default function ThemePicker() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  const current = THEMES.find((t) => t.id === theme) ?? THEMES[0];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {/* Options — slide up when open */}
      {open && (
        <div className="flex flex-col gap-2 items-end mb-1">
          {THEMES.map((t) => {
            const isActive = t.id === theme;
            return (
              <button
                key={t.id}
                onClick={() => { setTheme(t.id); setOpen(false); }}
                className="flex items-center gap-2.5 pl-3 pr-4 py-2 rounded-full text-sm font-semibold shadow-lg transition-all duration-200 hover:scale-105"
                style={{
                  background: isActive ? "var(--color-accent)" : "var(--bg-surface)",
                  color: isActive ? "var(--color-accent-text)" : "var(--color-text)",
                  border: `1.5px solid ${isActive ? "var(--color-accent)" : "var(--color-border)"}`,
                  boxShadow: "0 4px 20px var(--color-card-shadow)",
                }}
              >
                <span className="text-xl leading-none">{t.emoji}</span>
                <span>{t.name}</span>
                {isActive && <span className="text-xs opacity-70">✓</span>}
              </button>
            );
          })}
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 pl-3 pr-4 py-2.5 rounded-full font-semibold text-sm shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
        style={{
          background: "var(--color-accent)",
          color: "var(--color-accent-text)",
          boxShadow: "0 4px 24px var(--color-card-shadow)",
        }}
        aria-label="Change theme"
      >
        <span className="text-xl leading-none">{current.emoji}</span>
        <span>{open ? "Close" : current.name}</span>
        <span
          className="text-xs transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", display: "inline-block" }}
        >
          ▲
        </span>
      </button>
    </div>
  );
}
