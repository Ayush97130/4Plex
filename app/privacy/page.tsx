import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("Privacy Policy — 4PLEX", "How 4PLEX handles account, preference, watch-list, and local browser data.", "/privacy");

export default function PrivacyPage() {
  return <article className="relative z-10 mx-auto max-w-4xl px-4 py-16 md:px-10"><h1 className="text-4xl font-extrabold">Privacy Policy</h1><p className="mt-3 text-sm text-mute">Last updated: October 7, 2026</p>
    <div className="mt-8 space-y-8 text-mute"><section><h2 className="text-2xl font-bold text-bone">Information we handle</h2><p className="mt-2">When you create an account, authentication is handled by Supabase and may include your email address and account profile information. 4PLEX stores the personal list and recommendation/watch activity that the application actually uses. Recommendation history and some list data may be stored in your browser&apos;s local storage.</p></section>
      <section><h2 className="text-2xl font-bold text-bone">How information is used</h2><p className="mt-2">We use this information to authenticate you, show your saved titles, improve discovery, and provide recommendations. Search requests and title metadata are sent to the services needed to provide the requested feature.</p></section>
      <section><h2 className="text-2xl font-bold text-bone">Cookies and third parties</h2><p className="mt-2">Supabase authentication uses cookies required to maintain a session. TMDB supplies metadata and artwork references, and NexStream supplies playback access. These services may process requests under their own policies. No advertising or separate analytics service is configured in this application.</p></section>
      <section><h2 className="text-2xl font-bold text-bone">Retention, security, and your rights</h2><p className="mt-2">Account data is retained while your account is active, subject to the services that store it. You can clear local browser data through your browser settings and request account correction or deletion using the contact page. We use server-side API keys and authenticated service requests, but no online service can guarantee absolute security.</p></section>
      <section><h2 className="text-2xl font-bold text-bone">Updates and contact</h2><p className="mt-2">This policy may change as the application changes. Contact 4PLEX through the contact page with privacy requests. This document is general information and should receive legal review for the jurisdictions in which 4PLEX operates.</p></section>
    </div></article>;
}
