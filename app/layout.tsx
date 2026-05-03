import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Mekatronika GPA",
  description: "Kalkulator IPS & IPK Mekatronika",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <head>
        {/* 🔥 FORCE LIGHT MODE */}
        <meta name="color-scheme" content="light" />
        <meta name="theme-color" content="#ffffff" />
      </head>

      <body
        style={{
          backgroundColor: "#f9fafb",
          color: "#111827",
          fontFamily: "var(--font-geist-sans)",
        }}
        className="min-h-full flex flex-col"
      >
        {children}
      </body>
    </html>
  );
}