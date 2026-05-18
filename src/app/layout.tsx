import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import ThemeProvider from "@/components/ThemeProvider";
import ThemePicker from "@/components/ThemePicker";

export const metadata: Metadata = {
  title: "WC26 The Boys Trip",
  description:
    "Atlanta to NYC. Football, food, roads, and old friends. A FIFA World Cup 2026 road trip microsite.",
  keywords: ["FIFA World Cup 2026", "road trip", "friends", "football", "WC26"],
  authors: [{ name: "The Boys" }],
  openGraph: {
    title: "WC26 The Boys Trip",
    description: "Atlanta to NYC. Football, food, roads, and old friends.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "WC26 The Boys Trip",
    description: "Atlanta to NYC. Football, food, roads, and old friends.",
  },
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="default">
      <body className="antialiased" style={{ minHeight: "100vh" }}>
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
