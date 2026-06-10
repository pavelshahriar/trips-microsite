"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase-browser";
import type { User } from "@supabase/supabase-js";
import {
  getCrewMemberByEmail,
  UNKNOWN_CREW,
  TEAM_DATA,
  type VaultCrewMember,
} from "@/data/vault-crew";
import {
  ArrowRight,
  Camera,
  CheckCircle,
  Gift,
  Star,
  Upload,
  X,
} from "lucide-react";
import Image from "next/image";

type Step = "welcome" | "team" | "nickname" | "gift" | "selfie" | "done";

interface OnboardingClientProps {
  user: User;
  onComplete: () => void;
}

export default function OnboardingClient({
  user,
  onComplete,
}: OnboardingClientProps) {
  const supabase = createClient();
  const crew: VaultCrewMember =
    getCrewMemberByEmail(user.email ?? "") ?? UNKNOWN_CREW;
  const teamInfo = TEAM_DATA[crew.team] ?? { flag: "⚽", color: "#888" };

  const [step, setStep] = useState<Step>("welcome");
  const [nicknameRevealed, setNicknameRevealed] = useState(false);
  const [giftConfirmed, setGiftConfirmed] = useState<boolean | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelfieChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelfieFile(file);
    setSelfiePreview(URL.createObjectURL(file));
  };

  const uploadSelfie = async (): Promise<string | null> => {
    if (!selfieFile) return null;
    const ext = selfieFile.name.split(".").pop() ?? "jpg";
    const path = `${user.id}/${Date.now()}_gift_selfie.${ext}`;

    const { error } = await supabase.storage
      .from("vault-photos")
      .upload(path, selfieFile, { contentType: selfieFile.type });

    if (error) {
      setUploadError("Upload failed — you can add your selfie later from the Vault.");
      return null;
    }
    return path;
  };

  const finishOnboarding = async (skipSelfie = false) => {
    setSaving(true);
    setUploadError(null);

    let selfieStoragePath: string | null = null;

    if (!skipSelfie && selfieFile) {
      setUploading(true);
      selfieStoragePath = await uploadSelfie();
      setUploading(false);
    }

    // Insert gift selfie into vault_photos if we have one
    if (selfieStoragePath) {
      await supabase.from("vault_photos").insert({
        user_id: user.id,
        uploaded_by: user.email,
        storage_path: selfieStoragePath,
        caption: "🎁 Gift selfie — onboarding",
        is_public: false,
        is_gift_selfie: true,
      });
    }

    // Mark onboarding complete
    const { error } = await supabase.from("vault_profiles").upsert({
      id: user.id,
      email: user.email,
      onboarding_done: true,
      gift_confirmed: giftConfirmed === true,
    });

    setSaving(false);

    if (!error) {
      setStep("done");
    }
  };

  // ── Shared layout wrapper ────────────────────────────────────────────────────
  const StepCard = ({
    children,
    className = "",
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className={`w-full max-w-md ${className}`}>{children}</div>
    </div>
  );

  const Card = ({ children }: { children: React.ReactNode }) => (
    <div
      className="rounded-2xl p-8"
      style={{
        backgroundColor: "var(--bg-surface)",
        border: "1px solid var(--color-border)",
      }}
    >
      {children}
    </div>
  );

  const PrimaryButton = ({
    onClick,
    children,
    disabled = false,
    fullWidth = true,
  }: {
    onClick: () => void;
    children: React.ReactNode;
    disabled?: boolean;
    fullWidth?: boolean;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${fullWidth ? "w-full" : ""} flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-sm font-semibold transition-opacity disabled:opacity-50`}
      style={{
        backgroundColor: "var(--color-accent)",
        color: "var(--bg-page)",
      }}
    >
      {children}
    </button>
  );

  const StepDots = ({ current }: { current: number }) => {
    const steps = ["welcome", "team", "nickname", "gift", "selfie"];
    const idx = steps.indexOf(step);
    return (
      <div className="flex justify-center gap-2 mb-8">
        {steps.map((_, i) => (
          <div
            key={i}
            className="h-1.5 rounded-full transition-all duration-300"
            style={{
              width: i === (idx === -1 ? current : idx) ? "24px" : "8px",
              backgroundColor:
                i <= (idx === -1 ? current : idx)
                  ? "var(--color-accent)"
                  : "var(--color-border)",
            }}
          />
        ))}
      </div>
    );
  };

  // ── Step: Welcome ────────────────────────────────────────────────────────────
  if (step === "welcome") {
    return (
      <StepCard>
        <StepDots current={0} />
        <Card>
          <div className="text-center mb-8">
            <div className="text-6xl mb-6">🎉</div>
            <h1
              className="text-2xl font-bold mb-3"
              style={{ color: "var(--color-text)" }}
            >
              {crew.welcomeMessage}
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>
              Welcome to the <strong style={{ color: "var(--color-accent)" }}>WC26 Trip Vault</strong> —
              the private corner of this microsite where the real stuff lives.
              Photos, booking docs, and whatever chaos the crew generates along the way.
            </p>
          </div>

          <div
            className="rounded-xl p-4 mb-8 text-sm text-center"
            style={{
              background:
                "color-mix(in srgb, var(--color-accent) 8%, var(--bg-page))",
              border:
                "1px solid color-mix(in srgb, var(--color-accent) 20%, transparent)",
              color: "var(--color-muted)",
            }}
          >
            We&apos;re going to do a quick onboarding — 5 steps. Promise it&apos;s more fun than an airport queue.
          </div>

          <PrimaryButton onClick={() => setStep("team")}>
            Let&apos;s go <ArrowRight size={14} />
          </PrimaryButton>
        </Card>
      </StepCard>
    );
  }

  // ── Step: Team ───────────────────────────────────────────────────────────────
  if (step === "team") {
    return (
      <StepCard>
        <StepDots current={1} />
        <Card>
          <div className="text-center mb-8">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-5xl mx-auto mb-6"
              style={{
                background: `color-mix(in srgb, ${teamInfo.color} 12%, var(--bg-page))`,
                border: `1px solid color-mix(in srgb, ${teamInfo.color} 30%, transparent)`,
              }}
            >
              {crew.teamEmoji}
            </div>
            <h2
              className="text-xl font-bold mb-2"
              style={{ color: "var(--color-text)" }}
            >
              {crew.name} picks {crew.team}. Classic.
            </h2>
            <p
              className="text-sm italic mb-6"
              style={{ color: "var(--color-accent)" }}
            >
              &ldquo;{crew.teamInspo}&rdquo;
            </p>
          </div>

          <div
            className="rounded-xl p-5 mb-8"
            style={{
              backgroundColor: "var(--bg-page)",
              border: "1px solid var(--color-border)",
            }}
          >
            <div
              className="flex items-center gap-2 mb-3"
              style={{ color: "var(--color-accent)" }}
            >
              <Star size={14} />
              <span className="text-xs font-bold uppercase tracking-wider">
                Fun fact
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "var(--color-text)" }}>
              {crew.teamFunFact}
            </p>
          </div>

          <PrimaryButton onClick={() => setStep("nickname")}>
            That&apos;s my team <ArrowRight size={14} />
          </PrimaryButton>
        </Card>
      </StepCard>
    );
  }

  // ── Step: Nickname ───────────────────────────────────────────────────────────
  if (step === "nickname") {
    return (
      <StepCard>
        <StepDots current={2} />
        <Card>
          <div className="text-center mb-8">
            <p className="text-sm mb-4" style={{ color: "var(--color-muted)" }}>
              The boys have been talking…
            </p>
            <p className="text-sm mb-6" style={{ color: "var(--color-muted)" }}>
              From this day forward, {crew.name}, you shall be known as:
            </p>

            {!nicknameRevealed ? (
              <button
                onClick={() => setNicknameRevealed(true)}
                className="text-4xl font-black tracking-tight border-b-4 border-dashed cursor-pointer select-none transition-all hover:opacity-70"
                style={{
                  color: "var(--color-accent)",
                  borderColor: "var(--color-accent)",
                }}
              >
                Tap to reveal 👀
              </button>
            ) : (
              <div>
                <div
                  className="text-4xl font-black tracking-tight mb-4"
                  style={{ color: "var(--color-accent)" }}
                >
                  &ldquo;{crew.nickname}&rdquo;
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>
                  {crew.nicknameReason}
                </p>
              </div>
            )}
          </div>

          <PrimaryButton
            onClick={() => setStep("gift")}
            disabled={!nicknameRevealed}
          >
            I accept this honour <ArrowRight size={14} />
          </PrimaryButton>

          {!nicknameRevealed && (
            <p
              className="text-center text-xs mt-3"
              style={{ color: "var(--color-muted)" }}
            >
              Reveal your nickname first 👆
            </p>
          )}
        </Card>
      </StepCard>
    );
  }

  // ── Step: Gift ───────────────────────────────────────────────────────────────
  if (step === "gift") {
    return (
      <StepCard>
        <StepDots current={3} />
        <Card>
          <div className="text-center mb-8">
            <div className="text-5xl mb-6">🎁</div>
            <h2
              className="text-xl font-bold mb-3"
              style={{ color: "var(--color-text)" }}
            >
              We&apos;ve got something for you
            </h2>
            <p
              className="text-sm leading-relaxed mb-6"
              style={{ color: "var(--color-muted)" }}
            >
              The crew put together {crew.gift}
            </p>

            <p className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
              Did you get your welcome gift?
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                setGiftConfirmed(true);
                setStep("selfie");
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-colors"
              style={{
                backgroundColor:
                  giftConfirmed === true
                    ? "var(--color-accent)"
                    : "color-mix(in srgb, var(--color-accent) 12%, var(--bg-page))",
                color:
                  giftConfirmed === true
                    ? "var(--bg-page)"
                    : "var(--color-accent)",
                border: "1px solid color-mix(in srgb, var(--color-accent) 30%, transparent)",
              }}
            >
              <CheckCircle size={16} />
              Yes, I got it! 🎉
            </button>

            <button
              onClick={() => {
                setGiftConfirmed(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm transition-colors"
              style={{
                backgroundColor: "var(--bg-page)",
                color: "var(--color-muted)",
                border: "1px solid var(--color-border)",
              }}
            >
              Not yet…
            </button>
          </div>

          {giftConfirmed === false && (
            <div
              className="mt-4 rounded-xl p-4 text-sm text-center"
              style={{
                background:
                  "color-mix(in srgb, #f59e0b 8%, var(--bg-page))",
                border: "1px solid color-mix(in srgb, #f59e0b 20%, transparent)",
                color: "#fbbf24",
              }}
            >
              <p className="mb-3">
                Ask Pavel — he&apos;s holding it. 📦 Come back and confirm when you have it!
              </p>
              <button
                onClick={() => setStep("selfie")}
                className="text-xs underline underline-offset-2"
                style={{ color: "var(--color-muted)" }}
              >
                Skip for now and continue →
              </button>
            </div>
          )}
        </Card>
      </StepCard>
    );
  }

  // ── Step: Selfie ─────────────────────────────────────────────────────────────
  if (step === "selfie") {
    return (
      <StepCard>
        <StepDots current={4} />
        <Card>
          <div className="text-center mb-8">
            <div className="text-5xl mb-6">📸</div>
            <h2
              className="text-xl font-bold mb-3"
              style={{ color: "var(--color-text)" }}
            >
              Now take a selfie with your gift!
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>
              This goes in your personal vault album. You can choose to share it with the crew later — but it starts as yours alone.
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="user"
            onChange={handleSelfieChange}
            className="hidden"
          />

          {selfiePreview ? (
            <div className="relative mb-6 rounded-xl overflow-hidden aspect-square">
              <Image
                src={selfiePreview}
                alt="Your selfie"
                fill
                className="object-cover"
              />
              <button
                onClick={() => {
                  setSelfieFile(null);
                  setSelfiePreview(null);
                }}
                className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
              >
                <X size={14} className="text-white" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-video rounded-xl flex flex-col items-center justify-center gap-3 mb-6 transition-colors"
              style={{
                backgroundColor: "var(--bg-page)",
                border: "2px dashed var(--color-border)",
                color: "var(--color-muted)",
              }}
            >
              <Camera size={28} />
              <span className="text-sm">Tap to take a selfie or upload a photo</span>
            </button>
          )}

          {uploadError && (
            <p className="text-xs mb-4 text-center" style={{ color: "#f87171" }}>
              {uploadError}
            </p>
          )}

          <div className="flex flex-col gap-3">
            <button
              onClick={() => finishOnboarding(false)}
              disabled={!selfieFile || uploading || saving}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-opacity disabled:opacity-50"
              style={{
                backgroundColor: "var(--color-accent)",
                color: "var(--bg-page)",
              }}
            >
              {uploading || saving ? (
                "Uploading…"
              ) : (
                <>
                  <Upload size={14} />
                  Save selfie &amp; enter the vault
                </>
              )}
            </button>

            <button
              onClick={() => finishOnboarding(true)}
              disabled={saving}
              className="text-sm underline underline-offset-2 transition-opacity"
              style={{ color: "var(--color-muted)" }}
            >
              Skip — I&apos;ll add a photo later
            </button>
          </div>
        </Card>
      </StepCard>
    );
  }

  // ── Step: Done ───────────────────────────────────────────────────────────────
  if (step === "done") {
    return (
      <StepCard>
        <Card>
          <div className="text-center py-6">
            <div className="text-6xl mb-6">🔓</div>
            <h2
              className="text-2xl font-bold mb-3"
              style={{ color: "var(--color-text)" }}
            >
              You&apos;re in, {crew.nickname}!
            </h2>
            <p className="text-sm leading-relaxed mb-8" style={{ color: "var(--color-muted)" }}>
              The vault is yours. Upload photos, grab booking docs, and see what the rest of the crew is up to.
            </p>

            <div className="grid grid-cols-3 gap-3 mb-8 text-center">
              {[
                { emoji: "📸", label: "Your album" },
                { emoji: "🌍", label: "Crew album" },
                { emoji: "📄", label: "Booking docs" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl p-4"
                  style={{
                    backgroundColor: "var(--bg-page)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <div className="text-2xl mb-1">{item.emoji}</div>
                  <div className="text-xs" style={{ color: "var(--color-muted)" }}>
                    {item.label}
                  </div>
                </div>
              ))}
            </div>

            <PrimaryButton onClick={onComplete}>
              <Gift size={14} />
              Open the Vault
            </PrimaryButton>
          </div>
        </Card>
      </StepCard>
    );
  }

  return null;
}
