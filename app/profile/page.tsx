import ProfileSettings from "@/components/ProfileSettings";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Profile — 4PLEX", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default function ProfilePage() {
  return (
    <section className="mx-auto max-w-[1500px] px-4 pb-20 pt-24 md:px-10">
      <h1 className="text-3xl font-extrabold tracking-tight">Profile</h1>
      <p className="mt-2 max-w-2xl text-mute">Control what 4PLEX learns, choose your favorite genres, and tune recommendations for your local viewing time.</p>
      <ProfileSettings />
    </section>
  );
}
