import type { Metadata } from "next";
import { Geist, Geist_Mono, Manrope } from "next/font/google";
import Script from "next/script";
import AppProviders from "@/providers/AppProviders";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Manrope is the typeface used throughout the Figma welcome design.
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "super app",
  description: "Super app - On-demand services and instant consultation",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${manrope.variable} h-full antialiased`}
    >
      <head>
        <Script
          id="theme-initializer"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              // Light-only: ignore any stored or system dark preference.
              document.documentElement.classList.remove('dark');
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-slate-50 dark:bg-[#0b141a] text-slate-900 dark:text-[#e9edef]">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

