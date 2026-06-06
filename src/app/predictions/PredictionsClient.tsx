"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import {
  TOURNAMENT_QUESTIONS,
  PREDICTION_MATCHES,
  EMOJI_OPTIONS,
  type TournamentPicks,
  type MatchPick,
} from "@/data/predictions";
import { LogOut, ChevronRight, Check, Users, Lock } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";
import { calculateScore, hasAnyResult } from "@/lib/scoring";
import { MATCH_RESULTS } from "@/data/results";

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

export default function PredictionsClient() {
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [predictor, setPredictor] = useState<Predictor | null>(null);
  const [step, setStep] = useState<Step>("login");
  const [loading, setLoading] = useState(true);

  // Profile setup
  const [displayName, setDisplayName] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("⚽");

  // Tournament picks
  const [tournamentPicks, setTournamentPicks] = useState<Partial<TournamentPicks>>({});
  const [tournamentSaved, setTournamentSaved] = useState(false);

  // Match picks
  const [matchPicks, setMatchPicks] = useState<Record<string, Partial<MatchPick>>>({});

  // Leaderboard
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Auth state ──────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  // ── Load predictor profile once user is known ───────────────
  const loadPredictor = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("predictors")
      .select("*")
      .eq("user_id", userId)
      .single();
    return data as Predictor | null;
  }, [supabase]);

  const loadExistingPicks = useCallback(async (predictorId: string) => {
    const [{ data: tData }, { data: mData }] = await Promise.all([
      supabase.from("tournament_predictions").select("*").eq("predictor_id", predictorId).single(),
      supabase.from("match_predictions").select("*").eq("predictor_id", predictorId),
    ]);
    if (tData) {
      const { id: _id, predictor_id: _pid, created_at: _ca, updated_at: _ua, ...picks } = tData;
      setTournamentPicks(picks as Partial<TournamentPicks>);
      setTournamentSaved(true);
    }
    if (mData && mData.length > 0) {
      const byMatch: Record<string, Partial<MatchPick>> = {};
      mData.forEach((m: MatchPick & { id: string; predictor_id: string }) => {
        byMatch[m.match_id] = {
          match_id: m.match_id,
          winner: m.winner,
          score_home: m.score_home,
          score_away: m.score_away,
          first_scorer: m.first_scorer,
          var_controversy: m.var_controversy,
        };
      });
      setMatchPicks(byMatch);
    }
  }, [supabase]);

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
        setStep("tournament");
      } else {
        // Pre-fill name from OAuth
        const name = user.user_metadata?.full_name || user.user_metadata?.name || "";
        setDisplayName(name);
        setStep("profile");
      }
      setLoading(false);
    })();
  }, [user, loadPredictor, loadExistingPicks]);

  // ── Auth handlers ───────────────────────────────────────────
  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/predictions` },
    });
  };

  const signInWithFacebook = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "facebook",
      options: { redirectTo: `${window.location.origin}/predictions` },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setPredictor(null);
    setTournamentPicks({});
    setMatchPicks({});
    setStep("login");
  };

  // ── Save profile ────────────────────────────────────────────
  const saveProfile = async () => {
    if (!user || !displayName.trim()) return;
    setSaving(true);
    setError(null);
    const { data, error: err } = await supabase
      .from("predictors")
      .insert({ user_id: user.id, display_name: displayName.trim(), emoji: selectedEmoji, avatar_url: user.user_metadata?.avatar_url })
      .select()
      .single();
    if (err) { setError(err.message); setSaving(false); return; }
    setPredictor(data as Predictor);
    setSaving(false);
    setStep("tournament");
  };

  // ── Save tournament picks ───────────────────────────────────
  const saveTournamentPicks = async () => {
    if (!predictor) return;
    setSaving(true);
    setError(null);
    const payload = { predictor_id: predictor.id, ...tournamentPicks, updated_at: new Date().toISOString() };
    const { error: err } = tournamentSaved
      ? await supabase.from("tournament_predictions").update(payload).eq("predictor_id", predictor.id)
      : await supabase.from("tournament_predictions").insert(payload);
    if (err) { setError(err.message); setSaving(false); return; }
    setTournamentSaved(true);
    setSaving(false);
    setStep("matches");
  };

  // ── Save a match pick ───────────────────────────────────────
  const saveMatchPick = async (matchId: string, pick: Partial<MatchPick>) => {
    if (!predictor) return;
    const payload = { predictor_id: predictor.id, match_id: matchId, ...pick, updated_at: new Date().toISOString() };
    const existing = matchPicks[matchId];
    if (existing?.match_id) {
      await supabase.from("match_predictions").update(payload).eq("predictor_id", predictor.id).eq("match_id", matchId);
    } else {
      await supabase.from("match_predictions").insert(payload);
    }
    setMatchPicks(prev => ({ ...prev, [matchId]: { match_id: matchId, ...pick } }));
  };

  // ── Load leaderboard ────────────────────────────────────────
  const loadLeaderboard = useCallback(async () => {
    setLeaderboardLoading(true);
    const [{ data: preds }, { data: tPicks }, { data: mPicks }] = await Promise.all([
      supabase.from("predictors").select("*").order("created_at"),
      supabase.from("tournament_predictions").select("*"),
      supabase.from("match_predictions").select("*"),
    ]);
    if (!preds) { setLeaderboardLoading(false); return; }
    const entries: LeaderboardEntry[] = preds.map((p: Predictor) => ({
      predictor: p,
      tournament: tPicks?.find((t: { predictor_id: string }) => t.predictor_id === p.id) ?? null,
      matches: (mPicks ?? []).filter((m: MatchPick & { predictor_id: string }) => m.predictor_id === p.id),
    }));
    setLeaderboard(entries);
    setLeaderboardLoading(false);
  }, [supabase]);

  useEffect(() => {
    if (step === "leaderboard") loadLeaderboard();
  }, [step, loadLeaderboard]);

  // ── Check if match is locked (past kickoff) ─────────────────
  const isLocked = (kickoff: string) => new Date() > new Date(kickoff);

  // ── Render ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: "var(--color-accent)", borderTopColor: "transparent" }} />
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
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold"
                style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--color-border)", color: "var(--color-text)" }}>
                <span className="text-lg">{predictor.emoji}</span>
                <span>{predictor.display_name}</span>
              </div>
              <button onClick={signOut} className="p-2 rounded-xl transition-colors"
                style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--color-border)", color: "var(--color-muted)" }}>
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
              <button key={key} onClick={() => setStep(key as Step)}
                className="px-4 py-2 rounded-full text-sm font-semibold transition-all"
                style={{
                  backgroundColor: step === key ? "var(--color-accent)" : "var(--bg-surface)",
                  color: step === key ? "var(--color-accent-text)" : "var(--color-muted)",
                  border: "1px solid var(--color-border)",
                }}>
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
          <div className="rounded-2xl p-8 text-center"
            style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--color-border)" }}>
            <div className="text-5xl mb-4">🏆</div>
            <h2 className="text-2xl font-black mb-2" style={{ color: "var(--color-text)" }}>
              Join the prediction game
            </h2>
            <p className="text-sm mb-8 max-w-sm mx-auto" style={{ color: "var(--color-muted)" }}>
              One prediction per person. Sign in to lock in your picks and see how everyone else is calling it.
            </p>
            <div className="flex flex-col gap-3 max-w-xs mx-auto">
              <button onClick={signInWithGoogle}
                className="flex items-center justify-center gap-3 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90"
                style={{ backgroundColor: "var(--color-text)", color: "var(--bg-page)" }}>
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                  <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
                  <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
                  <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.96l3.007 2.332C4.672 5.163 6.656 3.58 9 3.58z"/>
                </svg>
                Continue with Google
              </button>
              <button onClick={signInWithFacebook}
                className="flex items-center justify-center gap-3 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90"
                style={{ backgroundColor: "#1877F2", color: "#fff" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
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
          <div className="rounded-2xl p-8"
            style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--color-border)" }}>
            <h2 className="text-xl font-black mb-1" style={{ color: "var(--color-text)" }}>
              What should we call you?
            </h2>
            <p className="text-sm mb-6" style={{ color: "var(--color-muted)" }}>
              Pick a display name and emoji — this is how you&apos;ll appear on the leaderboard.
            </p>
            <div className="mb-6">
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--color-muted)" }}>
                Display name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
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
              <label className="block text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--color-muted)" }}>
                Pick your emoji
              </label>
              <div className="flex flex-wrap gap-2">
                {EMOJI_OPTIONS.map(emoji => (
                  <button key={emoji}
                    onClick={() => setSelectedEmoji(emoji)}
                    className="w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all"
                    style={{
                      backgroundColor: selectedEmoji === emoji ? "var(--color-accent)" : "var(--bg-page)",
                      border: `2px solid ${selectedEmoji === emoji ? "var(--color-accent)" : "var(--color-border)"}`,
                    }}>
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={saveProfile}
              disabled={!displayName.trim() || saving}
              className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              style={{ backgroundColor: "var(--color-accent)", color: "var(--color-accent-text)" }}>
              {saving ? "Saving..." : <>Let&apos;s go <ChevronRight size={16} /></>}
            </button>
          </div>
        )}

        {/* ── STEP: TOURNAMENT PREDICTIONS ── */}
        {step === "tournament" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm" style={{ color: "var(--color-muted)" }}>
                {Object.keys(tournamentPicks).length}/{TOURNAMENT_QUESTIONS.length} questions answered
              </p>
              {tournamentSaved && (
                <span className="text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1"
                  style={{ backgroundColor: "rgba(34,197,94,0.1)", color: "rgb(34,197,94)", border: "1px solid rgba(34,197,94,0.3)" }}>
                  <Check size={12} /> Saved
                </span>
              )}
            </div>

            <div className="space-y-4">
              {TOURNAMENT_QUESTIONS.map(q => (
                <div key={q.id} className="rounded-2xl p-5"
                  style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--color-border)" }}>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xl">{q.emoji}</span>
                    <h3 className="font-bold text-sm" style={{ color: "var(--color-text)" }}>{q.question}</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {q.options.map(opt => {
                      const selected = tournamentPicks[q.id] === opt.value;
                      return (
                        <button key={opt.value}
                          onClick={() => setTournamentPicks(prev => ({ ...prev, [q.id]: opt.value }))}
                          className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all"
                          style={{
                            backgroundColor: selected ? "var(--color-accent)" : "var(--bg-page)",
                            border: `1.5px solid ${selected ? "var(--color-accent)" : "var(--color-border)"}`,
                            color: selected ? "var(--color-accent-text)" : "var(--color-text)",
                          }}>
                          {opt.flag && <span>{opt.flag}</span>}
                          <span>{opt.label}</span>
                          {selected && <Check size={12} className="ml-auto flex-shrink-0" />}
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
                disabled={saving || Object.keys(tournamentPicks).length === 0}
                className="flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                style={{ backgroundColor: "var(--color-accent)", color: "var(--color-accent-text)" }}>
                {saving ? "Saving..." : <>{tournamentSaved ? "Update picks" : "Save & continue"} <ChevronRight size={16} /></>}
              </button>
              <button onClick={() => setStep("matches")}
                className="px-5 py-3 rounded-xl font-semibold text-sm transition-all"
                style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--color-border)", color: "var(--color-muted)" }}>
                Skip
              </button>
            </div>
          </div>
        )}

        {/* ── STEP: MATCH PREDICTIONS ── */}
        {step === "matches" && (
          <div className="space-y-4">
            {PREDICTION_MATCHES.map(match => {
              const locked = isLocked(match.kickoff);
              const pick = matchPicks[match.id] || {};
              const crewBadge = match.crewMatch;

              return (
                <div key={match.id} className="rounded-2xl p-5"
                  style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--color-border)", opacity: locked ? 0.7 : 1 }}>
                  {/* Match header */}
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {crewBadge && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: "var(--color-accent)", color: "var(--color-accent-text)" }}>
                            Crew Match ⚽
                          </span>
                        )}
                        {locked && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                            style={{ backgroundColor: "rgba(239,68,68,0.1)", color: "rgb(239,68,68)", border: "1px solid rgba(239,68,68,0.3)" }}>
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
                      <span className="text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1"
                        style={{ backgroundColor: "rgba(34,197,94,0.1)", color: "rgb(34,197,94)", border: "1px solid rgba(34,197,94,0.3)" }}>
                        <Check size={10} /> Picked
                      </span>
                    )}
                  </div>

                  {/* Winner pick */}
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
                          <button key={v}
                            disabled={locked}
                            onClick={() => {
                              const updated = { ...pick, match_id: match.id, winner: v };
                              setMatchPicks(prev => ({ ...prev, [match.id]: updated }));
                              saveMatchPick(match.id, updated);
                            }}
                            className="px-2 py-2.5 rounded-xl text-xs font-semibold text-center transition-all disabled:cursor-not-allowed"
                            style={{
                              backgroundColor: sel ? "var(--color-accent)" : "var(--bg-page)",
                              border: `1.5px solid ${sel ? "var(--color-accent)" : "var(--color-border)"}`,
                              color: sel ? "var(--color-accent-text)" : "var(--color-text)",
                            }}>
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Score pick */}
                  <div className="mb-4">
                    <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--color-muted)" }}>
                      Score prediction
                    </p>
                    <div className="flex items-center gap-3">
                      <input type="number" min={0} max={20} disabled={locked}
                        value={pick.score_home ?? ""}
                        onChange={e => {
                          const updated = { ...pick, match_id: match.id, score_home: Number(e.target.value) };
                          setMatchPicks(prev => ({ ...prev, [match.id]: updated }));
                        }}
                        onBlur={() => saveMatchPick(match.id, { ...pick, match_id: match.id })}
                        className="w-16 px-3 py-2 rounded-xl text-center font-bold outline-none"
                        style={{ backgroundColor: "var(--bg-page)", border: "1px solid var(--color-border)", color: "var(--color-text)" }}
                        placeholder="0"
                      />
                      <span className="font-black" style={{ color: "var(--color-muted)" }}>–</span>
                      <input type="number" min={0} max={20} disabled={locked}
                        value={pick.score_away ?? ""}
                        onChange={e => {
                          const updated = { ...pick, match_id: match.id, score_away: Number(e.target.value) };
                          setMatchPicks(prev => ({ ...prev, [match.id]: updated }));
                        }}
                        onBlur={() => saveMatchPick(match.id, { ...pick, match_id: match.id })}
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
                        {match.scorers.map(scorer => {
                          const sel = pick.first_scorer === scorer;
                          return (
                            <button key={scorer} disabled={locked}
                              onClick={() => {
                                const updated = { ...pick, match_id: match.id, first_scorer: scorer };
                                setMatchPicks(prev => ({ ...prev, [match.id]: updated }));
                                saveMatchPick(match.id, updated);
                              }}
                              className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all disabled:cursor-not-allowed"
                              style={{
                                backgroundColor: sel ? "var(--color-accent)" : "var(--bg-page)",
                                border: `1.5px solid ${sel ? "var(--color-accent)" : "var(--color-border)"}`,
                                color: sel ? "var(--color-accent-text)" : "var(--color-text)",
                              }}>
                              {scorer}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* VAR banter */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--color-muted)" }}>
                      Will VAR ruin everything?
                    </p>
                    <div className="flex gap-2">
                      {[{ v: true, label: "😤 Yes, obviously" }, { v: false, label: "🙏 Please no" }].map(({ v, label }) => {
                        const sel = pick.var_controversy === v;
                        return (
                          <button key={String(v)} disabled={locked}
                            onClick={() => {
                              const updated = { ...pick, match_id: match.id, var_controversy: v };
                              setMatchPicks(prev => ({ ...prev, [match.id]: updated }));
                              saveMatchPick(match.id, updated);
                            }}
                            className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all disabled:cursor-not-allowed"
                            style={{
                              backgroundColor: sel ? "var(--color-accent)" : "var(--bg-page)",
                              border: `1.5px solid ${sel ? "var(--color-accent)" : "var(--color-border)"}`,
                              color: sel ? "var(--color-accent-text)" : "var(--color-text)",
                            }}>
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}

            <button onClick={() => setStep("leaderboard")}
              className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 mt-2"
              style={{ backgroundColor: "var(--color-accent)", color: "var(--color-accent-text)" }}>
              <Users size={16} /> See the leaderboard
            </button>
          </div>
        )}

        {/* ── STEP: LEADERBOARD ── */}
        {step === "leaderboard" && (
          <div>
            {/* Scoring live banner */}
            {hasAnyResult() && (
              <div className="mb-4 px-4 py-3 rounded-xl text-sm flex items-center gap-2"
                style={{ backgroundColor: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)", color: "rgb(34,197,94)" }}>
                <span>🟢</span>
                <span className="font-semibold">Live scoring active — results are in for some matches</span>
              </div>
            )}

            {leaderboardLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: "var(--color-accent)", borderTopColor: "transparent" }} />
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="text-center py-12" style={{ color: "var(--color-muted)" }}>
                <div className="text-4xl mb-3">🏜️</div>
                <p className="font-semibold">No predictions yet — be the first!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {[...leaderboard]
                  .map(entry => ({
                    ...entry,
                    score: calculateScore(
                      entry.tournament as Partial<TournamentPicks> | null,
                      entry.matches as MatchPick[]
                    ),
                  }))
                  .sort((a, b) => b.score.total - a.score.total)
                  .map((entry, i) => {
                    const rankEmoji = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`;
                    const isMe = entry.predictor.id === predictor?.id;
                    return (
                      <div key={entry.predictor.id} className="rounded-2xl p-5"
                        style={{ backgroundColor: "var(--bg-surface)", border: `1px solid ${isMe ? "var(--color-accent)" : "var(--color-border)"}` }}>
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-xl w-8 text-center">{rankEmoji}</span>
                          <span className="text-2xl">{entry.predictor.emoji}</span>
                          <div className="flex-1">
                            <p className="font-bold" style={{ color: "var(--color-text)" }}>
                              {entry.predictor.display_name}
                              {isMe && <span className="ml-2 text-xs font-semibold" style={{ color: "var(--color-accent)" }}>(you)</span>}
                            </p>
                            <p className="text-xs" style={{ color: "var(--color-muted)" }}>
                              {entry.tournament ? "✅ Tournament picks in" : "⏳ No tournament picks"} ·{" "}
                              {entry.matches.length} match {entry.matches.length === 1 ? "pick" : "picks"}
                            </p>
                          </div>
                          {/* Score badge */}
                          <div className="text-right flex-shrink-0">
                            <div className="text-2xl font-black" style={{ color: "var(--color-accent)" }}>
                              {entry.score.total}
                            </div>
                            <div className="text-xs" style={{ color: "var(--color-muted)" }}>pts</div>
                          </div>
                        </div>

                        {/* Match result breakdown — only show if results exist */}
                        {hasAnyResult() && entry.matches.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {entry.matches.map((m: MatchPick & { match_id: string }) => {
                              const result = MATCH_RESULTS[m.match_id];
                              if (!result?.final) return null;
                              const pts = entry.score.matchPoints[m.match_id] ?? 0;
                              return (
                                <span key={m.match_id}
                                  className="text-xs px-2 py-1 rounded-full font-semibold"
                                  style={{
                                    backgroundColor: pts > 0 ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.08)",
                                    color: pts > 0 ? "rgb(34,197,94)" : "rgb(239,68,68)",
                                    border: `1px solid ${pts > 0 ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.2)"}`,
                                  }}>
                                  {m.match_id.split("-")[0].toUpperCase()} +{pts}
                                </span>
                              );
                            })}
                          </div>
                        )}

                        {/* Tournament picks preview */}
                        {entry.tournament && (
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {[
                              { label: "🏆 Winner", val: (entry.tournament as Partial<TournamentPicks>).world_cup_winner },
                              { label: "👟 Golden Boot", val: (entry.tournament as Partial<TournamentPicks>).golden_boot },
                              { label: "🥇 Golden Ball", val: (entry.tournament as Partial<TournamentPicks>).golden_ball },
                              { label: "🐴 Dark Horse", val: (entry.tournament as Partial<TournamentPicks>).dark_horse },
                            ].map(({ label, val }) => val ? (
                              <div key={label} className="px-3 py-2 rounded-xl"
                                style={{ backgroundColor: "var(--bg-page)", border: "1px solid var(--color-border)" }}>
                                <span style={{ color: "var(--color-muted)" }}>{label}: </span>
                                <span className="font-semibold" style={{ color: "var(--color-text)" }}>{val}</span>
                              </div>
                            ) : null)}
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
