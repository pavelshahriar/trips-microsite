import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import ThemeProvider from "@/components/ThemeProvider";
import ThemePicker from "@/components/ThemePicker";

export const metadata: Metadata = {
  title: "WC26 The Arena",
  description:
    "FIFA World Cup 2026 — predictions, match day picks, leaderboard and more. Join the crew.",
  keywords: ["FIFA World Cup 2026", "WC26", "predictions", "football", "The Arena", "road trip"],
  authors: [{ name: "The Boys" }],
  openGraph: {
    title: "WC26 The Arena",
    description: "FIFA World Cup 2026 — predictions, match day picks, leaderboard and more. Join the crew.",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/banner-1200x630.jpg",
        width: 1200,
        height: 630,
        alt: "WC26 The Arena",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "WC26 The Arena",
    description: "FIFA World Cup 2026 — predictions, match day picks, leaderboard and more.",
    images: ["/banner-1200x630.jpg"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon-192.png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="default" suppressHydrationWarning>
      <body className="antialiased" style={{ minHeight: "100vh" }} suppressHydrationWarning>
        <ThemeProvider>
          <NavBar />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <ThemePicker />
        </ThemeProvider>
      </body>
    </html>
  );
}
