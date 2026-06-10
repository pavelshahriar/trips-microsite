"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import {
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

// ── Google SVG icon ───────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
    </svg>
  );
}

// ── Facebook SVG icon ─────────────────────────────────────────────────────────
function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2" aria-hidden>
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.413c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073Z"/>
    </svg>
  );
}

// ── Divider ───────────────────────────────────────────────────────────────────
function Divider() {
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px" style={{ backgroundColor: "var(--color-border)" }} />
      <span className="text-xs" style={{ color: "var(--color-muted)" }}>or</span>
      <div className="flex-1 h-px" style={{ backgroundColor: "var(--color-border)" }} />
    </div>
  );
}

// ── Main login form ───────────────────────────────────────────────────────────
function LoginForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const required = searchParams.get("required") as "google" | "facebook" | "email" | null;

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState<"google" | "facebook" | "email" | null>(null);
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) window.location.href = "/trip-vault";
    });
  }, [supabase.auth]);

  // ── Error message from URL ──
  const errorMessage =
    error === "not_crew"
      ? "That email isn't on the crew list. Only the boys can access this. 🔒"
      : error === "auth_failed"
      ? "The magic link expired or was already used. Request a new one."
      : error === "wrong_provider"
      ? required === "google"
        ? "You need to sign in with Google for this account. Use the Google button below."
        : required === "facebook"
        ? "You need to sign in with Facebook for this account. Use the Facebook button below."
        : "You need to sign in with the magic link for this account. Use the email form below."
      : null;

  // ── Highlight the required button ──
  const highlight = (provider: "google" | "facebook") =>
    required === provider
      ? { boxShadow: "0 0 0 2px var(--color-accent)", outline: "none" }
      : {};

  // ── OAuth sign-in ──
  async function signInWith(provider: "google" | "facebook") {
    setLoading(provider);
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/trip-vault/auth/callback`,
      },
    });
    // browser navigates away; no need to setLoading(null)
  }

  // ── Magic link sign-in ──
  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!email.trim()) {
      setFormError("Enter your email address.");
      return;
    }
    setLoading("email");
    const { error: signInError } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        emailRedirectTo: `${window.location.origin}/trip-vault/auth/callback`,
      },
    });
    setLoading(null);
    if (signInError) {
      setFormError("Couldn't send the link. Check your email and try again.");
    } else {
      setSent(true);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        {/* Icon */}
        <div className="flex justify-center mb-8">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl"
            style={{
              background: "color-mix(in srgb, var(--color-accent) 10%, transparent)",
              border: "1px solid color-mix(in srgb, var(--color-accent) 30%, transparent)",
            }}
          >
            🔒
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--color-text)" }}>
            Trip Vault
          </h1>
          <p className="text-sm" style={{ color: "var(--color-muted)" }}>
            Private space for the crew. Sign in to enter.
          </p>
        </div>

        {/* URL error banner */}
        {errorMessage && !sent && (
          <div
            className="flex items-start gap-3 rounded-xl p-4 mb-6 text-sm"
            style={{
              background: "color-mix(in srgb, #ef4444 10%, var(--bg-surface))",
              border: "1px solid color-mix(in srgb, #ef4444 30%, transparent)",
              color: "#f87171",
            }}
          >
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--color-border)",
          }}
        >
          {sent ? (
            /* ── Success state ── */
            <div className="text-center py-4">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
                style={{
                  background: "color-mix(in srgb, var(--color-accent) 12%, transparent)",
                  border: "1px solid color-mix(in srgb, var(--color-accent) 30%, transparent)",
                }}
              >
                <CheckCircle size={28} style={{ color: "var(--color-accent)" }} />
              </div>
              <h2 className="text-xl font-bold mb-2" style={{ color: "var(--color-text)" }}>
                Check your inbox
              </h2>
              <p className="text-sm mb-1" style={{ color: "var(--color-muted)" }}>
                We sent a magic link to
              </p>
              <p className="text-sm font-semibold mb-6" style={{ color: "var(--color-text)" }}>
                {email}
              </p>
              <p className="text-xs" style={{ color: "var(--color-muted)" }}>
                The link expires in 1 hour. Check spam if you don&apos;t see it.
              </p>
              <button
                onClick={() => { setSent(false); setEmail(""); }}
                className="mt-8 text-sm underline underline-offset-2"
                style={{ color: "var(--color-muted)" }}
              >
                Use a different email
              </button>
            </div>
          ) : (
            /* ── Sign-in options ── */
            <div className="space-y-3">
              {/* Google */}
              <button
                onClick={() => signInWith("google")}
                disabled={loading !== null}
                style={{
                  border: "1px solid var(--color-border)",
                  color: "var(--color-text)",
                  backgroundColor: "var(--bg-page)",
                  ...highlight("google"),
                }}
                className="w-full flex items-center justify-center gap-3 py-3 rounded-xl text-sm font-medium transition-opacity disabled:opacity-60"
              >
                {loading === "google" ? (
                  "Redirecting…"
                ) : (
                  <>
                    <GoogleIcon />
                    Continue with Google
                  </>
                )}
              </button>

              {/* Facebook */}
              <button
                onClick={() => signInWith("facebook")}
                disabled={loading !== null}
                style={{
                  border: "1px solid var(--color-border)",
                  color: "var(--color-text)",
                  backgroundColor: "var(--bg-page)",
                  ...highlight("facebook"),
                }}
                className="w-full flex items-center justify-center gap-3 py-3 rounded-xl text-sm font-medium transition-opacity disabled:opacity-60"
              >
                {loading === "facebook" ? (
                  "Redirecting…"
                ) : (
                  <>
                    <FacebookIcon />
                    Continue with Facebook
                  </>
                )}
              </button>

              <Divider />

              {/* Magic link */}
              <form onSubmit={handleEmailSubmit} className="space-y-3">
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: "var(--color-muted)" }}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email magic link"
                    className="w-full rounded-xl pl-10 pr-4 py-3 text-sm outline-none transition-colors"
                    style={{
                      backgroundColor: "var(--bg-page)",
                      border: required === "email"
                        ? "2px solid var(--color-accent)"
                        : "1px solid var(--color-border)",
                      color: "var(--color-text)",
                    }}
                    autoComplete="email"
                  />
                </div>

                {formError && (
                  <p className="text-xs" style={{ color: "#f87171" }}>
                    {formError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading !== null}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-opacity disabled:opacity-60"
                  style={{
                    backgroundColor: "var(--color-accent)",
                    color: "var(--bg-page)",
                  }}
                >
                  {loading === "email" ? (
                    "Sending…"
                  ) : (
                    <>
                      Send magic link
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="mt-8 flex items-center justify-center gap-2 text-xs"
          style={{ color: "var(--color-muted)" }}
        >
          <Lock size={12} />
          <span>Secured with Supabase Auth</span>
        </div>
      </div>
    </div>
  );
}

export default function TripVaultLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
