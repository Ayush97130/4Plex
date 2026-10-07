import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PerformanceMonitor from "@/components/PerformanceMonitor";
import AmbientBackground from "@/components/AmbientBackground";
import { defaultDescription, siteName } from "@/lib/seo";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });
export const metadata: Metadata = {
  metadataBase: new URL("https://4-plex.vercel.app"),
  title: { default: "4PLEX", template: "%s | 4PLEX" },
  description: defaultDescription,
  applicationName: siteName,
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName, title: "4PLEX", description: defaultDescription, url: "https://4-plex.vercel.app/" },
  twitter: { card: "summary", title: `${siteName} — Movies & TV Shows`, description: defaultDescription },
  verification: process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : undefined,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={manrope.variable}>
      <body className="font-sans min-h-screen flex flex-col">
        <AmbientBackground />
        <PerformanceMonitor />
        <Navbar />
        <main className="flex-1 pb-20 md:pb-0">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
