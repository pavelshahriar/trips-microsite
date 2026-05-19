"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Trophy } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/itinerary", label: "Itinerary" },
  { href: "/matches", label: "Matches" },
  { href: "/venues", label: "Venues" },
  { href: "/crew", label: "Crew" },
  { href: "/news", label: "News" },
  { href: "/trip-vault", label: "Trip Vault" },
];

export default function NavBar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md"
      style={{
        backgroundColor: "var(--bg-nav)",
        borderBottom: "1px solid var(--color-nav-border, rgba(255,255,255,0.06))",
        transition: "background-color 0.3s ease",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 group"
            onClick={() => setMenuOpen(false)}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg flex-shrink-0"
              style={{ background: "var(--color-accent-dark)" }}
            >
              <Trophy size={16} style={{ color: "var(--color-accent-dark-text)" }} strokeWidth={2.5} />
            </div>
            <span className="font-bold text-sm sm:text-base" style={{ color: "var(--color-nav-text)" }}>
              WC26{" "}
              <span style={{ color: "var(--color-accent-dark)" }}>The Boys</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              const isVault = link.href === "/trip-vault";
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                  style={{
                    color: isActive
                      ? "var(--color-nav-active)"
                      : "var(--color-nav-link)",
                    background: isActive
                      ? "rgba(255,255,255,0.08)"
                      : "transparent",
                    border: isVault
                      ? "1px solid rgba(255,255,255,0.15)"
                      : "none",
                    marginLeft: isVault ? "8px" : "0",
                  }}
                >
                  {isVault ? `🔒 ${link.label}` : link.label}
                </Link>
              );
            })}
          </nav>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg transition-colors"
            style={{ color: "var(--color-nav-link)" }}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden"
            style={{
              backgroundColor: "var(--bg-nav-mobile)",
              borderTop: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <nav className="px-4 py-3 flex flex-col gap-1">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                const isVault = link.href === "/trip-vault";
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200"
                    style={{
                      color: isActive ? "var(--color-nav-active)" : "var(--color-nav-link)",
                      background: isActive ? "rgba(255,255,255,0.08)" : "transparent",
                      border: isVault ? "1px solid rgba(255,255,255,0.15)" : "none",
                    }}
                  >
                    {isVault ? `🔒 ${link.label}` : link.label}
                  </Link>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
