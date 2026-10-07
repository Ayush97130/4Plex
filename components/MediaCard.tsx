import Image from "next/image";
import Link from "next/link";
import type { Media } from "@/types/media";
import AddToListButton from "./AddToListButton";
import { scheduleRecordEvent } from "@/lib/recommendations";
const img = (p: string | null, s = "w342") => (p ? `https://image.tmdb.org/t/p/${s}${p}` : "/placeholder.svg");

export default function MediaCard({ m }: { m: Media }) {
  return (
    <article className="group relative w-36 shrink-0 sm:w-44 md:w-48">
      <Link href={`/title/${m.type}/${m.id}`} onClick={() => scheduleRecordEvent({ type: "open", contentId: m.id, contentType: m.type, genreIds: m.genreIds, title: m.title })} className="poster-card block overflow-hidden rounded-xl bg-raised shadow-md ring-1 ring-white/5 transition duration-300 group-hover:z-10 group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-black/70 group-focus-within:ring-ember/60">
        <div className="relative aspect-[2/3]">
          <Image src={img(m.poster)} alt={`${m.title} poster`} fill sizes="(max-width:359px) 144px, (max-width:639px) 40vw, (max-width:767px) 176px, 192px" quality={75} loading="lazy" className="object-cover transition-transform duration-700 ease-out group-hover:scale-110" />
          <div className="absolute inset-x-0 bottom-0 z-[1] flex translate-y-2 items-end justify-between p-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-ember font-bold text-ink shadow-lg">▶</span>
            <span className="rounded-md border border-white/20 bg-black/60 px-2 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur">{m.type === "tv" ? "Series" : "Film"}</span>
          </div>
          <span className="absolute left-2 top-2 z-[1] rounded-md border border-white/10 bg-black/65 px-1.5 py-0.5 text-[11px] font-bold backdrop-blur">{m.type === "tv" ? "TV" : "Movie"}</span>
        </div>
      </Link>
      <div className="mt-2 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold">{m.title}</h3>
          <p className="text-xs text-mute">{m.year || "—"} <span className="px-1 text-white/20">•</span> <span className="font-semibold text-ember">★ {m.rating.toFixed(1)}</span></p>
        </div>
        <div className="opacity-100 transition-opacity md:opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"><AddToListButton media={m} compact /></div>
      </div>
    </article>
  );
}
