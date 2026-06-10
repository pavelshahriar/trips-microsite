"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase-browser";
import type { User } from "@supabase/supabase-js";
import {
  Download,
  FileText,
  Hotel,
  Plane,
  Ticket,
  Trash2,
  Upload,
  Map,
  File,
} from "lucide-react";
import { getCrewMemberByEmail } from "@/data/vault-crew";

export interface VaultDoc {
  id: string;
  user_id: string;
  uploaded_by: string;
  storage_path: string;
  filename: string;
  doc_type: string;
  created_at: string;
}

interface VaultDocsProps {
  user: User;
  initialDocs: VaultDoc[];
}

const DOC_TYPES = [
  { value: "hotel", label: "Hotel confirmation", Icon: Hotel },
  { value: "flight", label: "Flight booking", Icon: Plane },
  { value: "ticket", label: "Match ticket", Icon: Ticket },
  { value: "itinerary", label: "Itinerary / plan", Icon: Map },
  { value: "other", label: "Other", Icon: FileText },
] as const;

function DocTypeIcon({ type }: { type: string }) {
  const entry = DOC_TYPES.find((d) => d.value === type);
  const Icon = entry?.Icon ?? File;
  return <Icon size={16} />;
}

function DocTypeBadge({ type }: { type: string }) {
  const entry = DOC_TYPES.find((d) => d.value === type);
  const label = entry?.label ?? type;
  return (
    <span
      className="text-xs px-2 py-0.5 rounded-full font-medium"
      style={{
        backgroundColor:
          "color-mix(in srgb, var(--color-accent) 10%, transparent)",
        color: "var(--color-accent)",
        border: "1px solid color-mix(in srgb, var(--color-accent) 20%, transparent)",
      }}
    >
      {label}
    </span>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function UploaderName({ email }: { email: string }) {
  const member = getCrewMemberByEmail(email);
  return <span>{member?.name ?? email}</span>;
}

export default function VaultDocs({ user, initialDocs }: VaultDocsProps) {
  const supabase = createClient();

  const [docs, setDocs] = useState<VaultDoc[]>(initialDocs);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [docType, setDocType] = useState<string>("hotel");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
    setShowForm(true);
    setUploadError(null);
  };

  const resetForm = () => {
    setPendingFile(null);
    setDocType("hotel");
    setShowForm(false);
    setUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUpload = async () => {
    if (!pendingFile) return;
    setUploading(true);
    setUploadError(null);

    const safeFilename = pendingFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${user.id}/${Date.now()}_${safeFilename}`;

    const { error: storageError } = await supabase.storage
      .from("vault-docs")
      .upload(path, pendingFile, { contentType: pendingFile.type });

    if (storageError) {
      setUploadError("Upload failed. Check your connection and try again.");
      setUploading(false);
      return;
    }

    const { data: newRow, error: dbError } = await supabase
      .from("vault_docs")
      .insert({
        user_id: user.id,
        uploaded_by: user.email,
        storage_path: path,
        filename: pendingFile.name,
        doc_type: docType,
      })
      .select()
      .single();

    setUploading(false);

    if (dbError || !newRow) {
      setUploadError("Saved to storage but metadata failed. Try refreshing.");
      return;
    }

    setDocs((prev) => [newRow as VaultDoc, ...prev]);
    resetForm();
  };

  const handleDownload = async (doc: VaultDoc) => {
    setDownloadingId(doc.id);

    const { data, error } = await supabase.storage
      .from("vault-docs")
      .createSignedUrl(doc.storage_path, 60); // 60-second signed URL

    setDownloadingId(null);

    if (error || !data?.signedUrl) {
      alert("Couldn't generate download link. Try again.");
      return;
    }

    const link = document.createElement("a");
    link.href = data.signedUrl;
    link.download = doc.filename;
    link.target = "_blank";
    link.click();
  };

  const handleDelete = async (doc: VaultDoc) => {
    if (doc.user_id !== user.id) return;
    if (!confirm(`Delete "${doc.filename}"?`)) return;

    setDeletingId(doc.id);

    await supabase.storage.from("vault-docs").remove([doc.storage_path]);
    await supabase.from("vault_docs").delete().eq("id", doc.id);

    setDeletingId(null);
    setDocs((prev) => prev.filter((d) => d.id !== doc.id));
  };

  return (
    <div>
      {/* Upload trigger */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.heic,.txt"
        onChange={handleFileChange}
        className="hidden"
      />

      {!showForm && (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium mb-6 transition-colors"
          style={{
            backgroundColor: "var(--bg-page)",
            border: "2px dashed var(--color-border)",
            color: "var(--color-muted)",
          }}
        >
          <Upload size={16} />
          Upload a document
        </button>
      )}

      {/* Upload form */}
      {showForm && pendingFile && (
        <div
          className="rounded-2xl p-5 mb-6 space-y-4"
          style={{
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--color-border)",
          }}
        >
          {/* File info */}
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                backgroundColor: "var(--bg-page)",
                border: "1px solid var(--color-border)",
                color: "var(--color-accent)",
              }}
            >
              <FileText size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-sm font-medium truncate"
                style={{ color: "var(--color-text)" }}
              >
                {pendingFile.name}
              </p>
              <p className="text-xs" style={{ color: "var(--color-muted)" }}>
                {(pendingFile.size / 1024 / 1024).toFixed(1)} MB
              </p>
            </div>
          </div>

          {/* Doc type picker */}
          <div>
            <label
              className="block text-xs font-medium mb-2"
              style={{ color: "var(--color-muted)" }}
            >
              Document type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {DOC_TYPES.map(({ value, label, Icon }) => (
                <button
                  key={value}
                  onClick={() => setDocType(value)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs text-left transition-colors"
                  style={{
                    backgroundColor:
                      docType === value
                        ? "color-mix(in srgb, var(--color-accent) 12%, var(--bg-page))"
                        : "var(--bg-page)",
                    border:
                      docType === value
                        ? "1px solid color-mix(in srgb, var(--color-accent) 30%, transparent)"
                        : "1px solid var(--color-border)",
                    color:
                      docType === value
                        ? "var(--color-accent)"
                        : "var(--color-muted)",
                  }}
                >
                  <Icon size={12} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {uploadError && (
            <p className="text-xs" style={{ color: "#f87171" }}>
              {uploadError}
            </p>
          )}

          <div className="flex gap-3">
            <button
              onClick={resetForm}
              className="flex-1 py-2.5 rounded-xl text-sm transition-colors"
              style={{
                backgroundColor: "var(--bg-page)",
                border: "1px solid var(--color-border)",
                color: "var(--color-muted)",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-opacity disabled:opacity-50"
              style={{
                backgroundColor: "var(--color-accent)",
                color: "var(--bg-page)",
              }}
            >
              {uploading ? "Uploading…" : <><Upload size={13} /> Upload</>}
            </button>
          </div>
        </div>
      )}

      {/* Docs list */}
      {docs.length === 0 ? (
        <div
          className="text-center py-16 rounded-2xl"
          style={{
            backgroundColor: "var(--bg-page)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div className="text-4xl mb-4">📄</div>
          <p className="text-sm" style={{ color: "var(--color-muted)" }}>
            No documents yet. Upload hotel confirmations, tickets, or the itinerary.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {docs.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center gap-3 rounded-xl p-4"
              style={{
                backgroundColor: "var(--bg-surface)",
                border: "1px solid var(--color-border)",
              }}
            >
              {/* Icon */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: "var(--bg-page)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-accent)",
                }}
              >
                <DocTypeIcon type={doc.doc_type} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-medium truncate"
                  style={{ color: "var(--color-text)" }}
                >
                  {doc.filename}
                </p>
                <div
                  className="flex items-center gap-2 mt-1 flex-wrap"
                  style={{ color: "var(--color-muted)" }}
                >
                  <DocTypeBadge type={doc.doc_type} />
                  <span className="text-xs">
                    <UploaderName email={doc.uploaded_by} />
                  </span>
                  <span className="text-xs">{formatDate(doc.created_at)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => handleDownload(doc)}
                  disabled={downloadingId === doc.id}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
                  style={{
                    backgroundColor: "var(--bg-page)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-muted)",
                  }}
                  title="Download"
                >
                  <Download size={14} />
                </button>

                {doc.user_id === user.id && (
                  <button
                    onClick={() => handleDelete(doc)}
                    disabled={deletingId === doc.id}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
                    style={{
                      backgroundColor: "var(--bg-page)",
                      border: "1px solid var(--color-border)",
                      color: "var(--color-muted)",
                    }}
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
