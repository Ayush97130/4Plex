import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TmdbNotFoundError, tmdbService } from "@/services/tmdbService";
import ContentRow from "@/components/ContentRow";
import AddToListButton from "@/components/AddToListButton";
import AmbientSource from "@/components/AmbientSource";
import { ambientImage } from "@/lib/ambient";
import { absoluteUrl, siteName } from "@/lib/seo";
import type { Metadata, ResolvingMetadata } from "next";

export async function generateMetadata(
  { params }: { params: { type: string; id: string } },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const id = Number(params.id);
  if ((params.type !== "movie" && params.type !== "tv") || !Number.isInteger(id)) return {};
  try {
    const detail = await tmdbService.detail(params.type, id);
    const title = `${detail.title} — ${siteName}`;
    const description = detail.overview || `Explore ${detail.title} on ${siteName}.`;
    const image = detail.backdrop || detail.poster;
    return {
      title,
      description,
      alternates: { canonical: absoluteUrl(`/title/${params.type}/${id}`) },
      openGraph: { ...(await parent).openGraph, title, description, type: "video.movie", url: absoluteUrl(`/title/${params.type}/${id}`), images: image ? [`https://image.tmdb.org/t/p/w1280${image}`] : undefined },
      twitter: { card: "summary_large_image", title, description, images: image ? [`https://image.tmdb.org/t/p/w1280${image}`] : undefined },
    };
  } catch {
    return {};
  }
}

export default async function Title({ params }: { params: { type: string; id: string } }) {
  const id = Number(params.id);
  if ((params.type !== "movie" && params.type !== "tv") || !Number.isInteger(id)) notFound();
  let d;
  try {
    d = await tmdbService.detail(params.type, id);
  } catch (error) {
    if (error instanceof TmdbNotFoundError) notFound();
    throw error;
  }
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": d.type === "movie" ? "Movie" : "TVSeries",
        name: d.title,
        description: d.overview || undefined,
        dateCreated: d.year || undefined,
        image: d.poster ? `https://image.tmdb.org/t/p/w500${d.poster}` : undefined,
      }) }} />
      <AmbientSource image={ambientImage(d?.backdrop ?? null, d?.poster ?? null)} />
      <div className="relative h-[42vh] min-h-[260px] md:h-[52vh] md:min-h-[320px]">
        {d?.backdrop && <Image src={`https://image.tmdb.org/t/p/w1280${d.backdrop}`} alt="" fill priority quality={75} sizes="(max-width: 640px) 100vw, (max-width: 1280px) 100vw, 1536px" className="object-cover object-top" />}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/20" />
      </div>
      <div className="relative z-10 mx-auto -mt-24 flex max-w-[1500px] flex-col gap-6 px-4 md:-mt-40 md:flex-row md:gap-8 md:px-10">
        {d?.poster && <Image src={`https://image.tmdb.org/t/p/w500${d.poster}`} alt={`${d?.title ?? "Title"} poster`} width={260} height={390} quality={80} sizes="(max-width: 639px) 144px, (max-width: 767px) 176px, 256px" className="w-36 self-center rounded-xl shadow-2xl shadow-black/60 sm:w-44 md:w-64" />}
        <div className="flex-1">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">{d?.title ?? "Untitled"}</h1>
          {d?.tagline && <p className="mt-1 text-mute italic">{d.tagline}</p>}
          <p className="mt-3 flex flex-wrap gap-x-4 text-sm font-semibold"><span className="text-ember">★ {(d?.rating ?? 0).toFixed(1)}</span><span>{d?.year || "—"}</span>{d?.runtime && <span>{d.runtime}</span>}{d?.seasons && <span>{d.seasons} season{d.seasons > 1 ? "s" : ""}</span>}<span>{d?.genres?.join(", ") || "Genre unavailable"}</span></p>
          <p className="mt-5 max-w-3xl text-bone/85">{d?.overview || "No overview available."}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={`/watch/${d.type}/${d.id}`} className="min-h-11 rounded-lg bg-ember px-6 py-3 font-bold text-ink hover:brightness-110">▶ Watch Now</Link>
            {d.trailerKey && <a href={`https://www.youtube.com/watch?v=${d.trailerKey}`} target="_blank" rel="noopener noreferrer" className="min-h-11 rounded-lg bg-white/10 px-5 py-3 font-semibold hover:bg-white/20">Trailer</a>}
            <AddToListButton media={d} />
          </div>
        </div>
      </div>
      <section className="mx-auto mt-12 max-w-[1500px]"><h2 className="mb-3 px-4 text-xl font-extrabold md:px-10">Cast</h2>
        <div className="rail flex gap-4 overflow-x-auto px-4 pb-4 md:px-10">
          {(d?.cast ?? []).map((c) => (<div key={c.id} className="w-28 shrink-0 text-center">
            <div className="relative mx-auto h-28 w-28 overflow-hidden rounded-full bg-raised">{c.photo && <Image src={`https://image.tmdb.org/t/p/w185${c.photo}`} alt={c.name} fill sizes="112px" quality={65} className="object-cover" loading="lazy" />}</div>
            <p className="mt-2 truncate text-sm font-semibold">{c.name}</p><p className="truncate text-xs text-mute">{c.character}</p></div>))}
        </div></section>
      <div className="mt-8"><ContentRow title="More Like This" items={d?.similar ?? []} /></div>
    </>
  );
}
