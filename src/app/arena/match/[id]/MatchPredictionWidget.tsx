"use client";

/**
 * MatchPredictionWidget
 * ─────────────────────
 * Inline pick form for any WC26 match.
 * Uses match_id = String(fdMatch.id) — no dependency on legacy PREDICTION_MATCHES.
 *
 * States:
 *  - not logged in → prompt to sign in (links to /predictions for OAuth)
 *  - locked (past kickoff) + no pick → "Picks are closed"
 *  - locked + has pick → show pick summary; post-match show vs actual result
 *  - open → pick winner + score; auto-save on change
 */

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Check, Lock, LogIn, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { isMatchFinished, isMatchLive, getFlag } from "@/lib/football-data";
import type { FDMatch } from "@/lib/football-data";

// ── Types ────────────────────────────────────────────────────────

interface PickState {
  winner: string | null;
  score_home: number | null;
  score_away: number | null;
}

// ── Component ────────────────────────────────────────────────────

export default function MatchPredictionWidget({ match }: { match: FDMatch }) {
  const supabase = createClient();

  const matchIdStr = String(match.id);
  const homeFlag = getFlag(match.homeTeam.name);
  const awayFlag = getFlag(match.awayTeam.name);

  const finished = isMatchFinished(match.status);
  const live = isMatchLive(match.status);
  const locked = live || finished || new Date() >= new Date(match.utcDate);

  // Auth
  const [userId, setUserId] = useState<string | null>(null);
  const [predictorId, setPredictorId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Pick
  const [pick, setPick] = useState<PickState>({ winner: null, score_home: null, score_away: null });
  const [pickExists, setPickExists] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Load auth + predictor + existing pick ─────────────────────
  const init = useCallback(async () => {
    setAuthLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      setAuthLoading(false);
      return;
    }
    setUserId(session.user.id);

    // Load predictor
    const { data: pred } = await supabase
      .from("predictors")
      .select("id")
      .eq("user_id", session.user.id)
      .single();

    if (!pred) {
      setAuthLoading(false);
      return;
    }
    setPredictorId(pred.id);

    // Load existing pick for this match
    const { data: existing } = await supabase
      .from("match_predictions")
      .select("winner, score_home, score_away")
      .eq("predictor_id", pred.id)
      .eq("match_id", matchIdStr)
      .single();

    if (existing) {
      setPick({
        winner: existing.winner ?? null,
        score_home: existing.score_home ?? null,
        score_away: existing.score_away ?? null,
      });
      setPickExists(true);
      setSaved(true);
    }

    setAuthLoading(false);
  }, [supabase, matchIdStr]);

  useEffect(() => {
    init();
  }, [init]);

  // ── Save pick ─────────────────────────────────────────────────
  const savePick = useCallback(
    async (updated: PickState) => {
      if (!predictorId || locked) return;
      setSaving(true);
      setError(null);
      setSaved(false);

      const payload = {
        predictor_id: predictorId,
        match_id: matchIdStr,
        winner: updated.winner,
        score_home: updated.score_home,
        score_away: updated.score_away,
        updated_at: new Date().toISOString(),
      };

      const { error: err } = pickExists
        ? await supabase
            .from("match_predictions")
            .update(payload)
            .eq("predictor_id", predictorId)
            .eq("match_id", matchIdStr)
        : await supabase.from("match_predictions").insert(payload);

      if (err) {
        setError(err.message);
      } else {
        setPickExists(true);
        setSaved(true);
      }
      setSaving(false);
    },
    [supabase, predictorId, matchIdStr, pickExists, locked]
  );

  const handleWinner = (v: string) => {
    const updated = { ...pick, winner: v };
    setPick(updated);
    savePick(updated);
  };

  const handleScoreBlur = () => {
    savePick(pick);
  };

  // ── Actual result display (post-match) ────────────────────────
  const actualWinner =
    finished && match.score.winner === "HOME_TEAM"
      ? match.homeTeam.name
      : finished && match.score.winner === "AWAY_TEAM"
      ? match.awayTeam.name
      : finished
      ? "Draw"
      : null;

  const predictedCorrectWinner =
    actualWinner !== null && pick.winner === actualWinner;

  const predictedExactScore =
    finished &&
    predictedCorrectWinner &&
    pick.score_home !== null &&
    pick.score_away !== null &&
    match.score.fullTime.home !== null &&
    match.score.fullTime.away !== null &&
    pick.score_home === match.score.fullTime.home &&
    pick.score_away === match.score.fullTime.away;

  // ── Loading ───────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div
        className="rounded-2xl p-5 flex items-center justify-center gap-2"
        style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--color-border)" }}
      >
        <Loader2 size={16} className="animate-spin" style={{ color: "var(--color-muted)" }} />
        <span className="text-sm" style={{ color: "var(--color-muted)" }}>
          Loading prediction...
        </span>
      </div>
    );
  }

  // ── Not logged in ─────────────────────────────────────────────
  if (!userId) {
    if (finished) return null; // no point showing sign-in after the match
    return (
      <div
        className="rounded-2xl p-5 flex flex-col items-center gap-3 text-center"
        style={{
          backgroundColor: "color-mix(in srgb, var(--color-accent) 6%, transparent)",
          border: "1.5px solid color-mix(in srgb, var(--color-accent) 25%, transparent)",
        }}
      >
        <p className="text-sm font-bold" style={{ color: "var(--color-text)" }}>
          Make your prediction
        </p>
        <p className="text-xs" style={{ color: "var(--color-muted)" }}>
          Sign in to pick a winner, predict the score, and compete on the leaderboard.
        </p>
        <Link
          href="/predictions"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all hover:opacity-80"
          style={{ backgroundColor: "var(--color-accent)", color: "var(--color-accent-text)" }}
        >
          <LogIn size={15} /> Sign in to predict
        </Link>
      </div>
    );
  }

  // ── No predictor profile yet ──────────────────────────────────
  if (!predictorId) {
    if (finished) return null;
    return (
      <div
        className="rounded-2xl p-5 flex flex-col items-center gap-3 text-center"
        style={{
          backgroundColor: "color-mix(in srgb, var(--color-accent) 6%, transparent)",
          border: "1.5px solid color-mix(in srgb, var(--color-accent) 25%, transparent)",
        }}
      >
        <p className="text-sm font-bold" style={{ color: "var(--color-text)" }}>
          Complete your profile first
        </p>
        <p className="text-xs" style={{ color: "var(--color-muted)" }}>
          Pick a display name and emoji to start predicting.
        </p>
        <Link
          href="/predictions"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all hover:opacity-80"
          style={{ backgroundColor: "var(--color-accent)", color: "var(--color-accent-text)" }}
        >
          Set up profile →
        </Link>
      </div>
    );
  }

  // ── Locked + no pick ──────────────────────────────────────────
  if (locked && !pickExists) {
    if (finished) {
      return (
        <div
          className="rounded-2xl p-4 flex items-center gap-2 text-sm"
          style={{
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--color-border)",
            color: "var(--color-muted)",
          }}
        >
          <Lock size={14} />
          You didn&apos;t predict this match.
        </div>
      );
    }
    return (
      <div
        className="rounded-2xl p-4 flex items-center gap-2 text-sm"
        style={{
          backgroundColor: "rgba(239,68,68,0.06)",
          border: "1px solid rgba(239,68,68,0.2)",
          color: "rgb(239,68,68)",
        }}
      >
        <Lock size={14} />
        Picks are locked — match has started.
      </div>
    );
  }

  // ── Post-match with pick: result comparison banner ────────────
  if (finished && pickExists) {
    const pts = predictedExactScore ? 4 : predictedCorrectWinner ? 1 : 0;
    return (
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          backgroundColor: "var(--bg-surface)",
          border: `1px solid ${predictedCorrectWinner ? "rgba(34,197,94,0.35)" : "var(--color-border)"}`,
        }}
      >
        <div
          className="px-5 py-3 flex items-center justify-between"
          style={{ borderBottom: "1px solid var(--color-border)" }}
        >
          <span className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--color-muted)" }}>
            Your Prediction
          </span>
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{
              backgroundColor: pts > 0 ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.08)",
              color: pts > 0 ? "rgb(34,197,94)" : "rgb(239,68,68)",
              border: `1px solid ${pts > 0 ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.2)"}`,
            }}
          >
            {pts > 0 ? `+${pts} pts` : "No points"}
          </span>
        </div>

        <div className="px-5 py-4 grid grid-cols-2 gap-3 text-sm">
          {/* Predicted */}
          <div>
            <p className="text-xs font-semibold mb-1" style={{ color: "var(--color-muted)" }}>
              You picked
            </p>
            <p className="font-black" style={{ color: predictedCorrectWinner ? "rgb(34,197,94)" : "var(--color-text)" }}>
              {pick.winner === match.homeTeam.name
                ? `${homeFlag} ${match.homeTeam.shortName || match.homeTeam.name}`
                : pick.winner === match.awayTeam.name
                ? `${awayFlag} ${match.awayTeam.shortName || match.awayTeam.name}`
                : pick.winner === "Draw"
                ? "🤝 Draw"
                : "—"}
            </p>
            {pick.score_home !== null && pick.score_away !== null && (
              <p
                className="text-lg font-black tabular-nums mt-0.5"
                style={{ color: predictedExactScore ? "rgb(34,197,94)" : "var(--color-text)" }}
              >
                {pick.score_home}–{pick.score_away}
              </p>
            )}
          </div>

          {/* Actual */}
          <div>
            <p className="text-xs font-semibold mb-1" style={{ color: "var(--color-muted)" }}>
              Actual result
            </p>
            <p className="font-black" style={{ color: "var(--color-text)" }}>
              {match.score.winner === "HOME_TEAM"
                ? `${homeFlag} ${match.homeTeam.shortName || match.homeTeam.name}`
                : match.score.winner === "AWAY_TEAM"
                ? `${awayFlag} ${match.awayTeam.shortName || match.awayTeam.name}`
                : "🤝 Draw"}
            </p>
            <p className="text-lg font-black tabular-nums mt-0.5" style={{ color: "var(--color-accent)" }}>
              {match.score.fullTime.home}–{match.score.fullTime.away}
            </p>
          </div>
        </div>

        {predictedCorrectWinner && (
          <div
            className="px-5 py-2.5 text-xs font-semibold flex items-center gap-1.5"
            style={{
              borderTop: "1px solid rgba(34,197,94,0.2)",
              backgroundColor: "rgba(34,197,94,0.06)",
              color: "rgb(34,197,94)",
            }}
          >
            <Check size={12} />
            {predictedExactScore ? "Exact score — 4 points! 🎯" : "Correct winner — 1 point ✅"}
          </div>
        )}
      </div>
    );
  }

  // ── Open prediction form ──────────────────────────────────────
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--color-border)" }}
    >
      {/* Header */}
      <div
        className="px-5 py-3 flex items-center justify-between"
        style={{ borderBottom: "1px solid var(--color-border)" }}
      >
        <span className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--color-muted)" }}>
          Your Prediction
        </span>
        <div className="flex items-center gap-2">
          {saving && (
            <Loader2 size={12} className="animate-spin" style={{ color: "var(--color-muted)" }} />
          )}
          {saved && !saving && (
            <span
              className="text-xs font-semibold flex items-center gap-1"
              style={{ color: "rgb(34,197,94)" }}
            >
              <Check size={11} /> Saved
            </span>
          )}
          {error && (
            <span className="text-xs" style={{ color: "rgb(239,68,68)" }}>
              {error}
            </span>
          )}
        </div>
      </div>

      <div className="px-5 py-4 flex flex-col gap-4">
        {/* Winner */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--color-muted)" }}>
            Who wins?
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { v: match.homeTeam.name, label: `${homeFlag} ${match.homeTeam.shortName || match.homeTeam.name}` },
              { v: "Draw", label: "🤝 Draw" },
              { v: match.awayTeam.name, label: `${awayFlag} ${match.awayTeam.shortName || match.awayTeam.name}` },
            ].map(({ v, label }) => {
              const sel = pick.winner === v;
              return (
                <button
                  key={v}
                  onClick={() => handleWinner(v)}
                  disabled={locked}
                  className="px-2 py-2.5 rounded-xl text-xs font-semibold text-center transition-all disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: sel ? "var(--color-accent)" : "var(--bg-page)",
                    border: `1.5px solid ${sel ? "var(--color-accent)" : "var(--color-border)"}`,
                    color: sel ? "var(--color-accent-text)" : "var(--color-text)",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Score */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--color-muted)" }}>
            Score prediction
          </p>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={0}
              max={20}
              disabled={locked}
              value={pick.score_home ?? ""}
              onChange={(e) =>
                setPick((p) => ({
                  ...p,
                  score_home: e.target.value === "" ? null : Number(e.target.value),
                }))
              }
              onBlur={handleScoreBlur}
              placeholder="0"
              className="w-16 px-3 py-2 rounded-xl text-center font-bold outline-none"
              style={{
                backgroundColor: "var(--bg-page)",
                border: "1px solid var(--color-border)",
                color: "var(--color-text)",
              }}
            />
            <span className="font-black text-lg" style={{ color: "var(--color-muted)" }}>
              –
            </span>
            <input
              type="number"
              min={0}
              max={20}
              disabled={locked}
              value={pick.score_away ?? ""}
              onChange={(e) =>
                setPick((p) => ({
                  ...p,
                  score_away: e.target.value === "" ? null : Number(e.target.value),
                }))
              }
              onBlur={handleScoreBlur}
              placeholder="0"
              className="w-16 px-3 py-2 rounded-xl text-center font-bold outline-none"
              style={{
                backgroundColor: "var(--bg-page)",
                border: "1px solid var(--color-border)",
                color: "var(--color-text)",
              }}
            />
          </div>
        </div>

        {/* Points breakdown hint */}
        <p className="text-xs" style={{ color: "var(--color-muted)" }}>
          Correct winner: <strong>1 pt</strong> · Exact score: <strong>+3 pts</strong> · Picks lock at kick-off.
        </p>
      </div>
    </div>
  );
}
