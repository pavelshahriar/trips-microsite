"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { createClient } from "@/lib/supabase-browser";
import type { User } from "@supabase/supabase-js";
import {
  TOURNAMENT_QUESTIONS,
  PREDICTION_MATCHES,
  EMOJI_OPTIONS,
  type TournamentPicks,
  type MatchPick,
} from "@/data/predictions";
import type { FDMatch } from "@/lib/football-data";
import {
  getFlag,
  formatKickoff,
  isMatchLocked,
  isMatchLive,
} from "@/lib/football-data";
import { LogOut, ChevronRight, Check, Users, Lock } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";
import {
  calculateScore,
  calculateScoreFromResults,
  buildResultsMap,
  hasAnyResult,
  type MatchResultData,
} from "@/lib/scoring";
import { MATCH_RESULTS } from "@/data/results";

// ── Module-level helpers ──────────────────────────────────────────

/** Return "YYYY-MM-DD" in the visitor's local timezone */
function localDateStr(utcDateStr: string): string {
  const d = new Date(utcDateStr);
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}

/** Group FD matches by the visitor's local calendar date */
function groupMatchesByLocalDate(
  matches: FDMatch[]
): Record<string, FDMatch[]> {
  const groups: Record<string, FDMatch[]> = {};
  for (const match of matches) {
    const key = localDateStr(match.utcDate);
    if (!groups[key]) groups[key] = [];
    groups[key].push(match);
  }
  return groups;
}

/** Format "YYYY-MM-DD" for date tab buttons */
function formatTabDate(dateStr: string): {
  dayNum: string;
  dayName: string;
  monthAbr: string;
} {
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day, 12, 0, 0);
  return {
    dayNum: d.toLocaleDateString("en-US", { day: "numeric" }),
    dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
    monthAbr: d.toLocaleDateString("en-US", { month: "short" }),
  };
}

// The 3 crew matches: Germany (June 14), Argentina (June 16), Brazil (June 19)
const CREW_DATES = new Set(["2026-06-14", "2026-06-16", "2026-06-19"]);
const CREW_TEAMS = new Set(["Germany", "Argentina", "Brazil"]);

function isFDCrewMatch(match: FDMatch): boolean {
  if (!CREW_DATES.has(localDateStr(match.utcDate))) return false;
  return (
    CREW_TEAMS.has(match.homeTeam.name ?? "") || CREW_TEAMS.has(match.awayTeam.name ?? "")
  );
}

/** Map an FD crew match back to its legacy DB pick ID for backwards-compat */
function legacyCrewId(match: FDMatch): string | null {
  const d = localDateStr(match.utcDate);
  if (d === "2026-06-14") return "houston-germany";
  if (d === "2026-06-16") return "kc-argentina";
  if (d === "2026-06-19") return "philly-brazil";
  return null;
}

/**
 * Curated scorer pill list for crew matches (from static PREDICTION_MATCHES).
 * Returns null for non-crew matches → show a free-text input instead.
 */
function crewMatchScorers(match: FDMatch): string[] | null {
  const legId = legacyCrewId(match);
  if (!legId) return null;
  return PREDICTION_MATCHES.find((m) => m.id === legId)?.scorers ?? null;
}

// ── Types ─────────────────────────────────────────────────────────

type Step = "login" | "profile" | "tournament" | "matches" | "leaderboard";

interface Predictor {
  id: string;
  display_name: string;
  emoji: string;
  avatar_url?: string;
}

interface LeaderboardEntry {
  predictor: Predictor;
  tournament: Partial<TournamentPicks> | null;
  matches: MatchPick[];
}

interface PredictionsClientProps {
  matches: FDMatch[];
}

