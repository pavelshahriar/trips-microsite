import Link from "next/link";
import { Trophy, Github } from "lucide-react";
import { TRIP_META } from "@/data/trip";

export default function Footer() {
  return (
    <footer
      className="mt-20"
      style={{
        backgroundColor: "var(--bg-footer)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        transition: "background-color 0.3s ease",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: "var(--color-accent)" }}
            >
              <Trophy size={18} style={{ color: "var(--color-accent-text)" }} strokeWidth={2.5} />
            </div>
            <div>
              <div className="font-bold" style={{ color: "var(--color-nav-text)" }}>
                WC26 The Boys Trip
              </div>
              <div className="text-xs" style={{ color: "var(--color-nav-link)" }}>
                June 11–20, 2026
              </div>
            </div>
          </div>

          {/* Route */}
          <div className="text-center">
            <p className="text-xs mb-1" style={{ color: "var(--color-nav-link)", opacity: 0.6 }}>
              The Route
            </p>
            <p className="text-sm" style={{ color: "var(--color-nav-link)" }}>
              ATL → NOLA → HOU → DAL → KC → DC → PHL → NYC
            </p>
          </div>

          {/* Links */}
          <div className="flex items-center gap-4">
            <Link
              href={TRIP_META.repo}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm transition-colors"
              style={{ color: "var(--color-nav-link)" }}
            >
              <Github size={16} />
              <span>GitHub</span>
            </Link>
            <Link
              href="/trip-vault"
              className="text-sm transition-colors"
              style={{ color: "var(--color-accent)" }}
            >
              🔒 Trip Vault
            </Link>
          </div>
        </div>

        <div
          className="mt-8 pt-6 text-center"
          style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
        >
          <p className="text-xs" style={{ color: "var(--color-nav-link)", opacity: 0.5 }}>
            Made with ❤️ for the boys.
          </p>
          <p className="text-xs" style={{ color: "var(--color-nav-link)", opacity: 0.5 }}>
            2026 © SGHS &apos;99 Boys
          </p>
        </div>
      </div>
    </footer>
  );
}
