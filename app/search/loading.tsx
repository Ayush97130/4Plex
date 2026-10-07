import { MovieGridSkeleton } from "@/components/LoadingSkeletons";

export default function Loading() {
  return (
    <main className="mx-auto max-w-[1500px] px-4 pb-20 pt-24 md:px-10" aria-busy="true" aria-label="Loading search">
      <div className="h-10 w-40 animate-pulse rounded bg-raised/60" />
      <div className="mt-8"><MovieGridSkeleton count={8} /></div>
    </main>
  );
}
