import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { MainLayout } from "@/components/layout/MainLayout";
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
  metadataBase: new URL("https://vera-val.fayq.my.id"),
  title: {
    default: "VeraVal — Track Your Anime Journey",
    template: "%s | VeraVal",
  },
  description:
    "A simpler, cleaner alternative to MyAnimeList. Track, discover, and enjoy anime your way.",
  keywords: ["anime", "tracker", "myanimelist", "veraval", "anime list"],
  icons: {
    icon: "/VeraValIcon.svg",
  },
  openGraph: {
    title: "VeraVal — Track Your Anime Journey",
    description: "A simpler, cleaner alternative to MyAnimeList. Track, discover, and enjoy anime your way.",
    url: "https://vera-val.fayq.my.id",
    siteName: "VeraVal",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "VeraVal — Track Your Anime Journey",
    description: "A simpler, cleaner alternative to MyAnimeList. Track, discover, and enjoy anime your way.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark`}
      suppressHydrationWarning
    >
      <body className="antialiased">
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              <MainLayout>{children}</MainLayout>
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
