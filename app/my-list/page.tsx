"use client";
import { useMyList } from "@/hooks/useMyList";
import MediaCard from "@/components/MediaCard";
import EmptyState from "@/components/EmptyState";
import { MovieGridSkeleton } from "@/components/LoadingSkeletons";

export const dynamic = "force-dynamic";

export default function MyList() {
  const { items, ready } = useMyList();
  const sections = [["My Movies", items.filter((i) => i.type === "movie")], ["My TV Shows", items.filter((i) => i.type === "tv")]] as const;
  return (
    <div className="mx-auto max-w-[1500px] px-4 pt-24 md:px-10">
      <h1 className="text-3xl font-extrabold">My List</h1>
      {!ready && <div className="mt-8"><MovieGridSkeleton count={6} /></div>}
      {ready && !items.length && <EmptyState message="Your list is empty." hint="Tap + on any title to save it here." />}
      {sections.map(([t, list]) => list.length > 0 && (
        <section key={t} className="mt-8"><h2 className="mb-4 text-xl font-bold">{t}</h2>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] gap-4">{list.map((m) => <MediaCard key={`${m.type}-${m.id}`} m={m} />)}</div></section>
      ))}
    </div>
  );
}
