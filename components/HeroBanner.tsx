"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Media } from "@/types/media";
import AddToListButton from "./AddToListButton";
import { ambientImage, publishAmbient } from "@/lib/ambient";

export default function HeroBanner({ items }: { items: Media[] }) {
  const [i, setI] = useState(0);
  useEffect(() => { if (items.length < 2) return; const t = setInterval(() => setI((x) => (x + 1) % items.length), 9000); return () => clearInterval(t); }, [items.length]);
  useEffect(() => { publishAmbient(ambientImage(items[i]?.backdrop ?? null, items[i]?.poster ?? null)); }, [i, items]);
  if (!items.length) return null;
  return (
    <section aria-label="Featured" className="relative h-[72vh] min-h-[500px] w-full overflow-hidden">
      {items.map((m, idx) => (
        <div key={`${m.type}-${m.id}`} aria-hidden={idx !== i} className={`absolute inset-0 transition-opacity duration-1000 ${idx === i ? "opacity-100" : "pointer-events-none opacity-0"}`}>
          <Image src={`https://image.tmdb.org/t/p/w1280${m.backdrop}`} alt="" fill priority={idx === 0} quality={75} sizes="(max-width: 640px) 100vw, (max-width: 1280px) 100vw, 1536px" className={`object-cover object-top transition-transform duration-[12000ms] ease-out ${idx === i ? "scale-105" : "scale-100"}`} />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/30 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[1500px] px-4 pb-20 md:px-10">
            <div className="max-w-2xl">
              <p className="mb-4 flex flex-wrap items-center gap-3 text-sm font-semibold text-bone/90">
                  <span className="rounded-md bg-ember px-2 py-1 text-xs font-extrabold text-ink shadow-lg shadow-ember/10">★ {m.rating.toFixed(1)}</span>
                  <span>{m.year}</span><span className="rounded border border-white/20 px-2 py-0.5 text-xs">{m.type === "tv" ? "TV Series" : "Movie"}</span>
                  <span className="text-mute">4PLEX ORIGINALS</span>
              </p>
              <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight md:text-6xl">{m.title}</h1>
              <p className="mt-4 line-clamp-3 text-base text-bone/80 md:text-lg">{m.overview}</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href={`/watch/${m.type}/${m.id}`} className="motion-lift motion-glow min-h-11 rounded-lg bg-ember px-6 py-3 font-bold text-ink shadow-lg shadow-ember/20 transition hover:brightness-110">▶ Watch Now</Link>
                <Link href={`/title/${m.type}/${m.id}`} className="motion-lift min-h-11 rounded-lg border border-white/15 bg-white/10 px-5 py-3 font-semibold backdrop-blur transition hover:bg-white/20">ⓘ More Info</Link>
                <AddToListButton media={m} />
              </div>
            </div>
          </div>
        </div>
      ))}
      {items.length > 1 && (
        <div className="absolute bottom-7 right-4 flex items-center gap-2 md:right-10">
          {items.map((m, idx) => (
            <button key={`${m.type}-${m.id}`} onClick={() => setI(idx)} aria-label={`Show featured title ${idx + 1}`} aria-current={idx === i}
              className={`h-1.5 rounded-full transition-all ${idx === i ? "w-10 bg-ember" : "w-1.5 bg-white/50 hover:bg-white"}`} />
          ))}
        </div>
      )}
    </section>
  );
}
