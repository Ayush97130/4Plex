import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("Terms of Service — 4PLEX", "The terms that apply when using the 4PLEX movie and TV discovery application.", "/terms");

export default function TermsPage() {
  return <article className="relative z-10 mx-auto max-w-4xl px-4 py-16 md:px-10"><h1 className="text-4xl font-extrabold">Terms of Service</h1><p className="mt-3 text-sm text-mute">Last updated: October 7, 2026</p><div className="mt-8 space-y-8 text-mute">
    <section><h2 className="text-2xl font-bold text-bone">Using 4PLEX</h2><p className="mt-2">Use 4PLEX lawfully and do not attempt to disrupt, abuse, reverse engineer, scrape, or bypass access controls for the application or its providers.</p></section>
    <section><h2 className="text-2xl font-bold text-bone">Accounts</h2><p className="mt-2">You are responsible for keeping your account credentials secure and for activity performed through your account. We may suspend access when necessary to protect the service or its users.</p></section>
    <section><h2 className="text-2xl font-bold text-bone">Third-party services and content</h2><p className="mt-2">Metadata, artwork, and playback availability may come from third-party services including TMDB and NexStream. Their availability, accuracy, and terms are outside 4PLEX&apos;s control.</p></section>
    <section><h2 className="text-2xl font-bold text-bone">Availability and disclaimers</h2><p className="mt-2">4PLEX is provided as available. Titles, recommendations, and playback may change or be unavailable. Nothing on 4PLEX creates a warranty beyond rights that cannot legally be excluded.</p></section>
    <section><h2 className="text-2xl font-bold text-bone">Changes and contact</h2><p className="mt-2">We may update these terms as the service changes. Continued use after an update means the revised terms apply. Contact 4PLEX through the contact page with questions.</p></section>
  </div></article>;
}
