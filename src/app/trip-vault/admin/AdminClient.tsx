"use client";

import { useState, useTransition } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  ShieldCheck,
  UserX,
} from "lucide-react";
import {
  addCrewMember,
  updateCrewMember,
  removeCrewMember,
  deleteCrewMember,
  type CrewMember,
} from "./actions";

const PROVIDERS = ["google", "facebook", "email"] as const;
type Provider = (typeof PROVIDERS)[number];

const providerLabel: Record<Provider, string> = {
  google: "Google",
  facebook: "Facebook",
  email: "Magic link",
};
const providerIcon: Record<Provider, string> = {
  google: "🔵",
  facebook: "🟦",
  email: "✉️",
};

// ── Add member form ───────────────────────────────────────────────────────────

function AddMemberForm({ onDone }: { onDone: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await addCrewMember(fd);
        onDone();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl p-5 space-y-4"
      style={{
        backgroundColor: "var(--bg-surface)",
        border: "1px solid var(--color-border)",
      }}
    >
      <h3 className="font-semibold text-sm" style={{ color: "var(--color-text)" }}>
        Add crew member
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          name="email"
          type="email"
          required
          placeholder="email@example.com"
          className="rounded-lg px-3 py-2 text-sm outline-none"
          style={{
            backgroundColor: "var(--bg-page)",
            border: "1px solid var(--color-border)",
            color: "var(--color-text)",
          }}
        />
        <input
          name="display_name"
          type="text"
          required
          placeholder="Display name (e.g. Rupan)"
          className="rounded-lg px-3 py-2 text-sm outline-none"
          style={{
            backgroundColor: "var(--bg-page)",
            border: "1px solid var(--color-border)",
            color: "var(--color-text)",
          }}
        />
        <select
          name="provider"
          required
          className="rounded-lg px-3 py-2 text-sm outline-none"
          style={{
            backgroundColor: "var(--bg-page)",
            border: "1px solid var(--color-border)",
            color: "var(--color-text)",
          }}
        >
          {PROVIDERS.map((p) => (
            <option key={p} value={p}>
              {providerIcon[p]} {providerLabel[p]}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: "var(--color-text)" }}>
          <input type="checkbox" name="is_admin" value="true" className="accent-[var(--color-accent)] w-4 h-4" />
          Grant admin access
        </label>
      </div>

      {error && (
        <p className="text-xs" style={{ color: "#f87171" }}>
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-60"
          style={{ backgroundColor: "var(--color-accent)", color: "var(--bg-page)" }}
        >
          <Plus size={14} />
          {isPending ? "Adding…" : "Add member"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="px-4 py-2 rounded-lg text-sm"
          style={{
            border: "1px solid var(--color-border)",
            color: "var(--color-muted)",
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// ── Inline edit row ───────────────────────────────────────────────────────────

function EditRow({
  member,
  onDone,
}: {
  member: CrewMember;
  onDone: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    fd.set("id", member.id);
    startTransition(async () => {
      try {
        await updateCrewMember(fd);
        onDone();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    });
  }

  return (
    <tr style={{ backgroundColor: "color-mix(in srgb, var(--color-accent) 5%, var(--bg-surface))" }}>
      <td className="px-4 py-3 text-sm" style={{ color: "var(--color-muted)" }}>
        {member.email}
      </td>
      <td className="px-4 py-3">
        <form id={`edit-${member.id}`} onSubmit={handleSubmit} />
        <input
          form={`edit-${member.id}`}
          name="display_name"
          defaultValue={member.display_name}
          className="rounded-lg px-2 py-1 text-sm outline-none w-28"
          style={{
            backgroundColor: "var(--bg-page)",
            border: "1px solid var(--color-border)",
            color: "var(--color-text)",
          }}
        />
      </td>
      <td className="px-4 py-3">
        <select
          form={`edit-${member.id}`}
          name="provider"
          defaultValue={member.provider}
          className="rounded-lg px-2 py-1 text-sm outline-none"
          style={{
            backgroundColor: "var(--bg-page)",
            border: "1px solid var(--color-border)",
            color: "var(--color-text)",
          }}
        >
          {PROVIDERS.map((p) => (
            <option key={p} value={p}>
              {providerLabel[p]}
            </option>
          ))}
        </select>
      </td>
      <td className="px-4 py-3">
        <input
          form={`edit-${member.id}`}
          type="checkbox"
          name="is_admin"
          value="true"
          defaultChecked={member.is_admin}
          className="accent-[var(--color-accent)] w-4 h-4"
        />
      </td>
      <td className="px-4 py-3">
        <input
          form={`edit-${member.id}`}
          type="checkbox"
          name="is_active"
          value="true"
          defaultChecked={member.is_active}
          className="accent-[var(--color-accent)] w-4 h-4"
        />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            type="submit"
            form={`edit-${member.id}`}
            disabled={isPending}
            className="p-1.5 rounded-lg"
            style={{ color: "var(--color-accent)" }}
            title="Save"
          >
            <Check size={14} />
          </button>
          <button
            type="button"
            onClick={onDone}
            className="p-1.5 rounded-lg"
            style={{ color: "var(--color-muted)" }}
            title="Cancel"
          >
            <X size={14} />
          </button>
        </div>
        {error && (
          <p className="text-xs mt-1" style={{ color: "#f87171" }}>
            {error}
          </p>
        )}
      </td>
    </tr>
  );
}

// ── Read-only row ─────────────────────────────────────────────────────────────

function MemberRow({ member }: { member: CrewMember }) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (editing) {
    return <EditRow member={member} onDone={() => setEditing(false)} />;
  }

  return (
    <tr
      style={{
        opacity: member.is_active ? 1 : 0.5,
        borderTop: "1px solid var(--color-border)",
      }}
    >
      <td className="px-4 py-3 text-sm" style={{ color: "var(--color-text)" }}>
        {member.email}
      </td>
      <td className="px-4 py-3 text-sm font-medium" style={{ color: "var(--color-text)" }}>
        {member.display_name}
        {member.is_admin && (
          <ShieldCheck
            size={12}
            className="inline ml-1 mb-0.5"
            style={{ color: "var(--color-accent)" }}
            aria-label="Admin"
          />
        )}
      </td>
      <td className="px-4 py-3 text-sm" style={{ color: "var(--color-muted)" }}>
        {providerIcon[member.provider]} {providerLabel[member.provider]}
      </td>
      <td className="px-4 py-3 text-center">
        {member.is_admin ? (
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "color-mix(in srgb, var(--color-accent) 15%, transparent)", color: "var(--color-accent)" }}>
            Admin
          </span>
        ) : (
          <span className="text-xs" style={{ color: "var(--color-muted)" }}>—</span>
        )}
      </td>
      <td className="px-4 py-3 text-center">
        {member.is_active ? (
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "color-mix(in srgb, #22c55e 15%, transparent)", color: "#22c55e" }}>
            Active
          </span>
        ) : (
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "color-mix(in srgb, #6b7280 15%, transparent)", color: "#6b7280" }}>
            Inactive
          </span>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setEditing(true)}
            className="p-1.5 rounded-lg transition-colors hover:opacity-70"
            style={{ color: "var(--color-muted)" }}
            title="Edit"
          >
            <Pencil size={14} />
          </button>
          {member.is_active ? (
            <button
              onClick={() =>
                startTransition(() => removeCrewMember(member.id))
              }
              disabled={isPending}
              className="p-1.5 rounded-lg transition-colors hover:opacity-70"
              style={{ color: "#f87171" }}
              title="Deactivate"
            >
              <UserX size={14} />
            </button>
          ) : (
            <button
              onClick={() => {
                if (confirm(`Permanently delete ${member.email}? This cannot be undone.`)) {
                  startTransition(() => deleteCrewMember(member.id));
                }
              }}
              disabled={isPending}
              className="p-1.5 rounded-lg transition-colors hover:opacity-70"
              style={{ color: "#f87171" }}
              title="Delete permanently"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

// ── Main AdminClient ──────────────────────────────────────────────────────────

export default function AdminClient({
  initialMembers,
}: {
  initialMembers: CrewMember[];
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const members = initialMembers; // server revalidates on mutation

  return (
    <div className="space-y-6">
      {/* Add button */}
      <div className="flex justify-end">
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium"
            style={{ backgroundColor: "var(--color-accent)", color: "var(--bg-page)" }}
          >
            <Plus size={14} />
            Add crew member
          </button>
        )}
      </div>

      {/* Add form */}
      {showAddForm && (
        <AddMemberForm onDone={() => setShowAddForm(false)} />
      )}

      {/* Table */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: "1px solid var(--color-border)" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left" style={{ backgroundColor: "var(--bg-surface)" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                {["Email", "Name", "Login method", "Role", "Status", "Actions"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "var(--color-muted)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {members.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-sm"
                    style={{ color: "var(--color-muted)" }}
                  >
                    No crew members yet. Add the first one above.
                  </td>
                </tr>
              ) : (
                members.map((m) => <MemberRow key={m.id} member={m} />)
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-center" style={{ color: "var(--color-muted)" }}>
        Deactivating a member signs them out on their next visit. Deleting is permanent.
      </p>
    </div>
  );
}
