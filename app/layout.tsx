import type { Metadata } from "next";
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
