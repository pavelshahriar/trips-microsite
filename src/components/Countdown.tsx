"use client";

import { useEffect, useState } from "react";
import { TRIP_META } from "@/data/trip";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeLeft(target: string): TimeLeft {
  const now = new Date().getTime();
  const end = new Date(target).getTime();
  const diff = Math.max(0, end - now);

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

interface FlipUnitProps {
  value: number;
  label: string;
}

function CountUnit({ value, label }: FlipUnitProps) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="rounded-xl px-4 py-3 min-w-[64px] sm:min-w-[80px] text-center shadow-lg"
        style={{
          background: "var(--color-stat-bg)",
          border: "1px solid var(--color-stat-border)",
        }}
      >
        <span
          className="text-3xl sm:text-4xl font-black tabular-nums"
          style={{ color: "var(--color-hero-text)" }}
        >
          {pad(value)}
        </span>
      </div>
      <span
        className="text-xs mt-2 uppercase tracking-widest"
        style={{ color: "var(--color-hero-muted)" }}
      >
        {label}
      </span>
    </div>
  );
}

export default function Countdown() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(
    getTimeLeft(TRIP_META.countdownTarget)
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(TRIP_META.countdownTarget));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const tripStarted =
    new Date().getTime() > new Date(TRIP_META.countdownTarget).getTime();

  if (!mounted) {
    return (
      <div className="flex items-center justify-center gap-3 sm:gap-4">
        {["Days", "Hrs", "Min", "Sec"].map((label) => (
          <CountUnit key={label} value={0} label={label} />
        ))}
      </div>
    );
  }

  if (tripStarted) {
    return (
      <div className="bg-gold/10 border border-gold/30 rounded-2xl px-8 py-4 inline-block">
        <p className="text-gold font-bold text-lg">🚐 The trip is ON!</p>
        <p className="text-slate-400 text-sm mt-1">June 10–20, 2026</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-slate-500 text-xs uppercase tracking-widest mb-4">
        Countdown to trip start
      </p>
      <div className="flex items-center justify-center gap-3 sm:gap-4">
        <CountUnit value={timeLeft.days} label="Days" />
        <span className="text-2xl font-black text-navy-600 mb-6">:</span>
        <CountUnit value={timeLeft.hours} label="Hrs" />
        <span className="text-2xl font-black text-navy-600 mb-6">:</span>
        <CountUnit value={timeLeft.minutes} label="Min" />
        <span className="text-2xl font-black text-navy-600 mb-6">:</span>
        <CountUnit value={timeLeft.seconds} label="Sec" />
      </div>
    </div>
  );
}
