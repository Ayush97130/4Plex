import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PerformanceMonitor from "@/components/PerformanceMonitor";
import AmbientBackground from "@/components/AmbientBackground";
import { defaultDescription, siteName, siteUrl } from "@/lib/seo";
import { SpeedInsights } from "@vercel/speed-insights/next";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: `${siteName} — Movies & TV Shows`, template: `%s | ${siteName}` },
  description: defaultDescription,
  applicationName: siteName,
  openGraph: { type: "website", siteName, title: `${siteName} — Movies & TV Shows`, description: defaultDescription, url: siteUrl },
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
        <SpeedInsights />
      </body>
    </html>
  );
}
