"use client";

import { useEffect, useMemo, useState } from "react";
import { GENRE_NAMES, RECOMMENDATION_EVENTS_KEY, genreProfile, readEvents, readPreferences, savePreferences } from "@/lib/recommendations";
import type { RecommendationPreferences } from "@/types/recommendations";
import { DEFAULT_ACCOUNT_PROFILE, readAccountProfile, saveAccountProfile, type AccountProfile } from "@/lib/account";

const GENRES = Object.entries(GENRE_NAMES).filter(([id]) => ["12", "14", "16", "18", "27", "28", "35", "53", "80", "878", "9648", "10749"].includes(id));

export default function ProfileSettings() {
  const [preferences, setPreferences] = useState<RecommendationPreferences>({ enabled: true, timezone: "Asia/Kolkata", favoriteGenreIds: [] });
  const [events, setEvents] = useState(readEvents);
  const [account, setAccount] = useState<AccountProfile>(DEFAULT_ACCOUNT_PROFILE);
  useEffect(() => { setPreferences(readPreferences()); setEvents(readEvents()); }, []);
  useEffect(() => { setAccount(readAccountProfile()); }, []);
  const profile = useMemo(() => genreProfile(events), [events]);
  const update = (next: RecommendationPreferences) => { setPreferences(next); savePreferences(next); window.dispatchEvent(new Event("4plex:recommendations-updated")); };
  const clearHistory = () => { localStorage.removeItem(RECOMMENDATION_EVENTS_KEY); setEvents([]); window.dispatchEvent(new Event("4plex:recommendations-updated")); };
  const updateAccount = (next: AccountProfile) => { setAccount(next); saveAccountProfile(next); window.dispatchEvent(new Event("4plex:account-updated")); };
  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
      <section className="rounded-2xl border border-white/10 bg-panel/70 p-6 shadow-xl lg:col-span-2">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div><p className="text-xs font-bold uppercase tracking-[.25em] text-ember">Persona</p><h2 className="mt-2 text-2xl font-extrabold">Make your profile yours</h2><p className="mt-2 text-sm text-mute">These local profile details are ready to sync when Supabase authentication is added.</p></div>
          <div className="grid h-16 w-16 place-items-center rounded-full text-xl font-black text-ink shadow-lg" style={{ backgroundColor: account.accent }}>{account.avatar.slice(0, 2)}</div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="text-sm font-semibold">Display name<input value={account.displayName} onChange={(event) => updateAccount({ ...account, displayName: event.target.value })} className="mt-2 block min-h-11 w-full rounded-lg border border-white/10 bg-raised px-3 py-3 text-base text-bone" maxLength={40} /></label>
          <label className="text-sm font-semibold">Username<input value={account.username} onChange={(event) => updateAccount({ ...account, username: event.target.value.replace(/\s/g, "").toLowerCase() })} className="mt-2 block min-h-11 w-full rounded-lg border border-white/10 bg-raised px-3 py-3 text-base text-bone" maxLength={24} /></label>
          <label className="text-sm font-semibold md:col-span-2">Short bio<textarea value={account.bio} onChange={(event) => updateAccount({ ...account, bio: event.target.value })} className="mt-2 block min-h-20 w-full resize-y rounded-lg border border-white/10 bg-raised px-3 py-3 text-bone" maxLength={160} /></label>
          <label className="text-sm font-semibold">Avatar initials<input value={account.avatar} onChange={(event) => updateAccount({ ...account, avatar: event.target.value || "P" })} className="mt-2 block min-h-11 w-full rounded-lg border border-white/10 bg-raised px-3 py-3 text-base uppercase text-bone" maxLength={2} /></label>
          <label className="text-sm font-semibold">Accent color<input type="color" value={account.accent} onChange={(event) => updateAccount({ ...account, accent: event.target.value })} className="mt-2 block h-12 w-full cursor-pointer rounded-lg border border-white/10 bg-raised p-1" /></label>
        </div>
      </section>
      <section className="rounded-2xl border border-white/10 bg-panel/70 p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div><p className="text-xs font-bold uppercase tracking-[.25em] text-ember">Your profile</p><h2 className="mt-2 text-2xl font-extrabold">Personalized recommendations</h2><p className="mt-2 text-sm text-mute">Your viewing signals stay in this browser and improve recommendations over time.</p></div>
          <button type="button" role="switch" aria-checked={preferences.enabled} onClick={() => update({ ...preferences, enabled: !preferences.enabled })} className={`relative h-11 w-16 shrink-0 rounded-full p-1 transition ${preferences.enabled ? "bg-ember" : "bg-white/20"}`}><span className={`absolute top-1.5 h-8 w-8 rounded-full bg-white transition ${preferences.enabled ? "left-7" : "left-1.5"}`} /></button>
        </div>
        <label className="mt-7 block text-sm font-semibold">Timezone<select value={preferences.timezone} onChange={(event) => update({ ...preferences, timezone: event.target.value })} className="mt-2 block w-full rounded-lg border border-white/10 bg-raised px-3 py-3 text-bone"><option value="Asia/Kolkata">India Standard Time (IST)</option><option value="UTC">UTC</option><option value="America/New_York">Eastern Time</option><option value="Europe/London">London</option></select></label>
        <div className="mt-7"><p className="text-sm font-semibold">Favorite genres for cold start</p><div className="mt-3 flex flex-wrap gap-2">{GENRES.map(([id, name]) => { const selected = preferences.favoriteGenreIds.includes(Number(id)); return <button type="button" key={id} onClick={() => update({ ...preferences, favoriteGenreIds: selected ? preferences.favoriteGenreIds.filter((genreId) => genreId !== Number(id)) : [...preferences.favoriteGenreIds, Number(id)] })} className={`rounded-full border px-3 py-1.5 text-sm transition ${selected ? "border-ember bg-ember/15 text-ember" : "border-white/10 bg-white/[.03] text-mute hover:text-bone"}`}>{name}</button>; })}</div></div>
      </section>
      <section className="rounded-2xl border border-white/10 bg-panel/70 p-6 shadow-xl"><p className="text-xs font-bold uppercase tracking-[.25em] text-ember">Learning signals</p><h2 className="mt-2 text-2xl font-extrabold">Genre profile</h2><div className="mt-5 space-y-4">{Object.entries(profile).sort((a, b) => Number(b[1]) - Number(a[1])).slice(0, 7).map(([id, score]) => <div key={id}><div className="mb-1 flex justify-between text-sm"><span>{GENRE_NAMES[Number(id)] ?? "Other"}</span><span className="text-mute">{score}%</span></div><div className="h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-ember transition-all duration-700" style={{ width: `${score}%` }} /></div></div>)}{!Object.keys(profile).length && <p className="text-sm text-mute">Watch a few titles to build your profile.</p>}</div><div className="mt-8 border-t border-white/10 pt-5"><button type="button" onClick={clearHistory} className="rounded-lg border border-red-300/20 px-4 py-2 text-sm font-semibold text-red-200 hover:bg-red-300/10">Clear watch history</button><p className="mt-2 text-xs text-mute">{events.length} learning events stored locally.</p></div></section>
    </div>
  );
}
