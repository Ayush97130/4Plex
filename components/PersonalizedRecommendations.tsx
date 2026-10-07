"use client";

import { useEffect, useMemo, useState } from "react";
import ContentRow from "@/components/ContentRow";
import { readEvents, readPreferences, scoreRecommendations } from "@/lib/recommendations";
import type { Media } from "@/types/media";
import type { RecommendationPreferences } from "@/types/recommendations";
import { MovieRowSkeleton } from "./LoadingSkeletons";

export default function PersonalizedRecommendations({ candidates }: { candidates: Media[] }) {
  const [events, setEvents] = useState<ReturnType<typeof readEvents>>([]);
  const [preferences, setPreferences] = useState<RecommendationPreferences>(() => ({ enabled: true, timezone: "Asia/Kolkata", favoriteGenreIds: [] }));
  const [ready, setReady] = useState(false);
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const update = () => { setEvents(readEvents()); setPreferences(readPreferences()); setNow(new Date()); setReady(true); };
    update();
    window.addEventListener("4plex:recommendations-updated", update);
    const interval = window.setInterval(update, 60_000);
    return () => { window.removeEventListener("4plex:recommendations-updated", update); window.clearInterval(interval); };
  }, []);
  const sections = useMemo(() => scoreRecommendations(candidates, events, preferences, now), [candidates, events, preferences, now]);
  if (!ready) return <div aria-busy="true"><MovieRowSkeleton /><MovieRowSkeleton /></div>;
  return <>{sections.map((section) => <section key={section.title} className="relative"><div className="mx-auto max-w-[1500px] px-4 text-sm text-mute md:px-10"><span className="text-ember">✦</span> {section.reason}</div><ContentRow title={section.title} items={section.items} /></section>)}</>;
}
