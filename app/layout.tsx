import type { Metadata, Viewport } from "next";
import { Manrope, Geist, Geist_Mono } from "next/font/google";
import MagneticCursor from "@/components/cursor/MagneticCursor";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["800"],
  display: "swap",
});

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  preload: false,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nathaniel Robert Jones — Designer",
  description:
    "Senior visual designer with nearly 20 years of crafting compelling experiences. Available for work.",
};

// viewport-fit: cover lets the page bg extend edge-to-edge into iOS
// safe-area regions (status bar / home indicator). Combined with the
// dynamic <meta name="theme-color"> driven by useColorScheme, the
// status bar + bottom chrome tint with the current section colour
// instead of holding a stale colour from elsewhere on the page.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  // Seed iOS Safari's status-bar / home-indicator tint with the loading
  // sage. useColorScheme then swaps this in JS as the user moves
  // between sections.
  themeColor: "#D7DAAC",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${geist.variable} ${geistMono.variable}`}
    >
      <body className="font-body">
        {children}
        <MagneticCursor />
      </body>
    </html>
  );
}
