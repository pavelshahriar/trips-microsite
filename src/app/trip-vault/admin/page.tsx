import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase";
import { getCrewMembers } from "./actions";
import AdminClient from "./AdminClient";
import { ShieldCheck } from "lucide-react";

export const metadata = { title: "Admin — Trip Vault" };

export default async function AdminPage() {
  // Double-check admin access on the server (middleware also guards this route)
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/trip-vault/login");
  }

  const email = session.user.email?.toLowerCase() ?? "";
  const { data: crewMember } = await supabase
    .from("vault_crew")
    .select("is_admin")
    .eq("email", email)
    .single();

  if (!crewMember?.is_admin) {
    redirect("/trip-vault");
  }

  // Fetch all crew members (via service role in the action)
  const members = await getCrewMembers();

  return (
    <div className="min-h-screen px-4 py-16 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-10">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background: "color-mix(in srgb, var(--color-accent) 12%, transparent)",
            border: "1px solid color-mix(in srgb, var(--color-accent) 30%, transparent)",
          }}
        >
          <ShieldCheck size={20} style={{ color: "var(--color-accent)" }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--color-text)" }}>
            Crew Admin
          </h1>
          <p className="text-sm" style={{ color: "var(--color-muted)" }}>
            Manage who can access Trip Vault and how they sign in.
          </p>
        </div>
      </div>

      {/* Instruction card */}
      <div
        className="rounded-xl p-4 mb-8 text-sm"
        style={{
          backgroundColor: "color-mix(in srgb, var(--color-accent) 7%, var(--bg-surface))",
          border: "1px solid color-mix(in srgb, var(--color-accent) 20%, transparent)",
          color: "var(--color-text)",
        }}
      >
        <strong>How it works:</strong> Each crew member must sign in using exactly the
        method listed here. If they use the wrong method (e.g. Facebook instead of Google)
        they will be rejected and shown which button to use. Add them here first, then
        share the vault link.
      </div>

      <AdminClient initialMembers={members} />
    </div>
  );
}
