"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { continueWatchingFromEvents, CONTINUE_WATCHING_UPDATED, type ContinueWatchingEntry } from "@/lib/continueWatching";
import { readEvents } from "@/lib/recommendations";
import { MovieRowSkeleton } from "./LoadingSkeletons";
import { createClient } from "@/lib/supabase/client";

const image = (path: string | null) => path ? `https://image.tmdb.org/t/p/w342${path}` : "/placeholder.svg";

export default function ContinueWatching() {
  const [items, setItems] = useState<ContinueWatchingEntry[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const update = async () => {
      const localItems = continueWatchingFromEvents(readEvents());
      try {
        const { data: { user } } = await createClient().auth.getUser();
        const accountItems = Array.isArray(user?.user_metadata?.continue_watching)
          ? user.user_metadata.continue_watching.filter((item: unknown): item is ContinueWatchingEntry => Boolean(item && typeof item === "object" && "key" in item && "contentId" in item && "contentType" in item && "title" in item && "watchedAt" in item))
          : [];
        const merged = new Map(localItems.map((item) => [item.key, item]));
        accountItems.forEach((item) => {
          if (!merged.has(item.key) || Date.parse(item.watchedAt) > Date.parse(merged.get(item.key)!.watchedAt)) merged.set(item.key, item);
        });
        setItems([...merged.values()].sort((a, b) => Date.parse(b.watchedAt) - Date.parse(a.watchedAt)));
      } catch (error) {
        console.warn("Unable to load account continue watching progress.", error);
        setItems(localItems);
      }
      setReady(true);
    };
    void update();
    window.addEventListener(CONTINUE_WATCHING_UPDATED, update);
    window.addEventListener("4plex:recommendations-updated", update);
    return () => {
      window.removeEventListener(CONTINUE_WATCHING_UPDATED, update);
      window.removeEventListener("4plex:recommendations-updated", update);
    };
  }, []);
  if (!ready) return <div aria-busy="true"><MovieRowSkeleton /></div>;
  if (!items.length) return null;
  return (
    <section aria-labelledby="continue-watching-heading" className="mx-auto max-w-[1500px] px-4 md:px-10">
      <div className="mb-4 flex items-center justify-between">
        <h2 id="continue-watching-heading" className="text-2xl font-extrabold">Continue Watching</h2>
        <span className="text-xs text-mute">{items.length} {items.length === 1 ? "title" : "titles"}</span>
      </div>
      <div className="rail flex gap-4 overflow-x-auto pb-3">
        {items.map((item) => (
          <article key={item.key} className="w-48 shrink-0 sm:w-56">
            <Link href={item.resumeUrl} className="group block overflow-hidden rounded-xl bg-raised ring-1 ring-white/5 focus-visible:ring-ember">
              <div className="relative aspect-video overflow-hidden">
                <Image src={image(item.backdrop || item.poster)} alt="" fill sizes="(max-width: 639px) 192px, 224px" quality={72} className="object-cover transition-transform duration-500 group-hover:scale-105" />
                <span className="absolute bottom-2 left-2 rounded-md bg-black/70 px-2 py-1 text-xs font-bold text-white">Resume</span>
              </div>
              <div className="p-3">
                <h3 className="truncate text-sm font-bold">{item.title}</h3>
                {item.contentType === "tv" && <p className="mt-1 text-xs text-mute">Season {item.season ?? 1} · Episode {item.episode ?? 1}</p>}
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/15" aria-label={`${item.progress}% watched`} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={item.progress}>
                  <div className="h-full rounded-full bg-ember" style={{ width: `${item.progress}%` }} />
                </div>
                <p className="mt-1 text-right text-[11px] text-mute">{item.progress}% watched</p>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