export default function PredictionsClient({ matches }: PredictionsClientProps) {
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [predictor, setPredictor] = useState<Predictor | null>(null);
  const [step, setStep] = useState<Step>("login");
  const [loading, setLoading] = useState(true);

  // Profile setup
  const [displayName, setDisplayName] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("⚽");

  // Tournament picks
  const [tournamentPicks, setTournamentPicks] =
    useState<Partial<TournamentPicks>>({});
  const [tournamentSaved, setTournamentSaved] = useState(false);

  // Match picks
  const [matchPicks, setMatchPicks] = useState<
    Record<string, Partial<MatchPick>>
  >({});

  // Leaderboard
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [liveResults, setLiveResults] = useState<Record<
    string,
    MatchResultData
  > | null>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Matches tab state ──────────────────────────────────────────
  const matchesByDate = useMemo(
    () => groupMatchesByLocalDate(matches),
    [matches]
  );
  const sortedMatchDates = useMemo(
    () => Object.keys(matchesByDate).sort(),
    [matchesByDate]
  );

  // Start with "" — set properly client-side in useEffect below
  const [matchesDate, setMatchesDate] = useState("");
  const [highlightMatchId, setHighlightMatchId] = useState<string | null>(null);

  // Refs used to scroll to the highlighted match card
  const matchCardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // FD match lookup for leaderboard badge display
  const matchById = useMemo(() => {
    const map: Record<string, FDMatch> = {};
    matches.forEach((m) => {
      map[m.id.toString()] = m;
    });
    return map;
  }, [matches]);

  // Initialise date + highlight from URL params (client-only)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const matchParam = params.get("match");
    if (matchParam) {
      setHighlightMatchId(matchParam);
      const fdMatch = matches.find((m) => m.id.toString() === matchParam);
      if (fdMatch) {
        setMatchesDate(localDateStr(fdMatch.utcDate));
        return;
      }
    }
    // Default: first date that is today or later
    const today = localDateStr(new Date().toISOString());
    const dates = Object.keys(groupMatchesByLocalDate(matches)).sort();
    setMatchesDate(dates.find((d) => d >= today) ?? dates[0] ?? today);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Auth state ─────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  // ── Load predictor profile once user is known ──────────────────
  const loadPredictor = useCallback(
    async (userId: string) => {
      const { data } = await supabase
        .from("predictors")
        .select("*")
        .eq("user_id", userId)
        .single();
      return data as Predictor | null;
    },
    [supabase]
  );

  const loadExistingPicks = useCallback(
    async (predictorId: string) => {
      const [{ data: tData }, { data: mData }] = await Promise.all([
        supabase
          .from("tournament_predictions")
          .select("*")
          .eq("predictor_id", predictorId)
          .single(),
        supabase
          .from("match_predictions")
          .select("*")
          .eq("predictor_id", predictorId),
      ]);
      if (tData) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, predictor_id, created_at, updated_at, ...picks } = tData;
        setTournamentPicks(picks as Partial<TournamentPicks>);
        setTournamentSaved(true);
      }
      if (mData && mData.length > 0) {
        const byMatch: Record<string, Partial<MatchPick>> = {};
        mData.forEach(
          (m: MatchPick & { id: string; predictor_id: string }) => {
            byMatch[m.match_id] = {
              match_id: m.match_id,
              winner: m.winner,
              score_home: m.score_home,
              score_away: m.score_away,
              first_scorer: m.first_scorer,
              var_controversy: m.var_controversy,
            };
          }
        );
        setMatchPicks(byMatch);
      }
    },
    [supabase]
  );

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setStep("login");
      return;
    }
    (async () => {
      setLoading(true);
      const p = await loadPredictor(user.id);
      if (p) {
        setPredictor(p);
        await loadExistingPicks(p.id);

        const params = new URLSearchParams(window.location.search);
        const tabParam = params.get("tab") as Step | null;
        const matchParam = params.get("match");
        const validTabs: Step[] = ["tournament", "matches", "leaderboard"];

        // If ?match= present, jump to the right date and set highlight
        if (matchParam) {
          setHighlightMatchId(matchParam);
          const fdMatch = matches.find((m) => m.id.toString() === matchParam);
          if (fdMatch) setMatchesDate(localDateStr(fdMatch.utcDate));
        }

        setStep(
          tabParam && validTabs.includes(tabParam) ? tabParam : "tournament"
        );
      } else {
        const name =
          user.user_metadata?.full_name || user.user_metadata?.name || "";
        setDisplayName(name);
        setStep("profile");
      }
      setLoading(false);
    })();
  }, [user, loadPredictor, loadExistingPicks, matches]);

  // ── Scroll to highlighted card when Matches tab is active ──────
  useEffect(() => {
    if (!highlightMatchId || step !== "matches") return;
    const t = setTimeout(() => {
      matchCardRefs.current[highlightMatchId]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 350);
    return () => clearTimeout(t);
  }, [highlightMatchId, step, matchesDate]);

  // ── Auth handlers ──────────────────────────────────────────────
  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.href }, // preserve ?tab=&match= through OAuth
    });
  };

  const signInWithFacebook = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "facebook",
      options: { redirectTo: window.location.href },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setPredictor(null);
    setTournamentPicks({});
    setMatchPicks({});
    setStep("login");
  };

  // ── Save profile ───────────────────────────────────────────────
  const saveProfile = async () => {
    if (!user || !displayName.trim()) return;
    setSaving(true);
    setError(null);
    const { data, error: err } = await supabase
      .from("predictors")
      .insert({
        user_id: user.id,
        display_name: displayName.trim(),
        emoji: selectedEmoji,
        avatar_url: user.user_metadata?.avatar_url,
      })
      .select()
      .single();
    if (err) {
      setError(err.message);
      setSaving(false);
      return;
    }
    setPredictor(data as Predictor);
    setSaving(false);
    setStep("tournament");
  };

  // ── Save tournament picks ──────────────────────────────────────
  const saveTournamentPicks = async () => {
    if (!predictor) return;
    setSaving(true);
    setError(null);
    const payload = {
      predictor_id: predictor.id,
      ...tournamentPicks,
      updated_at: new Date().toISOString(),
    };
    const { error: err } = tournamentSaved
      ? await supabase
          .from("tournament_predictions")
          .update(payload)
          .eq("predictor_id", predictor.id)
      : await supabase.from("tournament_predictions").insert(payload);
    if (err) {
      setError(err.message);
      setSaving(false);
      return;
    }
    setTournamentSaved(true);
    setSaving(false);
    setStep("matches");
  };

  // ── Pick lookup: FD ID first, then legacy crew ID ──────────────
  const getPickForFDMatch = useCallback(
    (fdMatch: FDMatch): Partial<MatchPick> => {
      const fdId = fdMatch.id.toString();
      if (matchPicks[fdId]) return matchPicks[fdId];
      const legId = legacyCrewId(fdMatch);
      if (legId && matchPicks[legId]) return matchPicks[legId];
      return {};
    },
    [matchPicks]
  );

  // ── Save a match pick ──────────────────────────────────────────
  const saveMatchPick = useCallback(
    async (matchId: string, pick: Partial<MatchPick>) => {
      if (!predictor) return;

      // Lock check: FD utcDate if available, otherwise legacy static kickoff
      const fdMatch = matches.find((m) => m.id.toString() === matchId);
      const kickoffStr =
        fdMatch?.utcDate ??
        PREDICTION_MATCHES.find((m) => m.id === matchId)?.kickoff;
      if (kickoffStr && new Date() > new Date(kickoffStr)) return;

      // Migration: if user already has a pick under the legacy crew ID,
      // update that DB row (change its match_id to the new FD ID) instead
      // of inserting a duplicate.
      const legId = fdMatch ? legacyCrewId(fdMatch) : null;
      const hasLegacyPick = legId ? !!matchPicks[legId]?.match_id : false;
      const hasNewPick = !!matchPicks[matchId]?.match_id;

      const payload = {
        predictor_id: predictor.id,
        match_id: matchId,
        ...pick,
        updated_at: new Date().toISOString(),
      };

      if (hasNewPick) {
        await supabase
          .from("match_predictions")
          .update(payload)
          .eq("predictor_id", predictor.id)
          .eq("match_id", matchId);
      } else if (hasLegacyPick && legId) {
        // Migrate legacy row: overwrite match_id to FD ID
        await supabase
          .from("match_predictions")
          .update(payload)
          .eq("predictor_id", predictor.id)
          .eq("match_id", legId);
        setMatchPicks((prev) => {
          const next = { ...prev };
          delete next[legId];
          next[matchId] = { match_id: matchId, ...pick };
          return next;
        });
        return;
      } else {
        await supabase.from("match_predictions").insert(payload);
      }

      setMatchPicks((prev) => ({
        ...prev,
        [matchId]: { match_id: matchId, ...pick },
      }));
    },
    [predictor, matches, matchPicks, supabase]
  );

  // ── Load leaderboard ───────────────────────────────────────────
  const loadLeaderboard = useCallback(async () => {
    setLeaderboardLoading(true);
    const [supabaseResults, apiResponse] = await Promise.all([
      Promise.all([
        supabase.from("predictors").select("*").order("created_at"),
        supabase.from("tournament_predictions").select("*"),
        supabase.from("match_predictions").select("*"),
      ]),
      fetch("/api/arena/results")
        .then((r) => r.json())
        .catch(() => ({ results: {} })),
    ]);
    const [{ data: preds }, { data: tPicks }, { data: mPicks }] =
      supabaseResults;
    if (!preds) {
      setLeaderboardLoading(false);
      return;
    }
    const apiResults: Record<string, MatchResultData> =
      apiResponse?.results ?? {};
    const unified = buildResultsMap(apiResults);
    setLiveResults(unified);
    const entries: LeaderboardEntry[] = preds.map((p: Predictor) => ({
      predictor: p,
      tournament:
        tPicks?.find(
          (t: { predictor_id: string }) => t.predictor_id === p.id
        ) ?? null,
      matches: (mPicks ?? []).filter(
        (m: MatchPick & { predictor_id: string }) => m.predictor_id === p.id
      ),
    }));
    setLeaderboard(entries);
    setLeaderboardLoading(false);
  }, [supabase]);

  useEffect(() => {
    if (step === "leaderboard") loadLeaderboard();
  }, [step, loadLeaderboard]);

  // ── Render ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div
          className="w-8 h-8 border-2 rounded-full animate-spin"
          style={{
            borderColor: "var(--color-accent)",
            borderTopColor: "transparent",
          }}
        />
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <SectionHeader
            label="The Prediction Game"
            title="WC26 Predictions"
            subtitle="Pick your winners. Back your bets. No take-backs."
          />
          {predictor && (
            <div className="flex items-center gap-3">
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold"
                style={{
                  backgroundColor: "var(--bg-surface)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-text)",
                }}
              >
                <span className="text-lg">{predictor.emoji}</span>
                <span>{predictor.display_name}</span>
              </div>
              <button
                onClick={signOut}
                className="p-2 rounded-xl transition-colors"
                style={{
                  backgroundColor: "var(--bg-surface)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-muted)",
                }}
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Step nav pills */}
        {user && predictor && (
          <div className="flex gap-2 mb-8 flex-wrap">
            {[
              { key: "tournament", label: "🏆 Tournament" },
              { key: "matches", label: "⚽ Matches" },
              { key: "leaderboard", label: "👥 Leaderboard" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setStep(key as Step)}
                className="px-4 py-2 rounded-full text-sm font-semibold transition-all"
                style={{
                  backgroundColor:
                    step === key ? "var(--color-accent)" : "var(--bg-surface)",
                  color:
                    step === key
                      ? "var(--color-accent-text)"
                      : "var(--color-muted)",
                  border: "1px solid var(--color-border)",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl text-sm text-red-400 bg-red-400/10 border border-red-400/20">
            {error}
          </div>
        )}

        {/* ── STEP: LOGIN ── */}
        {step === "login" && (
          <div
            className="rounded-2xl p-8 text-center"
            style={{
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--color-border)",
            }}
          >
            <div className="text-5xl mb-4">🏆</div>
            <h2
              className="text-2xl font-black mb-2"
              style={{ color: "var(--color-text)" }}
            >
              Join the prediction game
            </h2>
            <p
              className="text-sm mb-8 max-w-sm mx-auto"
              style={{ color: "var(--color-muted)" }}
            >
              One prediction per person. Sign in to lock in your picks and see
              how everyone else is calling it.
            </p>
            <div className="flex flex-col gap-3 max-w-xs mx-auto">
              <button
                onClick={signInWithGoogle}
                className="flex items-center justify-center gap-3 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90"
                style={{
                  backgroundColor: "var(--color-text)",
                  color: "var(--bg-page)",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path
                    fill="#4285F4"
                    d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
                  />
                  <path
                    fill="#34A853"
                    d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"
                  />
                  <path
                    fill="#EA4335"
                    d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.96l3.007 2.332C4.672 5.163 6.656 3.58 9 3.58z"
                  />
                </svg>
                Continue with Google
              </button>
              <button
                onClick={signInWithFacebook}
                className="flex items-center justify-center gap-3 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90"
                style={{ backgroundColor: "#1877F2", color: "#fff" }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Continue with Facebook
              </button>
            </div>
            <p className="text-xs mt-6" style={{ color: "var(--color-muted)" }}>
              No spam. Just predictions. Your email stays private.
            </p>
          </div>
        )}

        {/* ── STEP: PROFILE SETUP ── */}
        {step === "profile" && (
          <div
            className="rounded-2xl p-8"
            style={{
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--color-border)",
            }}
          >
            <h2
              className="text-xl font-black mb-1"
              style={{ color: "var(--color-text)" }}
            >
              What should we call you?
            </h2>
            <p className="text-sm mb-6" style={{ color: "var(--color-muted)" }}>
              Pick a display name and emoji — this is how you&apos;ll appear on
              the leaderboard.
            </p>
            <div className="mb-6">
              <label
                className="block text-xs font-semibold uppercase tracking-widest mb-2"
                style={{ color: "var(--color-muted)" }}
              >
                Display name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Pavel, Rocky, El Showstopper..."
                maxLength={30}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  backgroundColor: "var(--bg-page)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-text)",
                }}
              />
            </div>
            <div className="mb-8">
              <label
                className="block text-xs font-semibold uppercase tracking-widest mb-3"
                style={{ color: "var(--color-muted)" }}
              >
                Pick your emoji
              </label>
              <div className="flex flex-wrap gap-2">
                {EMOJI_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setSelectedEmoji(emoji)}
                    className="w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all"
                    style={{
                      backgroundColor:
                        selectedEmoji === emoji
                          ? "var(--color-accent)"
                          : "var(--bg-page)",
                      border: `2px solid ${selectedEmoji === emoji ? "var(--color-accent)" : "var(--color-border)"}`,
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={saveProfile}
              disabled={!displayName.trim() || saving}
              className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              style={{
                backgroundColor: "var(--color-accent)",
                color: "var(--color-accent-text)",
              }}
            >
              {saving ? (
                "Saving..."
              ) : (
                <>
                  Let&apos;s go <ChevronRight size={16} />
                </>
              )}
            </button>
          </div>
        )}

        {/* ── STEP: TOURNAMENT PREDICTIONS ── */}
        {step === "tournament" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm" style={{ color: "var(--color-muted)" }}>
                {Object.keys(tournamentPicks).length}/
                {TOURNAMENT_QUESTIONS.length} questions answered
              </p>
              {tournamentSaved && (
                <span
                  className="text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1"
                  style={{
                    backgroundColor: "rgba(34,197,94,0.1)",
                    color: "rgb(34,197,94)",
                    border: "1px solid rgba(34,197,94,0.3)",
                  }}
                >
                  <Check size={12} /> Saved
                </span>
              )}
            </div>

            <div className="space-y-4">
              {TOURNAMENT_QUESTIONS.map((q) => (
                <div
                  key={q.id}
                  className="rounded-2xl p-5"
                  style={{
                    backgroundColor: "var(--bg-surface)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xl">{q.emoji}</span>
                    <h3
                      className="font-bold text-sm"
                      style={{ color: "var(--color-text)" }}
                    >
                      {q.question}
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {q.options.map((opt) => {
                      const selected = tournamentPicks[q.id] === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() =>
                            setTournamentPicks((prev) => ({
                              ...prev,
                              [q.id]: opt.value,
                            }))
                          }
                          className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all"
                          style={{
                            backgroundColor: selected
                              ? "var(--color-accent)"
                              : "var(--bg-page)",
                            border: `1.5px solid ${selected ? "var(--color-accent)" : "var(--color-border)"}`,
                            color: selected
                              ? "var(--color-accent-text)"
                              : "var(--color-text)",
                          }}
                        >
                          {opt.flag && <span>{opt.flag}</span>}
                          <span>{opt.label}</span>
                          {selected && (
                            <Check
                              size={12}
                              className="ml-auto flex-shrink-0"
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={saveTournamentPicks}
                disabled={
                  saving || Object.keys(tournamentPicks).length === 0
                }
                className="flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                style={{
                  backgroundColor: "var(--color-accent)",
                  color: "var(--color-accent-text)",
                }}
              >
                {saving ? (
                  "Saving..."
                ) : (
                  <>
                    {tournamentSaved ? "Update picks" : "Save & continue"}{" "}
                    <ChevronRight size={16} />
                  </>
                )}
              </button>
              <button
                onClick={() => setStep("matches")}
                className="px-5 py-3 rounded-xl font-semibold text-sm transition-all"
                style={{
                  backgroundColor: "var(--bg-surface)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-muted)",
                }}
              >
                Skip
              </button>
            </div>
          </div>
        )}

        {/* ── STEP: MATCH PREDICTIONS ── */}
        {step === "matches" && (
          <div>
            {matches.length === 0 ? (
              // ── Fallback: static list (API unavailable) ──────────────────
              <div className="space-y-4">
                {PREDICTION_MATCHES.map((match) => {
                  const locked =
                    new Date() > new Date(match.kickoff);
                  const pick = matchPicks[match.id] || {};
                  return (
                    <StaticMatchCard
                      key={match.id}
                      match={match}
                      pick={pick}
                      locked={locked}
                      onUpdate={(updated) => {
                        setMatchPicks((prev) => ({
                          ...prev,
                          [match.id]: updated,
                        }));
                        saveMatchPick(match.id, updated);
                      }}
                      onScoreBlur={() =>
                        saveMatchPick(match.id, {
                          ...pick,
                          match_id: match.id,
                        })
                      }
                    />
                  );
                })}
                <button
                  onClick={() => setStep("leaderboard")}
                  className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 mt-2"
                  style={{
                    backgroundColor: "var(--color-accent)",
                    color: "var(--color-accent-text)",
                  }}
                >
                  <Users size={16} /> See the leaderboard
                </button>
              </div>
            ) : (
              // ── Live FD matches with date-slider ─────────────────────────
              <>
                {/* Date tab strip */}
                <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-1 px-1 scrollbar-hide">
                  {sortedMatchDates.map((date) => {
                    const { dayNum, dayName, monthAbr } = formatTabDate(date);
                    const isSelected = date === matchesDate;
                    const hasLive = (matchesByDate[date] ?? []).some((m) =>
                      isMatchLive(m.status)
                    );
                    const hasCrew = (matchesByDate[date] ?? []).some(
                      isFDCrewMatch
                    );

                    return (
                      <button
                        key={date}
                        onClick={() => setMatchesDate(date)}
                        className="flex-shrink-0 flex flex-col items-center px-3 py-2 rounded-xl transition-all text-xs font-semibold relative"
                        style={{
                          backgroundColor: isSelected
                            ? "var(--color-accent)"
                            : "var(--bg-surface)",
                          color: isSelected
                            ? "var(--color-accent-text)"
                            : "var(--color-muted)",
                          border: `1px solid ${isSelected ? "var(--color-accent)" : "var(--color-border)"}`,
                          minWidth: "3.5rem",
                        }}
                      >
                        {hasLive && (
                          <span
                            className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-green-400"
                            title="Live"
                          />
                        )}
                        <span className="text-[10px] uppercase opacity-70">
                          {dayName}
                        </span>
                        <span className="text-sm font-black leading-tight">
                          {dayNum}
                        </span>
                        <span className="text-[10px] uppercase opacity-70">
                          {monthAbr}
                        </span>
                        {hasCrew && (
                          <span className="text-[10px] mt-0.5">⚽</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Date heading */}
                {matchesDate && (
                  <div className="mb-4 flex items-center justify-between">
                    <h2
                      className="text-base font-bold"
                      style={{ color: "var(--color-text)" }}
                    >
                      {(() => {
                        const [y, mo, d] = matchesDate.split("-").map(Number);
                        return new Date(
                          y,
                          mo - 1,
                          d,
                          12,
                          0,
                          0
                        ).toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                        });
                      })()}
                    </h2>
                    <span
                      className="text-xs"
                      style={{ color: "var(--color-muted)" }}
                    >
                      {(matchesByDate[matchesDate] ?? []).length} match
                      {(matchesByDate[matchesDate] ?? []).length !== 1
                        ? "es"
                        : ""}
                    </span>
                  </div>
                )}

                {/* Match cards for selected date */}
                <div className="space-y-4">
                  {(matchesByDate[matchesDate] ?? []).map((fdMatch) => {
                    const fdId = fdMatch.id.toString();
                    const locked = isMatchLocked(fdMatch.status);
                    const pick = getPickForFDMatch(fdMatch);
                    const crew = isFDCrewMatch(fdMatch);
                    const highlighted = highlightMatchId === fdId;
                    const scorers = crewMatchScorers(fdMatch);
                    const isTBD = !fdMatch.homeTeam.name || !fdMatch.awayTeam.name;
                    const homeName = fdMatch.homeTeam.name ?? "TBD";
                    const awayName = fdMatch.awayTeam.name ?? "TBD";
                    const homeShort = fdMatch.homeTeam.shortName ?? fdMatch.homeTeam.tla ?? homeName;
                    const awayShort = fdMatch.awayTeam.shortName ?? fdMatch.awayTeam.tla ?? awayName;
                    const homeFlag = getFlag(fdMatch.homeTeam.name);
                    const awayFlag = getFlag(fdMatch.awayTeam.name);

                    return (
                      <div
                        key={fdId}
                        ref={(el) => {
                          matchCardRefs.current[fdId] = el;
                        }}
                        className="rounded-2xl overflow-hidden transition-all"
                        style={{
                          backgroundColor: "var(--bg-surface)",
                          border: highlighted
                            ? `2px solid var(--color-accent)`
                            : crew
                            ? `1.5px solid var(--color-accent)`
                            : `1px solid var(--color-border)`,
                          opacity: locked ? 0.8 : 1,
                          boxShadow: highlighted
                            ? `0 0 0 4px color-mix(in srgb, var(--color-accent) 18%, transparent)`
                            : undefined,
                        }}
                      >
                        {/* Crew match banner */}
                        {crew && (
                          <div
                            className="px-4 py-1.5 text-xs font-bold flex items-center gap-1.5"
                            style={{
                              backgroundColor: "var(--color-accent)",
                              color: "var(--color-accent-text)",
                            }}
                          >
                            🎟️ Crew Match — we&apos;re there for this one
                          </div>
                        )}

                        <div className="p-5">
                          {/* Match header */}
                          <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
                            <div>
                              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                {locked && (
                                  <span
                                    className="text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                                    style={{
                                      backgroundColor:
                                        "rgba(239,68,68,0.1)",
                                      color: "rgb(239,68,68)",
                                      border:
                                        "1px solid rgba(239,68,68,0.3)",
                                    }}
                                  >
                                    <Lock size={10} /> Locked
                                  </span>
                                )}
                                {isMatchLive(fdMatch.status) && (
                                  <span
                                    className="text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                                    style={{
                                      backgroundColor:
                                        "rgba(34,197,94,0.15)",
                                      color: "rgb(34,197,94)",
                                      border:
                                        "1px solid rgba(34,197,94,0.3)",
                                    }}
                                  >
                                    🟢 Live
                                  </span>
                                )}
                              </div>
                              <p
                                className="font-black text-lg leading-tight"
                                style={{ color: "var(--color-text)" }}
                              >
                                {homeFlag}{" "}
                                {homeShort} vs{" "}
                                {awayShort} {awayFlag}
                              </p>
                              <p
                                className="text-xs mt-0.5"
                                style={{ color: "var(--color-muted)" }}
                              >
                                {formatKickoff(fdMatch.utcDate)}
                                {fdMatch.venue ? ` · ${fdMatch.venue}` : ""}
                              </p>
                            </div>
                            {pick.winner && (
                              <span
                                className="text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1"
                                style={{
                                  backgroundColor:
                                    "rgba(34,197,94,0.1)",
                                  color: "rgb(34,197,94)",
                                  border:
                                    "1px solid rgba(34,197,94,0.3)",
                                }}
                              >
                                <Check size={10} /> Picked
                              </span>
                            )}
                          </div>

                          {/* TBD notice for knockout matches where teams aren't known yet */}
                          {isTBD && (
                            <div
                              className="mb-4 px-4 py-3 rounded-xl text-sm text-center"
                              style={{
                                backgroundColor: "rgba(var(--color-muted-rgb, 100,116,139), 0.08)",
                                border: "1px dashed var(--color-border)",
                                color: "var(--color-muted)",
                              }}
                            >
                              ⏳ Teams TBD — picks open once qualifying results are confirmed
                            </div>
                          )}

                          {/* Winner pick */}
                          <div className="mb-4">
                            <p
                              className="text-xs font-semibold uppercase tracking-widest mb-2"
                              style={{ color: "var(--color-muted)" }}
                            >
                              Who wins?
                            </p>
                            <div className="grid grid-cols-3 gap-2">
                              {[
                                {
                                  v: homeName,
                                  label: `${homeFlag} ${homeShort}`,
                                },
                                { v: "draw", label: "🤝 Draw" },
                                {
                                  v: awayName,
                                  label: `${awayFlag} ${awayShort}`,
                                },
                              ].map(({ v, label }) => {
                                const sel = pick.winner === v;
                                return (
                                  <button
                                    key={v}
                                    disabled={locked || isTBD}
                                    onClick={() => {
                                      const updated = {
                                        ...pick,
                                        match_id: fdId,
                                        winner: v,
                                      };
                                      setMatchPicks((prev) => ({
                                        ...prev,
                                        [fdId]: updated,
                                      }));
                                      saveMatchPick(fdId, updated);
                                    }}
                                    className="px-2 py-2.5 rounded-xl text-xs font-semibold text-center transition-all disabled:cursor-not-allowed"
                                    style={{
                                      backgroundColor: sel
                                        ? "var(--color-accent)"
                                        : "var(--bg-page)",
                                      border: `1.5px solid ${sel ? "var(--color-accent)" : "var(--color-border)"}`,
                                      color: sel
                                        ? "var(--color-accent-text)"
                                        : "var(--color-text)",
                                    }}
                                  >
                                    {label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Score pick */}
                          <div className="mb-4">
                            <p
                              className="text-xs font-semibold uppercase tracking-widest mb-2"
                              style={{ color: "var(--color-muted)" }}
                            >
                              Score prediction
                            </p>
                            <div className="flex items-center gap-3">
                              <input
                                type="number"
                                min={0}
                                max={20}
                                disabled={locked || isTBD}
                                value={pick.score_home ?? ""}
                                onChange={(e) => {
                                  const updated = {
                                    ...pick,
                                    match_id: fdId,
                                    score_home: Number(e.target.value),
                                  };
                                  setMatchPicks((prev) => ({
                                    ...prev,
                                    [fdId]: updated,
                                  }));
                                }}
                                onBlur={() =>
                                  saveMatchPick(fdId, {
                                    ...pick,
                                    match_id: fdId,
                                  })
                                }
                                className="w-16 px-3 py-2 rounded-xl text-center font-bold outline-none"
                                style={{
                                  backgroundColor: "var(--bg-page)",
                                  border:
                                    "1px solid var(--color-border)",
                                  color: "var(--color-text)",
                                }}
                                placeholder="0"
                              />
                              <span
                                className="font-black"
                                style={{ color: "var(--color-muted)" }}
                              >
                                –
                              </span>
                              <input
                                type="number"
                                min={0}
                                max={20}
                                disabled={locked || isTBD}
                                value={pick.score_away ?? ""}
                                onChange={(e) => {
                                  const updated = {
                                    ...pick,
                                    match_id: fdId,
                                    score_away: Number(e.target.value),
                                  };
                                  setMatchPicks((prev) => ({
                                    ...prev,
                                    [fdId]: updated,
                                  }));
                                }}
                                onBlur={() =>
                                  saveMatchPick(fdId, {
                                    ...pick,
                                    match_id: fdId,
                                  })
                                }
                                className="w-16 px-3 py-2 rounded-xl text-center font-bold outline-none"
                                style={{
                                  backgroundColor: "var(--bg-page)",
                                  border:
                                    "1px solid var(--color-border)",
                                  color: "var(--color-text)",
                                }}
                                placeholder="0"
                              />
                            </div>
                          </div>

                          {/* First scorer */}
                          {scorers ? (
                            // Crew match: curated pill buttons
                            <div className="mb-4">
                              <p
                                className="text-xs font-semibold uppercase tracking-widest mb-2"
                                style={{ color: "var(--color-muted)" }}
                              >
                                First goalscorer
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {scorers.map((scorer) => {
                                  const sel =
                                    pick.first_scorer === scorer;
                                  return (
                                    <button
                                      key={scorer}
                                      disabled={locked || isTBD}
                                      onClick={() => {
                                        const updated = {
                                          ...pick,
                                          match_id: fdId,
                                          first_scorer: scorer,
                                        };
                                        setMatchPicks((prev) => ({
                                          ...prev,
                                          [fdId]: updated,
                                        }));
                                        saveMatchPick(fdId, updated);
                                      }}
                                      className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all disabled:cursor-not-allowed"
                                      style={{
                                        backgroundColor: sel
                                          ? "var(--color-accent)"
                                          : "var(--bg-page)",
                                        border: `1.5px solid ${sel ? "var(--color-accent)" : "var(--color-border)"}`,
                                        color: sel
                                          ? "var(--color-accent-text)"
                                          : "var(--color-text)",
                                      }}
                                    >
                                      {scorer}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ) : (
                            // All other matches: free-text input
                            <div className="mb-4">
                              <p
                                className="text-xs font-semibold uppercase tracking-widest mb-2"
                                style={{ color: "var(--color-muted)" }}
                              >
                                First goalscorer{" "}
                                <span className="normal-case font-normal opacity-60">
                                  (optional)
                                </span>
                              </p>
                              <input
                                type="text"
                                disabled={locked || isTBD}
                                value={pick.first_scorer ?? ""}
                                onChange={(e) => {
                                  setMatchPicks((prev) => ({
                                    ...prev,
                                    [fdId]: {
                                      ...pick,
                                      match_id: fdId,
                                      first_scorer: e.target.value,
                                    },
                                  }));
                                }}
                                onBlur={() =>
                                  saveMatchPick(fdId, {
                                    ...pick,
                                    match_id: fdId,
                                  })
                                }
                                placeholder="Player name..."
                                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                                style={{
                                  backgroundColor: "var(--bg-page)",
                                  border:
                                    "1px solid var(--color-border)",
                                  color: "var(--color-text)",
                                }}
                              />
                            </div>
                          )}

                          {/* VAR banter */}
                          <div>
                            <p
                              className="text-xs font-semibold uppercase tracking-widest mb-2"
                              style={{ color: "var(--color-muted)" }}
                            >
                              Will VAR ruin everything?
                            </p>
                            <div className="flex gap-2">
                              {[
                                { v: true, label: "😤 Yes, obviously" },
                                { v: false, label: "🙏 Please no" },
                              ].map(({ v, label }) => {
                                const sel = pick.var_controversy === v;
                                return (
                                  <button
                                    key={String(v)}
                                    disabled={locked || isTBD}
                                    onClick={() => {
                                      const updated = {
                                        ...pick,
                                        match_id: fdId,
                                        var_controversy: v,
                                      };
                                      setMatchPicks((prev) => ({
                                        ...prev,
                                        [fdId]: updated,
                                      }));
                                      saveMatchPick(fdId, updated);
                                    }}
                                    className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all disabled:cursor-not-allowed"
                                    style={{
                                      backgroundColor: sel
                                        ? "var(--color-accent)"
                                        : "var(--bg-page)",
                                      border: `1.5px solid ${sel ? "var(--color-accent)" : "var(--color-border)"}`,
                                      color: sel
                                        ? "var(--color-accent-text)"
                                        : "var(--color-text)",
                                    }}
                                  >
                                    {label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={() => setStep("leaderboard")}
                  className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 mt-6"
                  style={{
                    backgroundColor: "var(--color-accent)",
                    color: "var(--color-accent-text)",
                  }}
                >
                  <Users size={16} /> See the leaderboard
                </button>
              </>
            )}
          </div>
        )}

        {/* ── STEP: LEADERBOARD ── */}
        {step === "leaderboard" && (
          <div>
            {/* Scoring live banner */}
            {hasAnyResult() && (
              <div
                className="mb-4 px-4 py-3 rounded-xl text-sm flex items-center gap-2"
                style={{
                  backgroundColor: "rgba(34,197,94,0.08)",
                  border: "1px solid rgba(34,197,94,0.25)",
                  color: "rgb(34,197,94)",
                }}
              >
                <span>🟢</span>
                <span className="font-semibold">
                  Live scoring active — results are in for some matches
                </span>
              </div>
            )}

            {leaderboardLoading ? (
              <div className="flex justify-center py-12">
                <div
                  className="w-8 h-8 border-2 rounded-full animate-spin"
                  style={{
                    borderColor: "var(--color-accent)",
                    borderTopColor: "transparent",
                  }}
                />
              </div>
            ) : leaderboard.length === 0 ? (
              <div
                className="text-center py-12"
                style={{ color: "var(--color-muted)" }}
              >
                <div className="text-4xl mb-3">🏜️</div>
                <p className="font-semibold">
                  No predictions yet — be the first!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {[...leaderboard]
                  .map((entry) => ({
                    ...entry,
                    score: liveResults
                      ? calculateScoreFromResults(
                          entry.tournament as Partial<TournamentPicks> | null,
                          entry.matches as MatchPick[],
                          liveResults
                        )
                      : calculateScore(
                          entry.tournament as Partial<TournamentPicks> | null,
                          entry.matches as MatchPick[]
                        ),
                  }))
                  .sort((a, b) => b.score.total - a.score.total)
                  .map((entry, i) => {
                    const rankEmoji =
                      i === 0
                        ? "🥇"
                        : i === 1
                        ? "🥈"
                        : i === 2
                        ? "🥉"
                        : `${i + 1}`;
                    const isMe = entry.predictor.id === predictor?.id;
                    return (
                      <div
                        key={entry.predictor.id}
                        className="rounded-2xl p-5"
                        style={{
                          backgroundColor: "var(--bg-surface)",
                          border: `1px solid ${isMe ? "var(--color-accent)" : "var(--color-border)"}`,
                        }}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-xl w-8 text-center">
                            {rankEmoji}
                          </span>
                          <span className="text-2xl">
                            {entry.predictor.emoji}
                          </span>
                          <div className="flex-1">
                            <p
                              className="font-bold"
                              style={{ color: "var(--color-text)" }}
                            >
                              {entry.predictor.display_name}
                              {isMe && (
                                <span
                                  className="ml-2 text-xs font-semibold"
                                  style={{ color: "var(--color-accent)" }}
                                >
                                  (you)
                                </span>
                              )}
                            </p>
                            <p
                              className="text-xs"
                              style={{ color: "var(--color-muted)" }}
                            >
                              {entry.tournament
                                ? "✅ Tournament picks in"
                                : "⏳ No tournament picks"}{" "}
                              · {entry.matches.length} match{" "}
                              {entry.matches.length === 1 ? "pick" : "picks"}
                            </p>
                          </div>
                          {/* Score badge */}
                          <div className="text-right flex-shrink-0">
                            <div
                              className="text-2xl font-black"
                              style={{ color: "var(--color-accent)" }}
                            >
                              {entry.score.total}
                            </div>
                            <div
                              className="text-xs"
                              style={{ color: "var(--color-muted)" }}
                            >
                              pts
                            </div>
                          </div>
                        </div>

                        {/* Match result breakdown */}
                        {(hasAnyResult() ||
                          (liveResults &&
                            Object.values(liveResults).some(
                              (r) => r.final
                            ))) &&
                          entry.matches.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {entry.matches.map(
                                (
                                  m: MatchPick & { match_id: string }
                                ) => {
                                  const result = liveResults
                                    ? liveResults[m.match_id]
                                    : MATCH_RESULTS[m.match_id];
                                  if (!result?.final) return null;
                                  const pts =
                                    entry.score.matchPoints[m.match_id] ??
                                    0;
                                  // Show team abbreviations for FD matches, legacy label for old IDs
                                  const fdm = matchById[m.match_id];
                                  const badgeLabel = fdm
                                    ? `${fdm.homeTeam.tla ?? (fdm.homeTeam.shortName ?? "TBD").slice(0, 3).toUpperCase()}-${fdm.awayTeam.tla ?? (fdm.awayTeam.shortName ?? "TBD").slice(0, 3).toUpperCase()}`
                                    : m.match_id.includes("-")
                                    ? m.match_id
                                        .split("-")
                                        .slice(0, 2)
                                        .join("-")
                                        .toUpperCase()
                                    : m.match_id.slice(0, 6).toUpperCase();
                                  return (
                                    <span
                                      key={m.match_id}
                                      className="text-xs px-2 py-1 rounded-full font-semibold"
                                      style={{
                                        backgroundColor:
                                          pts > 0
                                            ? "rgba(34,197,94,0.1)"
                                            : "rgba(239,68,68,0.08)",
                                        color:
                                          pts > 0
                                            ? "rgb(34,197,94)"
                                            : "rgb(239,68,68)",
                                        border: `1px solid ${pts > 0 ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.2)"}`,
                                      }}
                                    >
                                      {badgeLabel} +{pts}
                                    </span>
                                  );
                                }
                              )}
                            </div>
                          )}

                        {/* Tournament picks preview */}
                        {entry.tournament && (
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {[
                              {
                                label: "🏆 Winner",
                                val: (
                                  entry.tournament as Partial<TournamentPicks>
                                ).world_cup_winner,
                              },
                              {
                                label: "👟 Golden Boot",
                                val: (
                                  entry.tournament as Partial<TournamentPicks>
                                ).golden_boot,
                              },
                              {
                                label: "🥇 Golden Ball",
                                val: (
                                  entry.tournament as Partial<TournamentPicks>
                                ).golden_ball,
                              },
                              {
                                label: "🐴 Dark Horse",
                                val: (
                                  entry.tournament as Partial<TournamentPicks>
                                ).dark_horse,
                              },
                            ].map(({ label, val }) =>
                              val ? (
                                <div
                                  key={label}
                                  className="px-3 py-2 rounded-xl"
                                  style={{
                                    backgroundColor: "var(--bg-page)",
                                    border: "1px solid var(--color-border)",
                                  }}
                                >
                                  <span
                                    style={{ color: "var(--color-muted)" }}
                                  >
                                    {label}:{" "}
                                  </span>
                                  <span
                                    className="font-semibold"
                                    style={{ color: "var(--color-text)" }}
                                  >
                                    {val}
                                  </span>
                                </div>
                              ) : null
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Static fallback card (used when FD API is unavailable) ─────────

interface StaticMatchCardProps {
  match: (typeof PREDICTION_MATCHES)[0];
  pick: Partial<MatchPick>;
  locked: boolean;
  onUpdate: (updated: Partial<MatchPick>) => void;
  onScoreBlur: () => void;
}

function StaticMatchCard({
  match,
  pick,
  locked,
  onUpdate,
  onScoreBlur,
}: StaticMatchCardProps) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{
        backgroundColor: "var(--bg-surface)",
        border: "1px solid var(--color-border)",
        opacity: locked ? 0.7 : 1,
      }}
    >
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {match.crewMatch && (
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: "var(--color-accent)",
                  color: "var(--color-accent-text)",
                }}
              >
                Crew Match ⚽
              </span>
            )}
            {locked && (
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                style={{
                  backgroundColor: "rgba(239,68,68,0.1)",
                  color: "rgb(239,68,68)",
                  border: "1px solid rgba(239,68,68,0.3)",
                }}
              >
                <Lock size={10} /> Locked
              </span>
            )}
          </div>
          <p className="font-black text-lg" style={{ color: "var(--color-text)" }}>
            {match.homeFlag} {match.homeTeam} vs {match.awayTeam} {match.awayFlag}
          </p>
          <p className="text-xs" style={{ color: "var(--color-muted)" }}>
            {match.date} · {match.city}
          </p>
        </div>
        {pick.winner && (
          <span
            className="text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1"
            style={{
              backgroundColor: "rgba(34,197,94,0.1)",
              color: "rgb(34,197,94)",
              border: "1px solid rgba(34,197,94,0.3)",
            }}
          >
            <Check size={10} /> Picked
          </span>
        )}
      </div>

      {/* Winner */}
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--color-muted)" }}>
          Who wins?
        </p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { v: match.homeTeam, label: `${match.homeFlag} ${match.homeTeam}` },
            { v: "draw", label: "🤝 Draw" },
            { v: match.awayTeam, label: `${match.awayFlag} ${match.awayTeam}` },
          ].map(({ v, label }) => {
            const sel = pick.winner === v;
            return (
              <button
                key={v}
                disabled={locked}
                onClick={() => onUpdate({ ...pick, match_id: match.id, winner: v })}
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
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--color-muted)" }}>
          Score prediction
        </p>
        <div className="flex items-center gap-3">
          <input type="number" min={0} max={20} disabled={locked}
            value={pick.score_home ?? ""}
            onChange={(e) => onUpdate({ ...pick, match_id: match.id, score_home: Number(e.target.value) })}
            onBlur={onScoreBlur}
            className="w-16 px-3 py-2 rounded-xl text-center font-bold outline-none"
            style={{ backgroundColor: "var(--bg-page)", border: "1px solid var(--color-border)", color: "var(--color-text)" }}
            placeholder="0"
          />
          <span className="font-black" style={{ color: "var(--color-muted)" }}>–</span>
          <input type="number" min={0} max={20} disabled={locked}
            value={pick.score_away ?? ""}
            onChange={(e) => onUpdate({ ...pick, match_id: match.id, score_away: Number(e.target.value) })}
            onBlur={onScoreBlur}
            className="w-16 px-3 py-2 rounded-xl text-center font-bold outline-none"
            style={{ backgroundColor: "var(--bg-page)", border: "1px solid var(--color-border)", color: "var(--color-text)" }}
            placeholder="0"
          />
        </div>
      </div>

      {/* First scorer */}
      {match.scorers.length > 1 && (
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--color-muted)" }}>
            First goalscorer
          </p>
          <div className="flex flex-wrap gap-2">
            {match.scorers.map((scorer) => {
              const sel = pick.first_scorer === scorer;
              return (
                <button key={scorer} disabled={locked}
                  onClick={() => onUpdate({ ...pick, match_id: match.id, first_scorer: scorer })}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: sel ? "var(--color-accent)" : "var(--bg-page)",
                    border: `1.5px solid ${sel ? "var(--color-accent)" : "var(--color-border)"}`,
                    color: sel ? "var(--color-accent-text)" : "var(--color-text)",
                  }}
                >
                  {scorer}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* VAR */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--color-muted)" }}>
          Will VAR ruin everything?
        </p>
        <div className="flex gap-2">
          {[{ v: true, label: "😤 Yes, obviously" }, { v: false, label: "🙏 Please no" }].map(({ v, label }) => {
            const sel = pick.var_controversy === v;
            return (
              <button key={String(v)} disabled={locked}
                onClick={() => onUpdate({ ...pick, match_id: match.id, var_controversy: v })}
                className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all disabled:cursor-not-allowed"
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
    </div>
  );
}
