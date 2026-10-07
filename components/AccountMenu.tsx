"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { DEFAULT_ACCOUNT_PROFILE, readAccountProfile, type AccountProfile } from "@/lib/account";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export default function AccountMenu() {
  const pathname = usePathname();
  const [profile, setProfile] = useState<AccountProfile>(DEFAULT_ACCOUNT_PROFILE);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (pathname === "/auth") return;
    const refresh = () => setProfile(readAccountProfile());
    refresh();
    window.addEventListener("4plex:account-updated", refresh);
    let supabase;
    try {
      supabase = createClient();
    } catch {
      return () => window.removeEventListener("4plex:account-updated", refresh);
    }
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => {
        window.removeEventListener("4plex:account-updated", refresh);
        listener.subscription.unsubscribe();
    };
  }, [pathname]);

  if (pathname === "/auth") return null;

  const displayName = profile.displayName !== DEFAULT_ACCOUNT_PROFILE.displayName
    ? profile.displayName
    : (user?.user_metadata.display_name as string | undefined) || user?.email?.split("@")[0] || "4PLEX";
  const avatar = profile.avatar !== DEFAULT_ACCOUNT_PROFILE.avatar
    ? profile.avatar
    : displayName.slice(0, 1).toUpperCase();

  return (
    <div className="flex items-center gap-2">
        <Link href="/profile" aria-label={`Open profile for ${displayName}`} title={user?.email ?? displayName} className="grid h-9 w-9 place-items-center rounded-full font-bold text-ink shadow-lg transition-transform hover:scale-105" style={{ backgroundColor: profile.accent }}>
            {avatar.slice(0, 2)}
        </Link>
        <button type="button" onClick={async () => { try { await createClient().auth.signOut({ scope: "local" }); } finally { window.location.assign("/auth"); } }} className="hidden rounded-full border border-white/15 bg-white/[.04] px-4 py-2 text-sm font-bold text-bone transition hover:border-ember/60 hover:text-ember sm:block">
          Sign out
        </button>
    </div>
  );
}
