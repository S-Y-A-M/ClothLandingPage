import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import AmbientCursor from "./components/ambient-cursor";
import SmoothScroll from "./components/smooth-scroll";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ATELIER. — Considered pieces, made yours",
  description:
    "Discover considered fashion and preview your selected Atelier piece with a private AI-powered virtual try-on.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SmoothScroll />
        <AmbientCursor />
        {children}
      </body>
    </html>
  );
}
